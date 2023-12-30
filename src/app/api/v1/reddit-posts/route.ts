import type { NextRequest } from "next/server";
import snoowrap from "snoowrap";

/**
 * This script is designed to run every 6 hours (4 times a day). We want to always have 2 backup
 * posts for every queued post in case there is an issue with a queued post.
 *
 * @param request The request from the cronjob service.
 * @returns An HTTP response according to the success state of the request.
 */
const GET = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // get a post from Reddit
  if (
    !(
      process.env.REDDIT_USER_AGENT &&
      process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SERCET &&
      process.env.REDDIT_USERNAME &&
      process.env.REDDIT_PASSWORD
    )
  ) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
  const r = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SERCET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });

  // add it to the DB

  return Response.json({ success: true });
};

export { GET };
