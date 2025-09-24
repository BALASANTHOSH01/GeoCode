import { computed } from 'vue';
import { GeoLookup } from '../core/geocode';
import type { CountryData, GeocodeConfig, SearchOptions } from '../types';

export const useGeocode = (config?: GeocodeConfig) => {
  const geocodeInstance = computed(() => new GeoLookup(config));
  
  return {
    getAllCountries: () => geocodeInstance.value.getAllCountries(),
    getCountriesSorted: () => geocodeInstance.value.getCountriesSorted(),
    getCountryByIsoCode: (code: string) => geocodeInstance.value.getCountryByIsoCode(code),
    searchCountries: (query: string, options?: SearchOptions) =>
      geocodeInstance.value.searchCountries(query, options),
    formatPhoneNumber: (number: string, countryCode: string) =>
      geocodeInstance.value.formatPhoneNumber(number, countryCode),
    detectUserCountry: () => geocodeInstance.value.detectUserCountry(),
    loadFlagSvg: (countryCode: string) => geocodeInstance.value.loadFlagSvg(countryCode),
    getCountryWithFlag: (countryCode: string) => geocodeInstance.value.getCountryWithFlag(countryCode),
    getFlagUrl: (countryCode: string) => geocodeInstance.value.getFlagUrl(countryCode),
    parsePhoneNumber: (number: string) => geocodeInstance.value.parsePhoneNumber(number),
    validatePhoneNumber: (number: string, countryCode: string) =>
      geocodeInstance.value.validatePhoneNumber(number, countryCode),
    getUserCountry: () => geocodeInstance.value.getUserCountry(),
    setUserCountry: (country: CountryData) => geocodeInstance.value.setUserCountry(country),
  };
};
