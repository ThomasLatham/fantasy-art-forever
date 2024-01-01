import prisma, {
  fillQueue,
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  getPostingScheduleDayBySubreddit,
} from "./database";

export {
  fillQueue,
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  getPostingScheduleDayBySubreddit,
};
export default prisma;
