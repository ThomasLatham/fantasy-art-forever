import dotenv from "dotenv";
import { PostingScheduleDay } from "@prisma/client";
import snoowrap from "snoowrap";

import prisma, {
  getAllSubredditDisplayNames,
  pushToQueue,
} from "../src/utils/database";
import { getINEPostInfo, getPostUrlFromSubmission } from "../src/utils/reddit";

// comment out the module declaration below before deploying

// declare module "snoowrap" {
//   class RedditContent<T> {
//     then: undefined;
//     catch: undefined;
//     finally: undefined;
//   }
// }

/**
 * Put your database operations that you want to execute in this function.
 * Then in the terminal run `nodemod laboratory/dataCenter.ts` to execute them.
 */
const describeDatabaseOperations = async () => {
  // await prisma.postingScheduleDay.deleteMany();
  // await initPostingScheduleDays();

  await prisma.queuedInstagramPost.deleteMany();
  await initQueuedInstagramPosts();
};

/* ********************
 * TABLE INITIALIZERS *
 * ****************** */

/**
 * Fills the `PostingScheduleDay` table with initial data. Reflects the information in the README
 * concerning the posting schedule.
 */
const initPostingScheduleDays = async () => {
  const postingScheduleDays: PostingScheduleDay[] = [
    {
      id: 0,
      nickname: "Seasonal Sunday",
      description:
        "Art depicting one of the four seasons, on a rotating basis.",
      subreddits:
        "ImaginaryWinterscapes, ImaginarySpringscapes, ImaginarySummerscapes, ImaginaryAutumnscapes",
      isCyclicalRotation: true,
      lastSourcedSubreddit: 0,
    },
    {
      id: 1,
      nickname: "Magic Monday",
      description:
        "Art with magical and high-fantasy themes: wizards, witches, elves, dragons and such.",
      subreddits:
        "ImaginaryWitches, ImaginaryWizards, ImaginaryDwarves, ImaginaryElves, ImaginaryDragons",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 2,
      nickname: "Techno Tueday",
      description: "Artistic works with steampunk and cyberpunk themes.",
      subreddits:
        "ImaginaryCybernetics, ImaginaryCyberpunk, ImaginarySteampunk, ImaginaryMechs, ImaginaryStarships",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 3,
      nickname: "Warrior Wednesday",
      description:
        "Art of all kinds of fantasy warriors, from sneaky assassins to battered brawlers.",
      subreddits:
        "ImaginaryBattlefields, ImaginaryArchers, ImaginaryAssassins, ImaginaryKnights, ImaginarySoldiers, ImaginaryWarriors",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 4,
      nickname: "Alliteration-Is-Hard Thursday",
      description:
        'I couldn\'t think of a good "th"-word, so today we just have some random themes: angels, demons, scholars, merfolk and more.',
      subreddits:
        "ImaginaryAngels, ImaginaryOrcs, ImaginaryScholars, ImaginaryMythology, ImaginaryNobles, ImaginaryElementals, ImaginaryUndead, ImaginaryDemons, ImaginaryFaeries, ImaginaryMerfolk, ImaginaryHumans",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 5,
      nickname: "Fandom Friday",
      description:
        "Fantasy art from some cool established universes (Warcraft, Middle Earth, Elder Scrolls and The Witcher), on a rotating schedule.",
      subreddits:
        "ImaginaryAzeroth, ImaginaryMiddleEarth, ImaginaryTamriel, ImaginaryWitcher",
      isCyclicalRotation: true,
      lastSourcedSubreddit: 0,
    },
    {
      id: 6,
      nickname: "Scenic Saturday",
      description:
        "Art of beautiful places, from majestic landscapes to towering castles.",
      subreddits:
        "ImaginaryArchitecture, ImaginaryCastles, ImaginaryDwellings, ImaginaryPathways, ImaginarySeascapes, ImaginaryWildlands, ImaginaryWorlds",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
  ];

  await Promise.all(
    postingScheduleDays.map(async (postingScheduleDay) => {
      await prisma.postingScheduleDay.create({ data: postingScheduleDay });
    })
  );
};

/**
 * Fills the `QueuedInstagramPost` table with initial data.
 *
 * We want 1 queued post and 2 backup posts for *every* subreddit from which we source, and
 * we'll initialize the data using the top 3 posts of all time for each subreddit.
 */
const initQueuedInstagramPosts = async () => {
  const r = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });

  for (const subredditDisplayName of await getAllSubredditDisplayNames()) {
    const posts = await r
      .getSubreddit(subredditDisplayName)
      .getTop({ time: "all", limit: 6 });
    for (const post of posts) {
      try {
        console.log(
          "Attempting to insert " +
            getPostUrlFromSubmission(post) +
            " into DB..."
        );
        await pushToQueue(await getINEPostInfo(post, r));
        console.log("Attempt success.");
      } catch (error) {
        console.log("Error: " + (error as any).message);
      }
      console.log();
    }
  }
};

/* **********************
 * INTERNALS (no touchy) *
 * ********************* */

const executeDatabaseOperations = async (): Promise<void> => {
  initializeEnvironment();
  await describeDatabaseOperations();
};

const initializeEnvironment = () => {
  dotenv.config({ path: "./.env.local" });
};

executeDatabaseOperations();
