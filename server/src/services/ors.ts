// Calculates travel times from one origin to multiple destinations
// using the OpenRouteService matrix API

import axios from 'axios';

const orsURL: string = 'https://api.openrouteservice.org/v2/matrix/driving-car';

interface ORSMatrixResponse {
  durations: (number | null)[][];
}

interface TravelTime {
  minutes: number;
}

export async function getTravelTimes(
  originLat: number,
  originLng: number,
  destinations: { lat: number; lng: number }[],
): Promise<(TravelTime | null)[]> {
  // ORS API takes [longitude, latitude]
  const locations = [
    [originLng, originLat],
    ...destinations.map((d) => [d.lng, d.lat]),
  ];

  const response = await axios.post<ORSMatrixResponse>(
    orsURL,
    { locations, sources: [0], metrics: ['duration'] },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTESERVICE_API_KEY}`,
      },
    },
  );

  // skip index 0 (origin to itself)
  return response.data.durations[0].slice(1).map((seconds) => {
    if (seconds === null) return null;
    return { minutes: Math.floor(seconds / 60) };
  });
}
