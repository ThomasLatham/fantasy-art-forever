import type { NextRequest } from "next/server";
import { IgApiClient } from "instagram-private-api";
import { get } from "request-promise";
import { PersistedValuesRecord } from "@prisma/client";

import prisma, {
  getQueueItemsBySubreddit,
  getSubredditForToday,
} from "@/utils/database";
import { POSTING_TIMES } from "@/constants";
import { now } from "@/utils/general";

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

  const idsOfFailedPosts: string[] = [];

  const queueItemsForSubredditForTodayOrdered = (
    await getQueueItemsBySubreddit(subredditForToday)
  ).toSorted((a, b) => {
    if (!a.isBackup || !b.isBackup) {
      return +!a.isBackup - +!b.isBackup;
    } else {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // post to Instagram
  if (!(process.env.IG_USERNAME && process.env.IG_PASSWORD)) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  const auth = await ig.account.login(
    process.env.IG_USERNAME,
    process.env.IG_PASSWORD
  );
  console.log(JSON.stringify(auth));

  // getting random square image from internet as a Buffer
  const imageBuffer = await get({
    url: "https://picsum.photos/800/800", // random picture with 800x800 size
    encoding: null, // this is required, only this way a Buffer is returned
  });

  const publishResult = await ig.publish.photo({
    file: imageBuffer, // image buffer, you also can specify image from your disk using fs
    caption: "Really nice photo from the internet! 💖", // nice caption (optional)
  });

  console.log(publishResult); // publishResult.status should be "ok"

  //#endregion

  return Response.json({ success: true });
};

export { PUT, POST };
