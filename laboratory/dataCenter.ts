import dotenv from "dotenv";
import { PostingScheduleDay } from "@prisma/client";
import snoowrap from "snoowrap";

import prisma from "../src/utils/database";

/**
 * Put your database operations that you want to execute in this function.
 * Then in the terminal run `nodemod laboratory/dataCenter.ts` to execute them.
 */
const describeDatabaseOperations = async () => {};

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
      subreddits: "Winterscapes, Springscapes, Summerscapes, Autumnscapes",
      isCyclicalRotation: true,
      lastSourcedSubreddit: 0,
    },
    {
      id: 1,
      nickname: "Magic Monday",
      description:
        "Art with magical and high-fantasy themes: wizards, witches, elves, dragons and such.",
      subreddits: "Witches, Wizards, Dwarves, Elves, Dragons",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 2,
      nickname: "Techno Tueday",
      description: "Artistic works with steampunk and cyberpunk themes.",
      subreddits: "Cybernetics, Cyberpunk, Steampunk, Mechs, Starships",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 3,
      nickname: "Warrior Wednesday",
      description:
        "Art of all kinds of fantasy warriors, from sneaky assassins to battered brawlers.",
      subreddits:
        "Battlefields, Archers, Assassins, Knights, Soldiers, Warriors",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 4,
      nickname: "Alliteration-Is-Hard Thursday",
      description:
        'I couldn\'t think of a good "th"-word, so today we just have some random themes: angels, demons, scholars, merfolk and more.',
      subreddits:
        "Angels, Orcs, Scholars, Mythology, Nobles, Elementals, Undead, Demons, Faeries, Merfolk, Humans",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 5,
      nickname: "Fandom Friday",
      description:
        "Fantasy art from some cool established universes (Warcraft, Middle Earth, Elder Scrolls and The Witcher), on a rotating schedule.",
      subreddits: "Azeroth, MiddleEarth, Tamriel, Witcher",
      isCyclicalRotation: true,
      lastSourcedSubreddit: 0,
    },
    {
      id: 6,
      nickname: "Scenic Saturday",
      description:
        "Art of beautiful places, from majestic landscapes to towering castles.",
      subreddits:
        "Architecture, Castles, Dwellings, Pathways, Seascapes, Wildlands, Worlds",
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
  // get all the subreddits from the DB
  const r = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SERCET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });
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
