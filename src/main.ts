import { GeoLookup } from './core/geocode';

export * from './types';
export * from './core/geocode';
export * from './utils';
export { COUNTRY_DATA, PHONE_FORMATS, ALTERNATIVE_NAMES } from './data/countries';

// Default instance for convenience (vanilla JS usage)
export const geolookup = new GeoLookup();