import dotenv from "dotenv";

import prisma from "../src/utils/database";

const describeDatabaseOperations = async () => {};

const executeDatabaseOperations = async (): Promise<void> => {
  initializeEnvironment();
  await describeDatabaseOperations();
};

const initializeEnvironment = () => {
  dotenv.config({ path: "./.env.local" });
};

executeDatabaseOperations();
