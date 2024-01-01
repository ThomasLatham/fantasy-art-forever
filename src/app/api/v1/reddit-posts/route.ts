import type { NextRequest } from "next/server";

import { fillQueue } from "@/utils/database";

/**
 * This script is designed to run every 6 hours (4 times a day). For each subreddit we source,
 * checks if we have enough posts in the queue; if more posts are needed, it sources them from
 * Reddit and adds them to the queue.
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

  return await fillQueue("week", 6);
};

export { POST };
