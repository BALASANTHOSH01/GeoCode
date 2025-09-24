// types.ts
export interface CountryData {
  isoCode: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export interface CountryWithFlag extends CountryData {
  flagSvgContent?: string | null;
  flagUrl?: string;
}

export interface GeocodeConfig {
  flagBasePath?: string;
  geoLocationService?: string;
  enableCache?: boolean;
  fallbackCountry?: string;
}

export interface PhoneNumberFormat {
  countryCode: string;
  nationalNumber: string;
  isValid: boolean;
  formatted?: string;
}

export interface SearchOptions {
  limit?: number;
  includeAlternativeNames?: boolean;
  sortBy?: "name" | "code" | "relevance";
}