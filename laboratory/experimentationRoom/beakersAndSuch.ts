import * as fs from "fs";

import { getLocalVariableValue } from "./utilityCloset";

const executeNewPostNotificationFlow = async (newPostId: string) => {
  console.log("placeholder");
};

/* *** *** *** *** *** *** *** *** *** *** *** *** *
 * System Internals Below -- Probably Don't Change *
 * *** *** *** *** *** *** *** *** *** *** *** *** */

const putTestTubeInCentrifuge = async () => {
  await executeNewPostNotificationFlow("test-post");
};

export default putTestTubeInCentrifuge;
