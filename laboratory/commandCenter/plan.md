# Application Development Planning

## To Do
The grand issue-tracking technology for this application.

- [ ] migrate from Next.js to something else (probably Express via some hosting service) because
  the calls to the create-Instagram-post endpoint are timing out
  - started with Cyclic, but the CI kept failing without descriptive errors
  - now trying with Render

## Hurdles Overcome
Here we keep track of obstacles faced and overcome during development.

- [x] partition the core functionalities (sourcing posts from Reddit and posting to Instagram) into
  two different stages
- [x] migrate from local database (sqlite) to cloud database (postgres via Supabase)
- [x] Instagram account got disabled (make a new one!)
  