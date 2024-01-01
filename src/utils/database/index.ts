import prisma, {
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  pushToQueue,
} from "./database";

export {
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  pushToQueue,
};
export default prisma;
