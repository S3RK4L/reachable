// Calculates travel time between two points
// using the OpenRouteService directions API

import axios from 'axios';

const orsURL: string =
  'https://api.openrouteservice.org/v2/directions/driving-car';

interface ORSResponse {
  summary: {
    duration: number; // seconds
    distance: number; // metres
  };
}

interface TravelTime {
  minutes: number;
}

export async function getOriginToEventTravelTime(
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
): Promise<TravelTime> {
  // Note: ORS API takes longitude then latitude
  const data = {
    coordinates: [
      [originLng, originLat],
      [destinationLng, destinationLat],
    ],
  };

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTESERVICE_API_KEY}`,
    },
  };

  const response = await axios.post<{ routes: ORSResponse[] }>(
    orsURL,
    data,
    config,
  );

  if (response.data.routes.length === 0) {
    throw new Error(`Unable to find travel time `);
  }

  return {
    minutes: Math.floor(response.data.routes[0].summary.duration / 60),
  };
}
