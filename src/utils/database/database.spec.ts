import { QueuedInstagramPost } from "@prisma/client";
import _ from "lodash";
import { expect, test, describe } from "vitest";

import { sortQueueItems } from "./database";

describe("Database Utility Functions", () => {
  const mockQueueItemsArray: QueuedInstagramPost[] = [
    {
      isBackup: true,
      createdAt: new Date("2024-01-01T00:00:00"),
    } as QueuedInstagramPost,
    {
      isBackup: false,
      createdAt: new Date("2024-01-02T00:00:00"),
    } as QueuedInstagramPost,
    {
      isBackup: true,
      createdAt: new Date("2024-01-03T00:00:00"),
    } as QueuedInstagramPost,
  ];

  const expectedQueueItemsArray: QueuedInstagramPost[] = [
    {
      isBackup: false,
      createdAt: new Date("2024-01-02T00:00:00"),
    } as QueuedInstagramPost,
    {
      isBackup: true,
      createdAt: new Date("2024-01-01T00:00:00"),
    } as QueuedInstagramPost,
    {
      isBackup: true,
      createdAt: new Date("2024-01-03T00:00:00"),
    } as QueuedInstagramPost,
  ];

  test("sortQueueItems", () => {
    console.log(sortQueueItems(mockQueueItemsArray));
    expect(
      _.isEqual(expectedQueueItemsArray, sortQueueItems(mockQueueItemsArray))
    ).toBe(true);
  });
});
