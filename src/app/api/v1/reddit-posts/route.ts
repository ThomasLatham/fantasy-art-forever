import type { NextRequest } from "next/server";

import snoo from "../../../../utils/reddit";

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

  // get a post from reddit

  // add it to the DB

  return Response.json({ success: true });
};

export { GET };
