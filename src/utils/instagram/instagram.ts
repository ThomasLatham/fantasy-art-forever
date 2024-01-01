import { QueuedInstagramPost } from "@prisma/client";
import { IgApiClient } from "instagram-private-api";
import { get } from "request-promise";

import snoo, { getPostUrlFromSubmission } from "../reddit";
import { getPostingScheduleDayBySubreddit } from "../database";

//#region IG SINGLETON

const instagramSingleton = async () => {
  if (!(process.env.IG_USERNAME && process.env.IG_PASSWORD)) {
    throw new Error("Could not get Instagram API client.");
  }
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  const auth = await ig.account.login(
    process.env.IG_USERNAME,
    process.env.IG_PASSWORD
  );
  return ig;
};
declare global {
  var ig: undefined | ReturnType<typeof instagramSingleton>;
}
const ig = await (async () => {
  return globalThis.ig ?? (await instagramSingleton());
})();

//#endregion

/**
 * Attempts to post to Instagram.
 *
 * @param postDetails The details of the Reddit post for which we want to create an Instagram post.
 * @returns The upload ID of the Instagram post if posting to Instagram is successful; the empty
 * string otherwise.
 */
const createInstagramPost = async (postDetails: QueuedInstagramPost) => {
  const imageBuffer = Buffer.from(
    await (
      await fetch((await snoo.getSubmission(postDetails.redditPostId)).url)
    ).arrayBuffer()
  );

  const publishResult = await ig.publish.photo({
    file: imageBuffer,
    caption: await getCaptionFromPostDetails(postDetails),
  });

  if (publishResult.status === "ok") {
    return publishResult.upload_id;
  } else {
    return "";
  }
};

const getCaptionFromPostDetails = async (postDetails: QueuedInstagramPost) => {
  const postingScheduleDay = await getPostingScheduleDayBySubreddit(
    postDetails.subredditDisplayName
  );

  // returns it in an object so we more easily see the formatting here
  return `${postDetails.artworkTitle} by ${postDetails.artistName}
Source: ${postDetails.linkToArtworkSource}
Reddit Post: ${getPostUrlFromSubmission(
    await snoo.getSubmission(postDetails.redditPostId)
  )}
Reddit OP: u/${postDetails.redditOP}
      
${postingScheduleDay.nickname}: ${postingScheduleDay.description}

#fantasy #art #${postDetails.subredditDisplayName
    .split("Imaginary")[1]
    .toLowerCase()}`;
};

export { createInstagramPost };
