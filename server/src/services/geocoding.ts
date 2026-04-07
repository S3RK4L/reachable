// Resolves city names and UK postcodes to coordinates
// using Nominatim and Postcodes.io

import axios from 'axios';
import { Coordinates } from '../types/coordinates';
import geohash from 'ngeohash';

const nominatimURL: string = 'https://nominatim.openstreetmap.org/search?';
const postcodesIOURL: string = 'https://api.postcodes.io/postcodes/';

interface NominatimResponse {
  lat: string;
  lon: string;
}

interface PostcodesIOResponse {
  result: {
    latitude: number;
    longitude: number;
  };
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

/*
 * Retrieves coordinates for UK style postcodes
 */
export async function resolvePostcodeToCoordinates(
  postcode: string,
): Promise<Coordinates> {
  const queryString = `${postcodesIOURL}${postcode}`;
  const response = await axios.get<PostcodesIOResponse>(queryString);

  if (!response.data.result) {
    throw new Error(`No coordinates found for postcode: ${postcode}`);
  }

  return {
    lat: response.data.result.latitude,
    lng: response.data.result.longitude,
  };
}

export function toGeoHash(coordinates: Coordinates): string {
  return geohash.encode(coordinates.lat, coordinates.lng);
}
