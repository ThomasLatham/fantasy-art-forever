import { PostingScheduleDay } from "@prisma/client";
import * as fs from "fs";

import snoo from "../src/utils/reddit";
import "../src/types/snoowrap";
import prisma, {
  fillQueue,
  getAllSubredditDisplayNames,
} from "../src/utils/database";

/**
 * Put your database operations that you want to execute in this function.
 * Then in the terminal run `nodemod laboratory/dataCenter.ts` to execute them.
 */
const describeDatabaseOperations = async () => {
  // await prisma.postingScheduleDay.deleteMany();
  // await initPostingScheduleDays();
  // await prisma.queuedInstagramPost.deleteMany();
  // await initQueuedInstagramPosts();
  // await prisma.persistedValuesRecord.deleteMany();
  // await initPersistedValueRecord();
};

//#region TABLE INITIALIZERS

/**
 * Fills the `QueuedInstagramPost` table with initial data.
 *
 * We want 1 queued post and 2 backup posts for *every* subreddit from which we source, and
 * we'll initialize the data using the top 3 posts of all time for each subreddit.
 */
const initQueuedInstagramPosts = async () => {
  await fillQueue("all", 10);
};

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
      subredditDisplayNames: [
        "ImaginaryWinterscapes",
        "ImaginarySpringscapes",
        "ImaginarySummerscapes",
        "ImaginaryAutumnscapes",
      ],
      isCyclicalRotation: true,
      lastSourcedSubreddit: 0,
    },
    {
      id: 1,
      nickname: "Magic Monday",
      description:
        "Art with magical and high-fantasy themes: wizards, witches, elves, dragons and such.",
      subredditDisplayNames: [
        "ImaginaryWitches",
        "ImaginaryWizards",
        "ImaginaryDwarves",
        "ImaginaryElves",
        "ImaginaryDragons",
      ],
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 2,
      nickname: "Techno Tueday",
      description: "Artistic works with steampunk and cyberpunk themes.",
      subredditDisplayNames: [
        "ImaginaryCybernetics",
        "ImaginaryCyberpunk",
        "ImaginarySteampunk",
        "ImaginaryMechs",
        "ImaginaryStarships",
      ],
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 3,
      nickname: "Warrior Wednesday",
      description:
        "Art of all kinds of fantasy warriors, from sneaky assassins to battered brawlers.",
      subredditDisplayNames: [
        "ImaginaryBattlefields",
        "ImaginaryArchers",
        "ImaginaryAssassins",
        "ImaginaryKnights",
        "ImaginarySoldiers",
        "ImaginaryWarriors",
      ],
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 4,
      nickname: "Alliteration-Is-Hard Thursday",
      description:
        'I couldn\'t think of a good "th"-word, so today we just have some random themes: angels, demons, scholars, merfolk and more.',
      subredditDisplayNames: [
        "ImaginaryAngels",
        "ImaginaryOrcs",
        "ImaginaryScholars",
        "ImaginaryMythology",
        "ImaginaryNobles",
        "ImaginaryElementals",
        "ImaginaryUndead",
        "ImaginaryDemons",
        "ImaginaryFaeries",
        "ImaginaryMerfolk",
        "ImaginaryHumans",
      ],
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 5,
      nickname: "Fandom Friday",
      description:
        "Fantasy art from some cool established universes (Warcraft, Middle Earth, Elder Scrolls and The Witcher), on a rotating schedule.",
      subredditDisplayNames: [
        "ImaginaryAzeroth",
        "ImaginaryMiddleEarth",
        "ImaginaryTamriel",
        "ImaginaryWitcher",
      ],
      isCyclicalRotation: true,
      lastSourcedSubreddit: 0,
    },
    {
      id: 6,
      nickname: "Scenic Saturday",
      description:
        "Art of beautiful places, from majestic landscapes to towering castles.",
      subredditDisplayNames: [
        "ImaginaryArchitecture",
        "ImaginaryCastles",
        "ImaginaryDwellings",
        "ImaginaryPathways",
        "ImaginarySeascapes",
        "ImaginaryWildlands",
        "ImaginaryWorlds",
      ],
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

const initPersistedValueRecord = async () => {
  await prisma.persistedValuesRecord.create({
    data: {
      postingTimeForToday: 6,
      hasPostingTimeBeenUpdatedToday: true,
      hasPostBeenMadeToday: false,
    },
  });
};

//#endregion

//#region AD-HOC DATA RETRIEVAL

const getLotsOfINEPostTitles = async () => {
  const csvData: string[][] = [
    ["subreddit", "post_title", "artwork_title", "artist_name"],
  ];

  for (const subreddit of await getAllSubredditDisplayNames()) {
    try {
      const topPosts = await snoo
        .getSubreddit(subreddit)
        .getTop({ time: "all", limit: 10 });
      topPosts.forEach((post) => {
        csvData.push([subreddit, post.title, "", ""]);
      });
    } catch (err) {
      console.error(`Error fetching posts from ${subreddit}: ${err}`);
    }
  }

  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  fs.writeFileSync("ine_post_titles.csv", csvContent, "utf8");
};

const getINEPostImageLink = async () => {
  // grab a post from the DB
  const queuedPost = await prisma.queuedInstagramPost.findFirst();

  // log the URL
  console.log(
    queuedPost
      ? await snoo.getSubmission(queuedPost.redditPostId).url
      : "No posts found in queue to test."
  );
};

//#endregion

//#region INTERNALS (no touchy)

const executeDatabaseOperations = async (): Promise<void> => {
  await describeDatabaseOperations();
};

//#endregion

executeDatabaseOperations();
