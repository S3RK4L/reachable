// GOAL:
// Call Ticketmaster API with location and date range parameters
// Normalise the response to fit with our ReachableEvent object shape
// Return the normalised events (Redis caching comes later)

// Example using API
// https://app.ticketmaster.com/discovery/v2/events.json?countryCode=UK&apiKey=<api_key>

// For location:latlong (because user entering location will be converted to coordinates
// to be passed to ticket master), and radius (generous to cast a wide net)
// For date range: startDateTime, endDateTime,

// We'd want to make use of their size, page, and sort parameters too, so we get the most applicable
// events to the search retrieved on page 1

// Ticket master will return a list of events, including lat long to feed into open route service

// Function to retrieve ticket master events using parameters
// Note: once we get this working, lets use geoPoint instead of lat and long, since they are too be depracted

import axios from 'axios';
import { ReachableEvent } from '../types/event';

const radiusNet = 100;
const ticketMasterEventsURL: string =
  'https://app.ticketmaster.com/discovery/v2/events.json?';

interface TicketmasterRawEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  _embedded: {
    venues: Array<{
      name: string;
      postalCode: string;
      address: {
        line1: string;
      };
      city: {
        name: string;
      };
      location: {
        latitude: string;
        longitude: string;
      };
    }>;
  };
}

interface TicketmasterResponse {
  _embedded: {
    events: TicketmasterRawEvent[];
  };
  page: {
    size: number;
  };
}
export async function fetchTicketmasterEvents(
  geoPoint: string,
  startDateTime: string,
  endDateTime: string,
): Promise<ReachableEvent[]> {
  const queryString = `${ticketMasterEventsURL}radius=${radiusNet}&geoPoint=${geoPoint}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&size=5&sort=distance,asc&apikey=${process.env.TICKETMASTER_API_KEY}`;
  const response = await axios.get<TicketmasterResponse>(queryString);

  if (!response.data._embedded) {
    throw new Error(
      `No events found for Geo Point: ${geoPoint} within date range ${startDateTime} - ${endDateTime}`,
    );
  }

  let ticketMasterEvents: ReachableEvent[] = [];
  for (const event of response.data._embedded.events) {
    ticketMasterEvents.push({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      venue: {
        name: event._embedded.venues[0].name,
        address:
          event._embedded.venues[0].address.line1 +
          ' ' +
          event._embedded.venues[0].postalCode +
          ' ' +
          event._embedded.venues[0].city.name,
        lat: parseFloat(event._embedded.venues[0].location.latitude),
        lng: parseFloat(event._embedded.venues[0].location.longitude),
      },
      url: event.url,
      source: 'ticketmaster',
    });
  }

  return ticketMasterEvents;
}

// TODO: Use redis for caching
