import snoowrap from "snoowrap";

import { INEPostInfo } from "../../constants";
import { wait } from "../general";

/* FORMATTING */

const getPostUrlFromSubmission = (submission: snoowrap.Submission) => {
  return `https://www.reddit.com/${submission.subreddit_name_prefixed}/comments/${submission.id}/`;
};

/* API OPS */

const getINEPostInfo = async (
  submission: snoowrap.Submission,
  r: snoowrap
): Promise<INEPostInfo> => {
  try {
    // Fetch the post details using the provided link
    const post = await r.getSubmission(submission.id).fetch();
    await wait(1000); // Wait for a second

    // Check if the post is tagged as OC (Original Content)
    if (post.link_flair_text && post.link_flair_text.toLowerCase() === "oc") {
      throw new Error("This post is tagged as Original Content. Ignoring...");
    }

    // Extract information from the post title with various patterns
    const title = post.title;
    const patterns = [
      /"([^"]+)"(?:\s*-\s*|\s*by\s*)(.+)/i, // "<piece>" - <artist> or "<piece>" by <artist>
      /'([^']+)'(?:\s*-\s*|\s*by\s*)(.+)/i, // '<piece>' - <artist> or '<piece>' by <artist>
      /([^"'\-]+)(?:\s*-\s*|\s*by\s*)(.+)/i, // <piece> - <artist> or <piece> by <artist>
    ];

    let artworkTitle: string | null = null;
    let artistName: string | null = null;

    // Try each pattern to extract the art piece name and artist name
    patterns.some((pattern) => {
      const match = title.match(pattern);
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

    const redditOP = post.author.name;

    // Find the oldest comment by the redditOP that contains a link (assuming the link is in the comment body)
    const comments = await post.comments.fetchAll();
    await wait(1000); // Wait for a second

    const oldestComment = comments
      .filter((comment) => comment.author.name === redditOP)
      .sort((a, b) => a.created_utc - b.created_utc)[0];

    const linkToArtworkSource = oldestComment
      ? oldestComment.body_html.match(/\bhttps?:\/\/\S+/gi)?.[0] || null
      : null;

    if (!linkToArtworkSource) {
      throw new Error("No comments with a valid source link found.");
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
    };
  } catch (error) {
    throw new Error(
      `Error fetching post information: ${(error as any).message}`
    );
  }
};

export { getPostUrlFromSubmission, getINEPostInfo };
