import dotenv from "dotenv";

import prisma from "../src/utils/database";

const describeDatabaseOperations = async () => {
  const tagsFromPosts = ["programming", "math", "career"];
  const tagsFromDatabase = (await prisma.tag.findMany()).map(
    (tag) => tag.tagName
  );

  // add all the new tags to the database
  for (const tagFromPost of tagsFromPosts) {
    if (!tagsFromDatabase.includes(tagFromPost)) {
      await prisma.tag.create({ data: { tagName: tagFromPost } });
    }
  }

  // remove any tags that are no longer present
  for (const tagFromDatabase of tagsFromDatabase) {
    if (!tagsFromPosts.includes(tagFromDatabase)) {
      await prisma.tag.delete({ where: { tagName: tagFromDatabase } });
    }
  }
};

const executeDatabaseOperations = async (): Promise<void> => {
  initializeEnvironment();
  await describeDatabaseOperations();
};

const initializeEnvironment = () => {
  dotenv.config({ path: "./.env.local" });
};

executeDatabaseOperations();
