import type { NextRequest } from "next/server";
import Snoowrap from "snoowrap";

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
  const r = new Snoowrap({
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
