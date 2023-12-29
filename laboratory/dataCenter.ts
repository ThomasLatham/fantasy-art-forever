import dotenv from "dotenv";

import prisma from "../src/utils/database";
import { PostingScheduleDay } from "@prisma/client";

const describeDatabaseOperations = async () => {
  // await setUpPostingScheduleDays();
};

const setUpPostingScheduleDays = async () => {
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
      subreddits: "Battlefields, Archers, Assassins, Knights, Soldiers, Warriors",
      isCyclicalRotation: false,
      lastSourcedSubreddit: 0,
    },
    {
      id: 4,
      nickname: "Alliteration-Is-Hard Thursday",
      description:
        'I couldn\'t think of a good "th"-word, so today we just have some random themes: angels, demons, scholars, merfolk and more.',
      subreddits: "Angels, Orcs, Scholars, Mythology, Nobles, Elementals, Undead, Demons, Faeries, Merfolk, Humans",
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
      subreddits: "Architecture, Castles, Dwellings, Pathways, Seascapes, Wildlands, Worlds",
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

const executeDatabaseOperations = async (): Promise<void> => {
  initializeEnvironment();
  await describeDatabaseOperations();
};

const initializeEnvironment = () => {
  dotenv.config({ path: "./.env.local" });
};

executeDatabaseOperations();
