# Reachable

Reachable is an event discovery app that finds things happening near you based on how long you're actually willing to travel, not just a distance in miles. Enter your location, set a maximum journey time, and Reachable pulls events from multiple sources, filters them by real travel time using Openrouteservice, and shows you only what you can genuinely get to.
Built as a portfolio project to practise TypeScript, React, Node.js, API integration and caching.

## Core MVP

- User enters a location manually (no geolocation yet, keep it simple)
- User selects a maximum travel time (e.g. 30 mins, 1 hour, 90 mins, 2 hours)
- Backend fetches events from Ticketmaster and Skiddle in parallel
- Google Maps Distance Matrix filters out events the user can't reach in time
- Results are normalised into a consistent format regardless of source
- Basic event cards displayed on the frontend showing name, date, venue, travel time and source
- Redis caching on backend to avoid hammering external APIs

## Out of scope for MVP (post-MVP)

- Browser geolocation
- Map view with pins
- Category/genre filtering
- User accounts or saved searches
- Transport mode selection (driving vs public transport)
- Mobile optimisation

## Tech Stack

- TypeScript
- Node.js
- MongoDB

## Running Locally

```bash
npm install
npx tsc
node dist/index.js
```

---

## Market Research

### The Problem With Existing Apps

Every event discovery app out there, Eventbrite, Skiddle, AllEvents, filters by distance in miles as the crow flies. The problem is that's not how people actually think about travel. Nobody says "I'll go if it's within 30 miles." They say "I'll go if it's within an hour."
A straight line distance means nothing when you're dealing with motorways, train routes, or rural roads. 30 miles could be 40 minutes or it could be 2 hours depending on where you are.
Users are already frustrated by this. AllEvents has reviews complaining that events 40km away show up when they've set a 10km filter. That's not a bug, that's the fundamental flaw in filtering by radius.

### Why Nobody Has Fixed It

Honestly it's harder and more expensive than it looks.
Filtering by distance is one maths calculation. Filtering by real journey time means making a live API call for every single event returned. At scale that gets expensive fast and adds latency to every search. Most companies don't want that cost or complexity for a consumer product.
There was an app called Gravy that did predict drive times to events, but it was US only and it's no longer around.

### The Reachable Approach

Reachable isn't trying to compete with those apps. It's a portfolio project built to explore whether this problem can be solved cleanly at a small scale.
Rather than using Google Maps, Reachable uses Openrouteservice, a free open source routing API built on OpenStreetMap, to calculate real journey times between your location and each event venue. On top of that, journey times between fixed points are cached in Redis, so if someone else has already searched the same route, we serve it instantly without touching the API again. Venues don't move, so those cached results stay valid indefinitely.
The result is something that's free to run, gets faster with usage, and actually answers the question people are asking.

Built by [Kali Hinder](https://github.com/S3RK4L)
