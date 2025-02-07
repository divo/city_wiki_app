export interface City {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  isOwned?: boolean;
  iap_id: string;
}

export const cities: City[] = [
  {
    id: 'London',
    name: 'London',
    country: 'United Kingdom',
    imageUrl: 'london_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.london',
  },
  {
    id: 'New York City',
    name: 'New York City',
    country: 'United States',
    imageUrl: 'new_york_city_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.newyork',
  },
  {
    id: 'Paris',
    name: 'Paris',
    country: 'France',
    imageUrl: 'paris_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.paris',
  },
  {
    id: 'Rome',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'rome_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.rome',
  }
]; 