export interface ReachableEvent {
  id: string;
  name: string;
  date: string;
  venue: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  url: string;
  source: 'ticketmaster' | 'skiddle';
  travelTimeMinutes?: number;
  walkTimeMinutes?: number;
  driveTimeMinutes?: number;
}
