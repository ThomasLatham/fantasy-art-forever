import { DateTime } from "luxon";

const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const removeTrailingComma = (str: string): string => {
  if (str.trim().endsWith(",")) {
    return str.slice(0, -1);
  }
  return str;
};

const now = () => {
  return DateTime.now().setZone("America/New_York");
};

const isJpegImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.toLowerCase().includes("image/jpeg")) {
        return true;
      }
    }
  } catch (error) {
    console.error("Error checking image type:", error);
    return false;
  }
  return false;
};

export { wait, removeTrailingComma, now, isJpegImage };
