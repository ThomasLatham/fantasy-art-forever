import prisma, {
  fillQueue,
  pushToQueue,
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  getPostingScheduleDayBySubreddit,
} from "./database";

export {
  fillQueue,
  pushToQueue,
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  getPostingScheduleDayBySubreddit,
};
export default prisma;
