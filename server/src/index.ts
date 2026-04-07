// brings in the express framework so we can create a web server
import express from 'express';

// brings in dotenv so we can read our .env file
import dotenv from 'dotenv';

// importing our own functions
import { fetchTicketmasterEvents } from './services/ticketmaster';
import {
  resolveCityToCoordinates,
  resolvePostcodeToCoordinates,
  toGeoHash,
} from './services/geocoding';
import { getOriginToEventTravelTime } from './services/ors';

// dotenv loads our .env file so process.env variables are available throughout the app
dotenv.config();

// creates our express application instance
const app = express();

// uses the PORT env variable if set, otherwise defaults to 3001
const PORT = process.env.PORT || 3001;

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

app.get('/test-ors-matrix', async (req, res) => {
  // Retrieve postcode from req, for now hardcode
  const postcode: string = 'EC1A 1BB';

  const originCoordinates = await resolvePostcodeToCoordinates(postcode);
  const geoPoint = toGeoHash(originCoordinates);
  const events = await fetchTicketmasterEvents(
    geoPoint,
    '2026-04-02T00:00:00Z',
    '2026-04-04T23:59:00Z',
  );

  // Takes origin coordinates and event coordinates to find travel time
  const travelTimeMinutes = await getOriginToEventTravelTime(
    originCoordinates.lat,
    originCoordinates.lng,
    events[0].venue.lat,
    events[0].venue.lng,
  );

  res.json(travelTimeMinutes);
});

// starts the server and tells it to listen for incoming requests on our port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
