export interface AddressResource {
  street: string;
  district: string;
}

export interface MoneyResource {
  amount: number;
  currency: string;
}

export interface GeoLocationResource {
  latitude: number;
  longitude: number;
}

export interface PlaceResource {
  address: string;
  latitude: number;
  longitude: number;
}

export interface PartyResource {
  name: string;
  phone: string | null;
}
