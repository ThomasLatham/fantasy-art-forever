import type { NextRequest } from "next/server";
import { PersistedValuesRecord } from "@prisma/client";

import prisma, {
  getQueueItemsBySubredditSorted,
  getSubredditForToday,
} from "@/utils/database";
import { POSTING_TIMES } from "@/constants";
import { now } from "@/utils/general";
import { createInstagramPost } from "@/utils/instagram";

/**
 * This script is designed to run every day 3 times before the earliest posting time and three times
 * after the latest. In the before-runs, it randomly sets the coming day's posting time, and with
 * two potential try-agains to help ensure success of the scripts goal. In the after-runs, it resets
 * the value of `hasPostingTimeBeenUpdatedToday` to false.
 *
 * @param request The request from the cronjob service.
 * @returns An HTTP response according to the success state of the request.
 */
const PUT = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  if (now().hour < POSTING_TIMES[0]) {
    try {
      if (
        (await prisma.persistedValuesRecord.findFirst({ where: {} }))!
          .hasPostingTimeBeenUpdatedToday
      ) {
        return new Response(
          "Accepted: Posting time has already been updated today.",
          {
            status: 202,
          }
        );
      }
      await prisma.persistedValuesRecord.updateMany({
        where: {},
        data: {
          postingTimeForToday: Math.floor(Math.random() * POSTING_TIMES.length),
          hasPostingTimeBeenUpdatedToday: true,
        },
      });
      return new Response("Success", {
        status: 200,
      });
    } catch (error) {
      return new Response(
        "Internal Server Error: Could not set posting time for today.",
        {
          status: 500,
        }
      );
    }
  } else if (now().hour > POSTING_TIMES[POSTING_TIMES.length - 1]) {
    try {
      await prisma.persistedValuesRecord.updateMany({
        where: {},
        data: {
          hasPostingTimeBeenUpdatedToday: false,
        },
      });
      return new Response("Success", {
        status: 200,
      });
    } catch (error) {
      return new Response(
        "Internal Server Error: Could not set posting time for today.",
        {
          status: 500,
        }
      );
    }
  } else {
    return new Response(
      "Bad Request: Endpoint does not take requests at this time of day.",
      {
        status: 400,
      }
    );
  }
};

/**
 * The script for posting to Instagram. Only posts once a day, but gets called throughout the day to
 * account for randomized posting times and the chance of failure.
 *
 * @param request The request from the cronjob service.
 * @returns An HTTP response according to the success state of the request.
 */
const POST = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  let persistedValuesRecord: PersistedValuesRecord | null;

  //#region POSTING-TIME CHECK

  try {
    persistedValuesRecord = await prisma.persistedValuesRecord.findFirst({
      where: {},
    });
    if (!persistedValuesRecord) {
      return new Response(
        "Internal Server Error: Could not get today's posting time.",
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    return new Response(
      "Internal Server Error: Could not get today's posting time.",
      {
        status: 500,
      }
    );
  }

  // reset the posting flag if it's a new day and before the first posting time
  if (now().hour < POSTING_TIMES[0]) {
    await prisma.persistedValuesRecord.update({
      where: { id: persistedValuesRecord.id },
      data: { hasPostBeenMadeToday: false },
    });
    console.log("Flag `hasPostBeenMadeToday` set to `false`.");
  }

  // make sure we handle the request only after posting time and if a post hasn't already been made
  // today
  if (
    now().hour < persistedValuesRecord.postingTimeForToday ||
    persistedValuesRecord.hasPostBeenMadeToday
  ) {
    return new Response(
      "Accepted: No action taken, as it is not yet posting time, or a post has already been made today.",
      {
        status: 202,
      }
    );
  }

  //#endregion

  // get the posting schedule details for today
  const postingScheduleDetailsForToday =
    await prisma.postingScheduleDay.findUnique({
      where: { id: now().weekday % 7 },
    });

  if (!postingScheduleDetailsForToday) {
    return new Response(
      "Internal Server Error: Could not get posting schedule details.",
      {
        status: 500,
      }
    );
  }

  // get the next subreddit from which to source
  const { subredditForToday, indexOfSubredditForToday } =
    await getSubredditForToday(postingScheduleDetailsForToday);

  //#region ATTEMPT TO POST

  // declare some variable to keep track of
  const idsOfFailedPosts: string[] = [];
  let instagramUploadId: string = "";
  let successfulRedditPostId: string = "";

  // get the queue items for today's subreddit
  const queueItemsForSubredditForTodayOrdered =
    await getQueueItemsBySubredditSorted(subredditForToday);

  // try to submit exactly one of them
  for (const queueItemToTry of queueItemsForSubredditForTodayOrdered) {
    try {
      instagramUploadId = await createInstagramPost(queueItemToTry);
      if (instagramUploadId) {
        successfulRedditPostId = queueItemToTry.redditPostId;
        break;
      } else {
        console.log(
          "Failed to create Instagram post with Reddit post " +
            queueItemToTry.redditPostId +
            "."
        );
        idsOfFailedPosts.push(queueItemToTry.id);
      }
    } catch (error) {
      console.log(
        "Failed to create Instagram post with Reddit post " +
          queueItemToTry.redditPostId +
          ". Error: " +
          (error as any).message
      );
      idsOfFailedPosts.push(queueItemToTry.id);
    }
  }

  //#region DEQUEUE

  // remove from the queue any successful or failed posts
  const queueItemsToRemove = [];
  queueItemsToRemove.push(...idsOfFailedPosts);
  if (successfulRedditPostId) {
    queueItemsToRemove.push(successfulRedditPostId);
  }
  await prisma.queuedInstagramPost.deleteMany({
    where: {
      OR: queueItemsToRemove.map((idOfFailedPost) => {
        return { id: idOfFailedPost };
      }),
    },
  });
  if (successfulRedditPostId || queueItemsToRemove.length) {
    console.log(
      "Removed the following posts from queue:" +
        (successfulRedditPostId
          ? "\n\tSuccessful Upload: " + successfulRedditPostId
          : "") +
        (idsOfFailedPosts.length
          ? "\n\tFailed Upload: " + idsOfFailedPosts.join(", ")
          : "")
    );
  }

  //#endregion

  // if all the posts failed then send a 500 response
  if (!instagramUploadId) {
    console.log("Failed to upload to Instagram.");
    return new Response(
      "Internal Server Error: Failed to upload to Instagram.",
      {
        status: 500,
      }
    );
  }

  // everything after is if it was successful
  console.log(
    "Instagram post with ID " + instagramUploadId + " created successfully."
  );

  // set the posted-today flag to `true`
  await prisma.persistedValuesRecord.update({
    where: { id: persistedValuesRecord.id },
    data: { hasPostBeenMadeToday: true },
  });

  console.log("Flag `hasPostBeenMadeToday` set to `true`.");

  // try to create the creation record; respond to the request accordingly
  try {
    await prisma.submittedInstagramPost.create({
      data: {
        redditPostId: successfulRedditPostId,
        instagramPostId: instagramUploadId,
      },
    });
    console.log("Creation record created in database.");
    return new Response(
      "Created: Instagram post created successfully, and creation record created in database.",
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Creation record failed to be created in database.");
    return new Response(
      "Multi-Status: Instagram post created successfully, but creation record failed to be created in database.",
      {
        status: 207,
      }
    );
  }

  //#endregion
};

export { PUT, POST };
