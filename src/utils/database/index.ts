import prisma, {
  getAllSubredditDisplayNames,
  getQueueItemsBySubredditCount,
  pushToQueue,
} from "./database";

export {
  getAllSubredditDisplayNames,
  getQueueItemsBySubredditCount,
  pushToQueue,
};
export default prisma;
