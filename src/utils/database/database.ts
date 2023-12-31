import { PrismaClient } from "@prisma/client";
import { Submission } from "snoowrap";

import { INEPostInfo, POSTS_PER_SUBREDDIT } from "../../constants";
import snoo, { getINEPostInfo } from "../reddit";

//#region PRISMA SINGLETON

const prismaClientSingleton = () => {
  return new PrismaClient();
};
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}
const prisma = globalThis.prisma ?? prismaClientSingleton();

//#endregion

//#region CREATE

/**
 * Pushes the details of a Reddit post to the Instagram-post queue.
 *
 * @param postInfo The details of the Reddit post we want to queue up.
 * @returns The count of the queue items from the given `postInfo`'s subreddit.
 */
const pushToQueue = async (postInfo: INEPostInfo): Promise<number> => {
  // see how many posts are in the queue from the same subreddit
  const queueItemsOfSameSubreddit = await getQueueItemsBySubreddit(
    postInfo.subredditDisplayName
  );

  if (queueItemsOfSameSubreddit.length === 0) {
    // queue up the new item
    await pushToQueueHelper(postInfo, false);
    return 1;
  } else if (queueItemsOfSameSubreddit.length < POSTS_PER_SUBREDDIT) {
    // queue up the oldest backup item
    const olderBackupId = queueItemsOfSameSubreddit.reduce((prev, cur) => {
      return cur.createdAt > prev.createdAt ? prev : cur;
    }).id;
    await queueUpBackupItem(olderBackupId);

    // insert the new record as a backup
    await pushToQueueHelper(postInfo, true);

    return queueItemsOfSameSubreddit.length + 1;
  } else {
    return POSTS_PER_SUBREDDIT;
  }
};

const pushToQueueHelper = async (postInfo: INEPostInfo, isBackup: boolean) => {
  await prisma.queuedInstagramPost.create({
    data: {
      ...postInfo,
      isBackup: isBackup,
      postingTime: generatePostingTime(),
    },
  });
};

const generatePostingTime = () => {
  const values: number[] = [6, 9, 12, 15, 18];
  const randomIndex: number = Math.floor(Math.random() * values.length);
  return values[randomIndex];
};

//#endregion

//#region READ

/**
 * Returns the display names of all the subreddits in the database (e.g., "ImaginaryWizards",
 * "ImaginaryWildlands").
 */
const getAllSubredditDisplayNames = async () => {
  return (await prisma.postingScheduleDay.findMany())
    .map((postingScheduleDay) => {
      return postingScheduleDay.subredditDisplayNames.split(", ");
    })
    .reduce((prev, cur) => {
      return prev.concat(...cur);
    }, []);
};

const getQueueItemsBySubreddit = async (subredditDisplayName: string) => {
  return await prisma.queuedInstagramPost.findMany({
    where: { subredditDisplayName: subredditDisplayName },
  });
};

const getQueueItemsBySubredditCount = async (subredditDisplayName: string) => {
  return await prisma.queuedInstagramPost.count({
    where: { subredditDisplayName: subredditDisplayName },
  });
};

//#endregion

//#region UPDATE

/**
 * Sets to `false` the `isBackup` value of the `QueuedInstagramPost` identified by the given
 * `queueItemId`.
 */
const queueUpBackupItem = async (queueItemId: string) => {
  await prisma.queuedInstagramPost.update({
    where: { id: queueItemId },
    data: { isBackup: false },
  });
};

//#endregion

export {
  getAllSubredditDisplayNames,
  getQueueItemsBySubredditCount,
  pushToQueue,
};
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
