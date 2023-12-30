import * as fs from "fs";

import { getLocalVariableValue } from "./utilityCloset";

const shortenSubredditName = (subredditName: string) => {
  const queueItemsOfSameSubreddit = [
    { id: 1, createdAt: 1 },
    { id: 2, createdAt: 2 },
  ];
  const olderBackupId = queueItemsOfSameSubreddit.reduce((prev, cur) => {
    return cur.createdAt > prev.createdAt ? prev : cur;
  }).id;

  return olderBackupId;
};

/* *** *** *** *** *** *** *** *** *** *** *** *** *
 * System Internals Below -- Probably Don't Change *
 * *** *** *** *** *** *** *** *** *** *** *** *** */

const putTestTubeInCentrifuge = async () => {
  console.log(shortenSubredditName("r/ImaginaryWildlands"));
};

export default putTestTubeInCentrifuge;
