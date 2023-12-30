import * as fs from "fs";

import { getLocalVariableValue } from "./utilityCloset";

const shortenSubredditName = (subredditName: string) => {
  return subredditName.split("Imaginary").slice(-1)[0];
};

/* *** *** *** *** *** *** *** *** *** *** *** *** *
 * System Internals Below -- Probably Don't Change *
 * *** *** *** *** *** *** *** *** *** *** *** *** */

const putTestTubeInCentrifuge = async () => {
  console.log(shortenSubredditName("r/ImaginaryWildlands"));
};

export default putTestTubeInCentrifuge;
