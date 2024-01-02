import { Request, Response } from "express";

import { fillQueue } from "@/utils/database";

/**
 * This script is designed to run every 6 hours (4 times a day). For each subreddit we source,
 * checks if we have enough posts in the queue; if more posts are needed, it sources them from
 * Reddit and adds them to the queue.
 *
 * @param request The request from the cronjob service.
 * @returns An HTTP response according to the success state of the request.
 */
const refillQueue = async (request: Request, response: Response) => {
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ message: "Unauthorized" });
  }
  const fillQueueResult = await fillQueue("week", 6);

  return response
    .status(fillQueueResult.status)
    .json({ message: fillQueueResult.message });
};

export { refillQueue };
