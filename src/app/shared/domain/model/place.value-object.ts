import {GeoLocation} from './geo-location.value-object';

/** An address written by the user plus the exact point picked on the map. */
export interface Place {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export const emptyPlace = (): Place => ({ address: '', latitude: null, longitude: null });

/** Validates a place picked on the map: it needs an address and a valid point. */
export const assertPlace = (place: Place): Place => {
  if (!place.address?.trim()) throw new Error('validation.address-required');
  if (place.latitude === null) throw new Error('validation.latitude-invalid');
  if (place.longitude === null) throw new Error('validation.longitude-invalid');
  const location = new GeoLocation({ latitude: place.latitude, longitude: place.longitude });
  return { address: place.address.trim(), latitude: location.latitude, longitude: location.longitude };
};
