import type { NextRequest } from "next/server";

import snoo, {
  getINEPostInfo,
  getPostUrlFromSubmission,
} from "../../../../utils/reddit";
import { POSTS_PER_SUBREDDIT } from "@/constants";
import {
  getAllSubredditDisplayNames,
  getQueueItemsBySubredditCount,
  pushToQueue,
} from "@/utils/database";

/**
 * This script is designed to run every 6 hours (4 times a day). For each subreddit we source,
 * checks if we have enough posts in the queue; if more posts are needed, it sources them from
 * Reddit and adds them to the queue.
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

  try {
    for (const subredditDisplayName of await getAllSubredditDisplayNames()) {
      let queueItemsForSubredditCount = await getQueueItemsBySubredditCount(
        subredditDisplayName
      );
      if (queueItemsForSubredditCount >= POSTS_PER_SUBREDDIT) {
        console.log(
          "Queue already full for subreddit: " + subredditDisplayName
        );
        continue;
      }
      const topPostsOfTheWeek = await snoo
        .getSubreddit(subredditDisplayName)
        .getTop({ time: "week", limit: 6 });
      let lastIndexTried = 0;

      while (queueItemsForSubredditCount < POSTS_PER_SUBREDDIT) {
        try {
          console.log(
            "Attempting to insert " +
              getPostUrlFromSubmission(topPostsOfTheWeek[lastIndexTried]) +
              " into DB..."
          );
          await pushToQueue(
            await getINEPostInfo(topPostsOfTheWeek[lastIndexTried])
          );
          queueItemsForSubredditCount++;
          console.log("Attempt success.");
        } catch (error) {
          console.log("Error: " + (error as any).message);
        } finally {
          lastIndexTried++;
          console.log();
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong. Error: " + (error as any).message);
    return new Response(
      "Something went wrong. Error: " + (error as any).message,
      {
        status: 500,
      }
    );
  }

  return Response.json({ success: true });
};

export { GET };
