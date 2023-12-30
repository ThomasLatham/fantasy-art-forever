import { PrismaClient } from "@prisma/client";

import { INEPostInfo } from "@/contants";

/* PRISMA SINGLETON */

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

/* FORMATTING */

const shortenSubredditName = (subredditName: string) => {
  return subredditName.split("Imaginary").slice(-1)[0];
};

/* DATA RETRIEVAL */

/**
 * Returns the URLs of all the subreddits in the database (e.g., "https://www.reddit.com/r/ImaginaryWizards",
 * "https://www.reddit.com/r/ImaginaryWildlands").
 */
const getAllSubredditUrls = async () => {
  return (await getAllSubredditFullNames()).map((subredditFullName) => {
    return "https://www.reddit.com/" + subredditFullName;
  });
};

/**
 * Returns the full names of all the subreddits in the database (e.g., "r/ImaginaryWizards",
 * "r/ImaginaryWildlands").
 */
const getAllSubredditFullNames = async () => {
  return (await getAllSubredditShortNames()).map((subredditShortName) => {
    return "r/Imaginary" + subredditShortName;
  });
};

/**
 * Returns the shortened names of all subreddits in the database (e.g., "Wizards", "Wildlands").
 */
const getAllSubredditShortNames = async () => {
  return (await prisma.postingScheduleDay.findMany())
    .map((postingScheduleDay) => {
      return postingScheduleDay.subreddits.split(", ");
    })
    .reduce((prev, cur) => {
      return prev.concat(...cur);
    }, []);
};

/* DATA INSERTION */

const pushToQueue = async (postInfo: INEPostInfo) => {};

export { getAllSubredditUrls };
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
