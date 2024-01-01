import snoowrap from "snoowrap";

import { INEPostInfo } from "../../constants";
import { isJpegImage, removeTrailingComma } from "../general";

//#region SNOOWRAP SINGLETON

const snoowrapSingleton = () => {
  if (
    !(
      process.env.REDDIT_USER_AGENT &&
      process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET &&
      process.env.REDDIT_USERNAME &&
      process.env.REDDIT_PASSWORD
    )
  ) {
    throw new Error("Could not get snoowrap.");
  }
  return new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });
};
declare global {
  var snoo: undefined | ReturnType<typeof snoowrapSingleton>;
}
const snoo = globalThis.snoo ?? snoowrapSingleton();

//#endregion

//#region FORMATTING

const getPostUrlFromSubmission = (submission: snoowrap.Submission) => {
  return `https://www.reddit.com/${submission.subreddit_name_prefixed}/comments/${submission.id}/`;
};

/**
 * Extracts artwork title and artist name from a given post title.
 * @param {string} postTitle - The title of the Reddit post containing artwork and artist information.
 * @returns {{ artworkTitle: string, artistName: string }} - Object containing artwork title and artist name.
 * @throws {Error} - Throws an error if the artist name or artwork title cannot be found.
 */
const getArtworkDetails = (
  postTitle: string
): { artworkTitle: string; artistName: string } => {
  const patterns = [
    /"([^"]+)"(?:\s*-\s*|\s*by\s*)(.+)/i, // "<piece>" - <artist> or "<piece>" by <artist>
    /'([^']+)'(?:\s*-\s*|\s*by\s*)(.+)/i, // '<piece>' - <artist> or '<piece>' by <artist>
    /([^"'\-]+)(?:\s*-\s*|\s*by\s*)(.+)/i, // <piece> - <artist> or <piece> by <artist>
  ];

  let artworkTitle: string | null = null;
  let artistName: string | null = null;

  // Try each pattern to extract the art piece name and artist name
  patterns.some((pattern) => {
    const match = postTitle.match(pattern);
    if (match && match.length >= 3) {
      artworkTitle = match[1].trim();
      artistName = match[2].trim();
      return true;
    }
    return false;
  });

  if (!artistName || !artworkTitle) {
    throw new Error(
      "Unable to extract artist name or art piece name from the post title."
    );
  }

  artworkTitle = removeTrailingComma(artworkTitle);

  return { artworkTitle, artistName };
};

//#endregion

//#region API OPS

const getINEPostInfo = async (
  submission: snoowrap.Submission
): Promise<INEPostInfo> => {
  try {
    // Extract information from the post title with various patterns
    let { artworkTitle, artistName } = getArtworkDetails(submission.title);

    if (isPostOC(submission.link_flair_text, artistName)) {
      artistName = "u/" + submission.author.name;
    }

    const redditOP = submission.author.name;

    // Find the oldest comment by the redditOP that contains a link (assuming the link is in the comment body)
    const comments = await submission.comments.fetchAll();

    const oldestComment = comments
      .filter((comment) => comment.author.name === redditOP)
      .sort((a, b) => a.created_utc - b.created_utc)[0];

    let linkToArtworkSource = oldestComment
      ? oldestComment.body_html.match(/\bhttps?:\/\/\S+/gi)?.[0] || null
      : null;

    if (!linkToArtworkSource) {
      throw new Error("No comments with a valid source link found.");
    }

    linkToArtworkSource = linkToArtworkSource.split('">')[0];

    // Make sure image URL exists and it's a JPEG
    if (!(submission.url && isJpegImage(submission.url))) {
      throw new Error(
        "Artwork image URL does not exist, or the image could not be retrieved from the URL, or image is not a JPEG."
      );
    }

    // Return the collected information as an object
    return {
      redditPostId: submission.id,
      subredditDisplayName: submission.subreddit_name_prefixed.replace(
        "r/",
        ""
      ),
      redditOP: redditOP,
      artworkTitle: artworkTitle,
      artistName: artistName,
      linkToArtworkSource: linkToArtworkSource,
      artworkImageUrl: submission.url,
    };
  } catch (error) {
    throw new Error(
      `Error fetching post information: ${(error as any).message}`
    );
  }
};

const isPostOC = (postLinkFlairText: string | null, artistName: string) => {
  return (
    postLinkFlairText?.toLocaleLowerCase() === "oc" ||
    artistName.toLowerCase() == "me" ||
    artistName.toLowerCase() == "myself"
  );
};

//#endregion

export { getPostUrlFromSubmission, getINEPostInfo };
export default snoo;
