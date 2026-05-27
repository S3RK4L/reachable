// brings in the express framework so we can create a web server
import express from 'express';
import cors from 'cors';

// brings in dotenv so we can read our .env file
import dotenv from 'dotenv';

// importing our own functions
import { fetchTicketmasterEvents } from './services/ticketmaster';
import { fetchSkiddleEvents } from './services/skiddle';
import {
  resolveCityToCoordinates,
  resolvePostcodeToCoordinates,
  toGeoHash,
} from './services/geocoding';
import { getTravelTimes } from './services/ors';
import { ReachableEvent } from './types/event';
import { Coordinates } from './types/coordinates';

// dotenv loads our .env file so process.env variables are available throughout the app
dotenv.config();

// creates our express application instance
const app = express();

// uses the PORT env variable if set, otherwise defaults to 3001
const PORT = process.env.PORT || 3001;

app.use(cors());

// tells express to automatically parse incoming JSON request bodies
app.use(express.json());

// registers a GET endpoint at /health that returns a simple json response
// used to check the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/test-ticketmaster', async (req, res) => {
  // Retrieve city name from req, for now hardcode
  const city: string = 'London';
  const country: string = 'UK';

  const coordinates = await resolveCityToCoordinates(city, country);
  const geoPoint = toGeoHash(coordinates);

  const response = await fetchTicketmasterEvents(
    geoPoint,
    '2026-04-02T00:00:00Z',
    '2026-04-04T23:59:00Z',
  );
  res.json(response);
});

app.get('/test-skiddle', async (req, res) => {
  // Retrieve city name from req, for now hardcode
  const city: string = 'London';
  const country: string = 'UK';

  const coordinates = await resolveCityToCoordinates(city, country);
  const geoPoint = toGeoHash(coordinates);

  const response = await fetchSkiddleEvents(
    coordinates.lat,
    coordinates.lng,
    '2026-04-02T00:00:00Z',
    '2026-04-04T23:59:00Z',
  );
  res.json(response);
});

app.get('/test-city-to-coordinates', async (req, res) => {
  // Retrieve city name from req, for now hardcode
  const city: string = 'London';
  const country: string = 'UK';

  const coordinates = await resolveCityToCoordinates(city, country);
  const response = toGeoHash(coordinates);
  res.json(response);
});

app.get('/test-postcode-to-coordinates', async (req, res) => {
  // Retrieve postcode from req, for now hardcode
  const postcode: string = 'EC1A 1BB';

  const coordinates = await resolvePostcodeToCoordinates(postcode);
  const response = toGeoHash(coordinates);
  res.json(response);
});

app.get('/events', async (req, res) => {
  if (!req.query.location || !req.query.startDate || !req.query.endDate) {
    res
      .status(400)
      .json({ error: 'location, startDate and endDate are required' });
    return;
  }

  const location = req.query.location as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
  const isPostcode = postcodeRegex.test(location);

  const coordinates = isPostcode
    ? await resolvePostcodeToCoordinates(location)
    : await resolveCityToCoordinates(location, 'UK');

  const geoPoint = toGeoHash(coordinates);

  // allSettled so one failing source doesn't kill the other
  const results = await Promise.allSettled([
    fetchTicketmasterEvents(geoPoint, startDate, endDate),
    fetchSkiddleEvents(coordinates.lat, coordinates.lng, startDate, endDate),
  ]);

  const events: ReachableEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    }
  }

  const seen = new Map<string, ReachableEvent>();
  for (const event of events) {
    const key = `${toGeoHash(event.venue, 7)}|${event.date}`;
    const existing = seen.get(key);
    if (!existing || existing.source === 'ticketmaster') {
      seen.set(key, event);
    }
  }
  const dedupedEvents = [...seen.values()];

  const destinations = dedupedEvents.map((e) => ({
    lat: e.venue.lat,
    lng: e.venue.lng,
  }));

  const travelTimes = await getTravelTimes(
    coordinates.lat,
    coordinates.lng,
    destinations,
  );

  const eventsWithTravelTimes: ReachableEvent[] = dedupedEvents.map(
    (event, i) => ({
      ...event,
      travelTimeMinutes: travelTimes[i]?.minutes,
    }),
  );

  res.json(eventsWithTravelTimes);
});

app.get('/test-ors-matrix', async (req, res) => {
  // Retrieve postcode from req, for now hardcode
  const postcode: string = 'EC1A 1BB';

  const originCoordinates = await resolvePostcodeToCoordinates(postcode);
  const geoPoint = toGeoHash(originCoordinates);
  const events = await fetchTicketmasterEvents(
    geoPoint,
    '2026-05-11T00:00:00Z',
    '2026-05-20T23:59:00Z',
  );

  // Takes origin coordinates and event coordinates to find travel time
  const travelTimeMinutes = await getTravelTimes(
    originCoordinates.lat,
    originCoordinates.lng,
    [{ lat: events[0].venue.lat, lng: events[0].venue.lng }],
  );

  res.json(travelTimeMinutes);
});

// starts the server and tells it to listen for incoming requests on our port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
