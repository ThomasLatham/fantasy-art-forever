import prisma, {
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  pushToQueue,
  getPostingScheduleDayBySubreddit,
} from "./database";

export {
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  getPostingScheduleDayBySubreddit,
  pushToQueue,
};
export default prisma;
