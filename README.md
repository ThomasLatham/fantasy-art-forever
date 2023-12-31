# Fantasy Art Forever
This is a project for posting fantasy art to Instagram daily in an automated fashion, sourcing works
from the [Imaginary Network Expanded](https://old.reddit.com/r/ImaginaryBestOf/wiki/networksublist),
a family of Reddit communities (i.e., subreddits) for sharing and discussing art while maintaining
artist credit. As such, this project also keeps high standards for artist and poster attribution.

*A note for transparency:* As an automated bot, this project doesn't always parse the scraped data
in such a way as to give proper attribution (e.g., the occasional messed-up post title or artist
name), and I apologize for this. Further, in the case of OC (original content) posts to the sourced
subreddits, the bot attributes the work on Instagram using the OP's (original poster's) Reddit
username.

<!-- omit in toc -->
## Table of Contents
1. [Posting Schedule](#posting-schedule)
2. [How It Works](#how-it-works)
3. [Motivation](#motivation)


## Posting Schedule

### Magic Monday
*Art with magical and high-fantasy themes: wizards, witches, elves, dragons and such.* 

Sourced subreddits: [r/ImaginaryWitches](https://www.reddit.com/r/ImaginaryWitches),
[r/ImaginaryWizards](https://www.reddit.com/r/ImaginaryWizards),
[r/ImaginaryDwarves](https://www.reddit.com/r/ImaginaryDwarves),
[r/ImaginaryElves](https://www.reddit.com/r/ImaginaryElves),
[r/ImaginaryDragons](https://www.reddit.com/r/ImaginaryDragons)

---

### Techno Tuesday
*Artistic works with steampunk and cyberpunk themes.*

Sourced subreddits: [r/ImaginaryCybernetics](https://www.reddit.com/r/ImaginaryCybernetics),
[r/ImaginaryCyberpunk](https://www.reddit.com/r/ImaginaryCyberpunk),
[r/ImaginarySteampunk](https://www.reddit.com/r/ImaginarySteampunk),
[r/ImaginaryMechs](https://www.reddit.com/r/ImaginaryMechs),
[r/ImaginaryStarships](https://www.reddit.com/r/ImaginaryStarships)

---

### Warrior Wednesday
*Art of all kinds of fantasy warriors, from sneaky assassins to battered brawlers.*

Sourced subreddits: [r/ImaginaryBattlefields](https://www.reddit.com/r/ImaginaryBattlefields),
[r/ImaginaryArchers](https://www.reddit.com/r/ImaginaryArchers),
[r/ImaginaryAssassins](https://www.reddit.com/r/ImaginaryAssassins),
[r/ImaginaryKnights](https://www.reddit.com/r/ImaginaryKnights),
[r/ImaginarySoldiers](https://www.reddit.com/r/ImaginarySoldiers),
[r/ImaginaryWarriors](https://www.reddit.com/r/ImaginaryWarriors)

---

### Alliteration-Is-Hard Thursday
*I couldn't think of a good "th"-word, so today we just have some random themes: angels, demons,*
*scholars, merfolk and more.*

Sourced subreddits: [r/ImaginaryAngels](https://www.reddit.com/r/ImaginaryAngels),
[r/ImaginaryOrcs](https://www.reddit.com/r/ImaginaryOrcs),
[r/ImaginaryScholars](https://www.reddit.com/r/ImaginaryScholars),
[r/ImaginaryMythology](https://www.reddit.com/r/ImaginaryMythology),
[r/ImaginaryNobles](https://www.reddit.com/r/ImaginaryNobles),
[r/ImaginaryElementals](https://www.reddit.com/r/ImaginaryElementals),
[r/ImaginaryUndead](https://www.reddit.com/r/ImaginaryUndead),
[r/ImaginaryDemons](https://www.reddit.com/r/ImaginaryDemons),
[r/ImaginaryFaeries](https://www.reddit.com/r/ImaginaryFaeries),
[r/ImaginaryMerfolk](https://www.reddit.com/r/ImaginaryMerfolk),
[r/ImaginaryHumans](https://www.reddit.com/r/ImaginaryHumans)

---

### Fandom Friday
*Fantasy art from some cool established universes (Warcraft, Middle Earth, Elder Scrolls and The Witcher), on a rotating schedule.*

Sourced subreddits: [r/ImaginaryAzeroth](https://www.reddit.com/r/ImaginaryAzeroth),
[r/ImaginaryMiddleEarth](https://www.reddit.com/r/ImaginaryMiddleEarth),
[r/ImaginaryTamriel](https://www.reddit.com/r/ImaginaryTamriel),
[r/ImaginaryWitcher](https://www.reddit.com/r/ImaginaryWitcher)

---

### Scenic Saturday
*Art of beautiful places, from majestic landscapes to towering castles.*

Sourced subreddits: [r/ImaginaryArchitecture](https://www.reddit.com/r/ImaginaryArchitecture),
[r/ImaginaryCastles](https://www.reddit.com/r/ImaginaryCastles),
[r/ImaginaryDwellings](https://www.reddit.com/r/ImaginaryDwellings),
[r/ImaginaryPathways](https://www.reddit.com/r/ImaginaryPathways),
[r/ImaginarySeascapes](https://www.reddit.com/r/ImaginarySeascapes),
[r/ImaginaryWildlands](https://www.reddit.com/r/ImaginaryWildlands),
[r/ImaginaryWorlds](https://www.reddit.com/r/ImaginaryWorlds)

---

### Seasonal Sunday
*Art depicting one of the four seasons, on a rotating basis.*

Sourced subreddits: [r/ImaginaryWinterscapes](https://www.reddit.com/r/ImaginaryWinterscapes),
[r/ImaginarySpringscapes](https://www.reddit.com/r/ImaginarySpringscapes),
[r/ImaginarySummerscapes](https://www.reddit.com/r/ImaginarySummerscapes),
[r/ImaginaryAutumnscapes](https://www.reddit.com/r/ImaginaryAutumnscapes)

## How It Works

### Sourcing Posts from Reddit
We persist a queue of future Instagram posts such that for every subreddit from which we source
content we always have 1 post queued up and 2 posts as backups. 

When a queued post for some subreddit is used for an Instagram post, that post is removed from the
queue, and the oldest backup post for that subreddit takes its place. The backup posts are
"refilled" periodically — every 6 hours a script runs which checks for missing backups and replaces
them with the top post of the week from the correct subreddit.

The post queue was initialized with the top 3 posts of all time from each sourcing subreddit.

### Posting to Instagram
Once a day, we post to Instagram according to the above posting schedule.

If post creation fails due to something about the sourced Reddit post, then we try posting with the
oldest backup. If it succeeds then we dequeue both the succeeding backup and the failing queued
post. If the backup fails due to something about the sourced Reddit post, then we try with the other
backup, dequeuing all 3 in case of success or Reddit-post-induced failure.

The time of day Instagram posts are made is randomized between 5 different times: 6 am, 9 am, 12 pm,
3 pm and 6 pm (all Eastern Time).

### Technologies Used
The bot is a [Next.js](https://nextjs.org/) application hosted on [Vercel](https://vercel.com/home).
You might be thinking, "[~~But isn't Betty a woman's name?~~](https://www.youtube.com/watch?v=pz1rjq5emKY&ab_channel=Dude902) But isn't Next.js a
frontend framework?" The answer to that is "Yes;" however, Next.js offers a very convenient (and
free) way to define public API endpoints, and we can store the business logic of the application in
such endpoints.

Having one endpoint for the logic of sourcing Reddit posts and another for the logic of posting to
Instagram, we then use the cron-scheduling service [cron-job.org](https://cron-job.org/en/) (also
free; maybe you're starting to see a theme here) to call those endpoints on set schedules.

## Motivation
There are a few reasons I made this bot:
1. I like automating things and wanted to successfully automate a bot like this.
2. I like fantasy art, having even once been a pretty active moderator/contributor/consumer of the
   INE, and it's cool to share it with others.
3. I might want to do some analysis on the data this app scrapes and produces.
4. It's something to blog about. 