// Fetches events from the Skiddle API and
// normalises them into ReachableEvent format

import axios from 'axios';
import { ReachableEvent } from '../types/event';

const radiusNet = 100;
const skiddleEventsURL: string =
  'https://www.skiddle.com/api/v1/events/search/?';

interface SkiddleRawEvent {
  id: string;
  eventname: string;
  date: string; // YYYY-MM-DD
  link: string;
  venue: {
    id: string;
    name: string;
    town: string;
    postcode_lookup: string;
    latitude: number;
    longitude: number;
  };
}

interface SkiddleResponse {
  results: SkiddleRawEvent[];
}

export async function fetchSkiddleEvents(
  lat: number,
  lng: number,
  startDateTime: string,
  endDateTime: string,
): Promise<ReachableEvent[]> {
  const queryString = `${skiddleEventsURL}radius=${radiusNet}&latitude=${lat}&longitude=${lng}&minDate=${startDateTime.split('T')[0]}&maxDate=${endDateTime.split('T')[0]}&limit=5&order=distance&api_key=${process.env.SKIDDLE_API_KEY}`;
  const response = await axios.get(queryString);

  if (!response.data.results) {
    throw new Error(
      `No events found for Location: ${lat},${lng}  within date range ${startDateTime} - ${endDateTime}`,
    );
  }

  const skiddleEvents: ReachableEvent[] = [];
  for (const event of response.data.results) {
    console.log('Response venue: ', JSON.stringify(event.venue));
    skiddleEvents.push({
      id: event.id,
      name: event.eventname,
      date: event.date,
      venue: {
        name: event.venue.name,
        address:
          event.venue.address +
          ' ' +
          event.venue.postcode +
          ' ' +
          event.venue.town,
        lat: parseFloat(event.venue.latitude),
        lng: parseFloat(event.venue.longitude),
      },
      url: event.link,
      source: 'skiddle',
    });
  }

  return skiddleEvents;
}

// TODO: Use redis for caching
