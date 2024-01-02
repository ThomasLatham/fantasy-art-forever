import express from "express";

import { postToInstagram, setPostingTime } from "./instagram-posts";
import { refillQueue } from "./reddit-posts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/reddit-posts", refillQueue);
app.put("/posting-times", setPostingTime);
app.post("/instagram-posts", postToInstagram);
