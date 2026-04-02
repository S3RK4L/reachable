import axios from 'axios';
import { Coordinates } from '../types/coordinates';
import geohash from 'ngeohash';

// Only using Nominatim library for now to keep it simple
// Will use postcodes.io in future for uk postcodes so its more accurate

const nominatimURL: string = 'https://nominatim.openstreetmap.org/search?';

interface NominatimResponse {
  lat: string;
  lon: string;
}

export async function resolveCityToCoordinates(
  city: string,
  country: string,
): Promise<Coordinates> {
  const queryString = `${nominatimURL}format=json&country=${country}&city=${city}`;
  const response = await axios.get<NominatimResponse[]>(queryString, {
    headers: {
      'User-Agent': 'reachable-app',
    },
  });

  if (response.data.length === 0) {
    throw new Error(`No coordinates found for city: ${city}`);
  }

  return {
    lat: parseFloat(response.data[0].lat),
    lng: parseFloat(response.data[0].lon),
  };
}

export function toGeoHash(coordinates: Coordinates): string {
  return geohash.encode(coordinates.lat, coordinates.lng);
}
