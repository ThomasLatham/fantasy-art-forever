/**
 * `snoowrap` was having issues.
 * https://github.com/not-an-aardvark/snoowrap/issues/221#issuecomment-1152761866 fixed it.
 */

import * as snoowrap from "snoowrap";

declare module "snoowrap" {
  // @ts-ignore
  class RedditContent<T> {
    then: undefined;
    catch: undefined;
    finally: undefined;
  }
}
