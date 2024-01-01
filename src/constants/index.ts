interface INEPostInfo {
  redditPostId: string;
  subredditDisplayName: string;
  redditOP: string;
  artworkTitle: string;
  artistName: string;
  linkToArtworkSource: string;
  artworkImageUrl: string;
}

/**
 * How many posts we keep in the queue for each subreddit. Subtract 1 from this value to get the
 * number of backups per subreddit.
 */
const POSTS_PER_SUBREDDIT = 3;

/**
 * The possible times of day when we can post to Instagram.
 */
const POSTING_TIMES = [6, 9, 12, 15, 18];

export type { INEPostInfo };
export { POSTS_PER_SUBREDDIT, POSTING_TIMES };
