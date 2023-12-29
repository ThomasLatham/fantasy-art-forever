import * as fs from "fs";
import matter from "gray-matter";
import readingTime from "reading-time";

import { getLocalVariableValue } from "./utilityCloset";
import { POSTS_PATH } from "../../src/constants";
import { PostFrontmatter } from "../../src/interfaces";

/**
 * Executes the process of sending new-post-notifaction emails.
 *
 * Considerations:
 * - need to generate the HTML for each send
 *   - do this in the cronjob
 *
 * Infrastructure/tech stack:
 * - Need a DB that holds all the subscribers and what they're subscribed to
 * - using Vercel Postgres for storage, going to queue emails in the DB
 * - using Gmail API to send emails in MIME format
 * - using Vercel cronjob to read/write the queue and send emails at daily intervals
 *
 * Steps (new post merged to `main` branch):
 *
 * - [x] 1. GitHub Webhook sees the merged PR and sends request to our Next.js API endpoint
 * - [x] 2. Next.js API endpoint gets the post's ID and frontmatter
 * - [ ] 3. Next.js API endpoint gets the list of subscribers from the Vercel DB
 * - [ ] 4. Next.js API endpoint schedules emails the Vercel DB
 * - [ ] 5. Vercel cronjob daily reads from the Vercel DB scheduled emails, sends 2000 from the top
 *    then deletes the records from the schedule table
 *
 * @param newPostId
 */
const executeNewPostNotificationFlow = async (newPostId: string) => {
  const frontmatter = getFrontmatterFromPostId(newPostId);
  console.log(frontmatter);
};

const getFrontmatterFromPostId = (postId: string): PostFrontmatter => {
  const sourceText = fs.readFileSync(`${POSTS_PATH}/${postId}/${postId}.mdx`, "utf8");
  return {
    ...matter(sourceText).data,
    wordCount: sourceText.split(/\s+/gu).length,
    readingTime: readingTime(sourceText).minutes,
  } as PostFrontmatter;
};

/* *** *** *** *** *** *** *** *** *** *** *** *** *
 * System Internals Below -- Probably Don't Change *
 * *** *** *** *** *** *** *** *** *** *** *** *** */

const putTestTubeInCentrifuge = async () => {
  await executeNewPostNotificationFlow("test-post");
};

export default putTestTubeInCentrifuge;
