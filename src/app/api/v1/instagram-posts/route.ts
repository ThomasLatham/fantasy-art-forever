import type { NextRequest } from "next/server";
import { IgApiClient } from "instagram-private-api";
import { get } from "request-promise";

const GET = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // get a post from the DB

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

export { GET };
