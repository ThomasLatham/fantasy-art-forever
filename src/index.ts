import express from "express";
import morgan from "morgan";

import { postToInstagram, setPostingTime } from "./controllers/instagram-posts";
import { refillQueue } from "./controllers/reddit-posts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.post("/reddit-posts", refillQueue);
app.put("/posting-times", setPostingTime);
app.post("/instagram-posts", postToInstagram);

// Spin up the server on Render
app.get("/server", (request, response) => {
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  return response.status(200).json({ message: "OK: Server spun up." });
});

// Catch all handler for all other request.
app.use("*", (request, response) => {
  return response
    .status(404)
    .json({ message: "Not Found: No route handler found." });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Fantasy Art Forever listening on ${port}`);
});
