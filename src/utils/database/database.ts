import { PrismaClient } from "@prisma/client";

import { INEPostInfo } from "../../constants";

/* PRISMA SINGLETON */

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

/* CREATE */

const pushToQueue = async (postInfo: INEPostInfo) => {
  // see how many posts are in the queue from the same subreddit
  const queueItemsOfSameSubreddit = await getQueueItemsBySubreddit(
    postInfo.subredditDisplayName
  );

  if (queueItemsOfSameSubreddit.length === 0) {
    // insert the record not as a backup
    await pushToQueueHelper(postInfo, false);
  } else if (queueItemsOfSameSubreddit.length === 1) {
    // queue up the backup item
    await queueUpBackupItem(queueItemsOfSameSubreddit[0].id);
    // insert the new record as a backup
    await pushToQueueHelper(postInfo, true);
  } else if (queueItemsOfSameSubreddit.length === 2) {
    // queue up the older backup item
    const olderBackupId = queueItemsOfSameSubreddit.reduce((prev, cur) => {
      return cur.createdAt > prev.createdAt ? prev : cur;
    }).id;
    await queueUpBackupItem(olderBackupId);
    // insert the new record as a backup
    await pushToQueueHelper(postInfo, true);
  } else {
    console.log(
      "Queue already full for subreddit: " + postInfo.subredditDisplayName
    );
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

/* READ */

/**
 * Returns the display names of all the subreddits in the database (e.g., "ImaginaryWizards",
 * "ImaginaryWildlands").
 */
const getAllSubredditDisplayNames = async () => {
  return (await prisma.postingScheduleDay.findMany())
    .map((postingScheduleDay) => {
      return postingScheduleDay.subreddits.split(", ");
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

/* UPDATE */

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

export { getAllSubredditDisplayNames, pushToQueue };
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
