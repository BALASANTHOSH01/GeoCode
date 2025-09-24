import { useMemo } from 'react';
import { Geocode } from '../core/geocode';
import type { CountryData, GeocodeConfig, SearchOptions } from '../types';

export const useGeocode = (config?: GeocodeConfig) => {
  const geocodeInstance = useMemo(() => new Geocode(config), [config]);
  
  return useMemo(() => ({
    getAllCountries: () => geocodeInstance.getAllCountries(),
    getCountriesSorted: () => geocodeInstance.getCountriesSorted(),
    getCountryByIsoCode: (code: string) => geocodeInstance.getCountryByIsoCode(code),
    searchCountries: (query: string, options?: SearchOptions) =>
      geocodeInstance.searchCountries(query, options),
    formatPhoneNumber: (number: string, countryCode: string) =>
      geocodeInstance.formatPhoneNumber(number, countryCode),
    detectUserCountry: () => geocodeInstance.detectUserCountry(),
    loadFlagSvg: (countryCode: string) => geocodeInstance.loadFlagSvg(countryCode),
    getCountryWithFlag: (countryCode: string) => geocodeInstance.getCountryWithFlag(countryCode),
    getFlagUrl: (countryCode: string) => geocodeInstance.getFlagUrl(countryCode),
    parsePhoneNumber: (number: string) => geocodeInstance.parsePhoneNumber(number),
    validatePhoneNumber: (number: string, countryCode: string) =>
      geocodeInstance.validatePhoneNumber(number, countryCode),
    getUserCountry: () => geocodeInstance.getUserCountry(),
    setUserCountry: (country: CountryData) => geocodeInstance.setUserCountry(country),
  }), [geocodeInstance]);
};
