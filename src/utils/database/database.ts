import {
  PostingScheduleDay,
  PrismaClient,
  QueuedInstagramPost,
} from "@prisma/client";
import { Timespan } from "snoowrap/dist/objects/Subreddit";
import { time } from "console";
import { Response } from "express";

import { INEPostInfo, POSTS_PER_SUBREDDIT } from "../../constants";
import snoo, { getINEPostInfo, getPostUrlFromSubmission } from "../reddit";

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
 * Fills the queue with top posts from subreddits if space is available.
 *
 * @param timespanOfTopPostsToSource - The timespan for sourcing top posts.
 * @param numberOfTopPostsToSource - The number of top posts to source.
 * @returns A response indicating the action taken and its status.
 */
const fillQueue = async (
  timespanOfTopPostsToSource: Timespan,
  numberOfTopPostsToSource: number
) => {
  let hasPostBeenQueued: boolean = false;
  try {
    for (const subredditDisplayName of await getAllSubredditDisplayNames()) {
      let queueItemsForSubredditCount = await getQueueItemsBySubredditCount(
        subredditDisplayName
      );
      if (queueItemsForSubredditCount >= POSTS_PER_SUBREDDIT) {
        console.log(
          "Queue already full for subreddit: " + subredditDisplayName
        );
        continue;
      }
      const topPostsToSource = await snoo
        .getSubreddit(subredditDisplayName)
        .getTop({
          time: timespanOfTopPostsToSource,
          limit: numberOfTopPostsToSource,
        });
      let lastIndexTried = 0;

      while (queueItemsForSubredditCount < POSTS_PER_SUBREDDIT) {
        try {
          console.log(
            "Attempting to insert " +
              getPostUrlFromSubmission(topPostsToSource[lastIndexTried]) +
              " into DB..."
          );
          await pushToQueue(
            await getINEPostInfo(topPostsToSource[lastIndexTried])
          );
          queueItemsForSubredditCount++;
          hasPostBeenQueued = true;
          console.log("Attempt success.");
        } catch (error) {
          console.log("Error: " + (error as any).message);
        } finally {
          lastIndexTried++;
          console.log();
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong. Error: " + (error as any).message);
    return {
      status: 500,
      message: "Something went wrong. Error: " + (error as any).message,
    };
  }
  return {
    status: hasPostBeenQueued ? 201 : 202,
    message: hasPostBeenQueued
      ? "Created: New post(s) queued up."
      : "Accepted: No action taken, as queue is already full.",
  };
};

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
    },
  });
};

//#endregion

//#region READ

/**
 * Returns the display names of all the subreddits in the database (e.g., "ImaginaryWizards",
 * "ImaginaryWildlands").
 */
const getAllSubredditDisplayNames = async () => {
  return (
    await prisma.postingScheduleDay.findMany({
      select: { subredditDisplayNames: true },
    })
  )
    .map((subredditDisplayNamesObj) => {
      return subredditDisplayNamesObj.subredditDisplayNames;
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

const getQueueItemsBySubredditSorted = async (subredditDisplayName: string) => {
  return sortQueueItems(await getQueueItemsBySubreddit(subredditDisplayName));
};

const sortQueueItems = (queueItems: QueuedInstagramPost[]) => {
  return queueItems.toSorted((a, b) => {
    if (!a.isBackup || !b.isBackup) {
      return +!b.isBackup - +!a.isBackup;
    } else {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
  });
};

const getQueueItemsBySubredditCount = async (subredditDisplayName: string) => {
  return await prisma.queuedInstagramPost.count({
    where: { subredditDisplayName: subredditDisplayName },
  });
};

const getSubredditForToday = async (
  postingScheduleDetailsForToday: PostingScheduleDay
) => {
  let indexOfSubredditForToday: number;

  if (postingScheduleDetailsForToday.isCyclicalRotation) {
    indexOfSubredditForToday =
      (postingScheduleDetailsForToday.lastSourcedSubreddit + 1) %
      postingScheduleDetailsForToday.subredditDisplayNames.length;
  } else {
    const subredditDisplayNamesWithoutLastSourced =
      postingScheduleDetailsForToday.subredditDisplayNames.filter(
        (subredditDisplayName) => {
          return (
            subredditDisplayName !==
            postingScheduleDetailsForToday.subredditDisplayNames[
              postingScheduleDetailsForToday.lastSourcedSubreddit
            ]
          );
        }
      );

    const subredditForTodayInternal =
      subredditDisplayNamesWithoutLastSourced[
        Math.floor(
          Math.random() * subredditDisplayNamesWithoutLastSourced.length
        )
      ];

    indexOfSubredditForToday =
      postingScheduleDetailsForToday.subredditDisplayNames.indexOf(
        subredditForTodayInternal
      );
  }
  return {
    subredditForToday:
      postingScheduleDetailsForToday.subredditDisplayNames[
        indexOfSubredditForToday
      ],
    indexOfSubredditForToday,
  };
};

const getPostingScheduleDayBySubreddit = async (
  subredditDisplayName: string
) => {
  for (const postingScheduleDay of await prisma.postingScheduleDay.findMany()) {
    if (
      postingScheduleDay.subredditDisplayNames.includes(subredditDisplayName)
    ) {
      return postingScheduleDay;
    }
  }
  throw new Error("No posting-schedule day found for the given subreddit.");
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
  fillQueue,
  getAllSubredditDisplayNames,
  getQueueItemsBySubreddit,
  getQueueItemsBySubredditSorted,
  sortQueueItems,
  getQueueItemsBySubredditCount,
  getSubredditForToday,
  getPostingScheduleDayBySubreddit,
};
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
