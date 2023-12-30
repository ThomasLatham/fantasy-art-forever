import snoowrap from "snoowrap";

import { INEPostInfo } from "@/contants";

const getINEPostInfo = async (
  postLink: string,
  r: snoowrap
): Promise<INEPostInfo> => {
  try {
    // Fetch the post details using the provided link
    const post = await r.getSubmission(postLink).fetch();

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
    const oldestComment = comments
      .filter(
        (comment) =>
          comment.author.name === redditOP &&
          comment.created_utc < post.created_utc
      )
      .sort((a, b) => a.created_utc - b.created_utc)[0];

    const linkToArtworkSource = oldestComment
      ? oldestComment.body.match(/\bhttps?:\/\/\S+/gi)?.[0] || null
      : null;

    if (!linkToArtworkSource) {
      throw new Error("No comments with a valid source link found.");
    }

    // Return the collected information as an object
    return {
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
