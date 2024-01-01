import type { NextRequest } from "next/server";
import { IgApiClient } from "instagram-private-api";
import { get } from "request-promise";
import { DateTime } from "luxon";

import prisma from "@/utils/database";
import { POSTING_TIMES } from "@/constants";

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

  if (DateTime.now().hour < POSTING_TIMES[0]) {
    try {
      if (
        (await prisma.persistedValuesRecord.findMany({ where: {} }))[0]
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
  } else if (DateTime.now().hour > POSTING_TIMES[POSTING_TIMES.length - 1]) {
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
 * This script is designed to run once a day for posting to Instagram.
 *
 * @param request The request from the cronjob service.
 * @returns An HTTP response according to the success state of the request.
 */
const GET = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // get the posting schedule details for today
  const postingScheduleDetailsForToday =
    await prisma.postingScheduleDay.findUnique({
      where: { id: DateTime.now().setZone("America/New_York").weekday % 7 },
    });

  if (!postingScheduleDetailsForToday) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  // get the next subreddit from which to source
  let indexOfSubredditForToday: number;
  const subredditForToday = ((): string => {
    if (postingScheduleDetailsForToday.isCyclicalRotation) {
      indexOfSubredditForToday =
        (postingScheduleDetailsForToday.lastSourcedSubreddit + 1) %
        postingScheduleDetailsForToday.subredditDisplayNames.length;
    } else {
      indexOfSubredditForToday =
        postingScheduleDetailsForToday.lastSourcedSubreddit;
      while (
        indexOfSubredditForToday ===
        postingScheduleDetailsForToday.lastSourcedSubreddit
      ) {
        indexOfSubredditForToday = Math.floor(
          Math.random() *
            postingScheduleDetailsForToday.subredditDisplayNames.length
        );
      }
    }
    return postingScheduleDetailsForToday.subredditDisplayNames[
      indexOfSubredditForToday
    ];
  })();

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

  return Response.json({ success: true });
};

export { PUT, GET };
