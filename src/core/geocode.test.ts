// geocode.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeoLookup } from './geocode';

// Mock fetch globally for all tests
globalThis.fetch = vi.fn();


console.warn = vi.fn();

describe('Geocode', () => {
  let geocode: GeoLookup;
  
  // Example country code and name for testing
  const testCode = 'US';
  const testName = 'United States';

  beforeEach(() => {
    geocode = new GeoLookup();
    vi.clearAllMocks();
  });

  describe('Basic instantiation and core methods', () => {
    it('should create an instance', () => {
      expect(geocode).toBeInstanceOf(GeoLookup);
    });

    it('should get country data by ISO code', () => {
      const country = geocode.getCountryByIsoCode(testCode);
      console.log('🔍 Country data for', testCode, ':', country);
      
      expect(country).toBeDefined();
      expect(country?.isoCode).toBe(testCode);
      expect(country?.name).toBe(testName);
    });

    it('should handle case insensitive ISO codes', () => {
      const countryUpper = geocode.getCountryByIsoCode('us');
      const countryLower = geocode.getCountryByIsoCode('US');
      expect(countryUpper).toEqual(countryLower);
    });

    it('should return undefined for invalid ISO code', () => {
      const country = geocode.getCountryByIsoCode('XX');
      expect(country).toBeUndefined();
    });

    it('should get all countries', () => {
      const countries = geocode.getAllCountries();
      console.log('📊 Total countries:', countries.length);
      console.log('📋 First 3 countries:', countries.slice(0, 3));
      
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      expect(countries[0]).toHaveProperty('isoCode');
      expect(countries[0]).toHaveProperty('name');
      expect(countries[0]).toHaveProperty('phoneCode');
    });

    it('should get countries sorted by name', () => {
      const countries = geocode.getCountriesSorted();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      
      // Check if sorted alphabetically
      for (let i = 1; i < countries.length; i++) {
        expect(countries[i].name.localeCompare(countries[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Search functionality', () => {
    it('should search country by exact name', () => {
      const results = geocode.searchCountries(testName);
      console.log('Search results for', testName, ':', results);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      const foundCountry = results.find(country => country.name === testName);
      expect(foundCountry).toBeDefined();
    });

    it('should search country by partial name', () => {
      const results = geocode.searchCountries('United');
      console.log('Search results for "United":', results.map(c => c.name));
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      const foundCountry = results.find(country => country.name.includes('United'));
      expect(foundCountry).toBeDefined();
    });

    it('should return all countries when search query is empty', () => {
      const allCountries = geocode.getAllCountries();
      const emptyResults = geocode.searchCountries('');
      expect(emptyResults.length).toBe(allCountries.length);
    });

    it('should handle search with options', () => {
      const results = geocode.searchCountries('United', { 
        limit: 2,
        sortBy: 'name' 
      });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should search by ISO code when no name matches', () => {
      const results = geocode.searchCountries(testCode);
      expect(results.length).toBeGreaterThan(0);
      const foundCountry = results.find(country => country.isoCode === testCode);
      expect(foundCountry).toBeDefined();
    });
  });

  describe('Phone code functionality', () => {
    it('should get countries by phone code', () => {
      const countries = geocode.getCountriesByPhoneCode('+1');
      console.log('Countries with +1 phone code:', countries.map(c => c.name));
      
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      expect(countries[0].phoneCode).toBe('+1');
    });

    it('should handle phone code without plus sign', () => {
      const countriesWithPlus = geocode.getCountriesByPhoneCode('+1');
      const countriesWithoutPlus = geocode.getCountriesByPhoneCode('1');
      expect(countriesWithPlus).toEqual(countriesWithoutPlus);
    });

    it('should return empty array for invalid phone code', () => {
      const countries = geocode.getCountriesByPhoneCode('+999999');
      expect(countries).toEqual([]);
    });
  });

  describe('Phone number utilities', () => {
    it('should get phone format for country', () => {
      const format = geocode.getPhoneFormat(testCode);
      expect(typeof format).toBe('string');
      expect(format.length).toBeGreaterThan(0);
    });

    it('should format phone number according to country format', () => {
      const formatted = geocode.formatPhoneNumber('1234567890', testCode);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
      // Should contain the digits
      expect(formatted.replace(/\D/g, '')).toBe('1234567890');
    });

    it('should validate phone number for country', () => {
      const isValid = geocode.validatePhoneNumber('1234567890', testCode);
      expect(typeof isValid).toBe('boolean');
    });

    it('should parse international phone number', () => {
      const parsed = geocode.parsePhoneNumber('+11234567890');
      if (parsed) {
        expect(parsed).toHaveProperty('countryCode');
        expect(parsed).toHaveProperty('nationalNumber');
        expect(parsed).toHaveProperty('isValid');
      }
    });

    it('should return null for invalid phone number format', () => {
      const parsed = geocode.parsePhoneNumber('1234567890'); // No country code
      expect(parsed).toBeNull();
    });
  });

  describe('Flag utilities', () => {
    it('should get country flag URL by code', () => {
      const flagUrl = geocode.getFlagUrl(testCode);
      expect(flagUrl).toBeDefined();
      expect(typeof flagUrl).toBe('string');
      expect(flagUrl.length).toBeGreaterThan(0);
      expect(flagUrl).toContain('.svg');
    });

    it('should return default flag URL for invalid country code', () => {
      const flagUrl = geocode.getFlagUrl('XX');
      expect(flagUrl).toContain('default.svg');
    });

    it('should load flag SVG content', async () => {
      const mockSvgContent = '<svg>mock flag</svg>';
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvgContent)
      });

      const svgContent = await geocode.loadFlagSvg(testCode);
      expect(svgContent).toBe(mockSvgContent);
      expect(fetch).toHaveBeenCalledWith(geocode.getFlagUrl(testCode));
    });

    it('should handle flag loading failure gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const svgContent = await geocode.loadFlagSvg(testCode);
      expect(svgContent).toBe('');
    });

    it('should get country with flag data', async () => {
      const mockSvgContent = '<svg>mock flag</svg>';
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvgContent)
      });

      const countryWithFlag = await geocode.getCountryWithFlag(testCode);
      console.log('Country with flag data:', {
        name: countryWithFlag?.name,
        isoCode: countryWithFlag?.isoCode,
        flagUrl: countryWithFlag?.flagUrl,
        hasFlagContent: !!countryWithFlag?.flagSvgContent
      });
      
      expect(countryWithFlag).not.toBeNull();
      expect(countryWithFlag?.isoCode).toBe(testCode);
      expect(countryWithFlag?.flagUrl).toBeDefined();
      expect(countryWithFlag?.flagSvgContent).toBe(mockSvgContent);
    });

    it('should return null for invalid country code in getCountryWithFlag', async () => {
      const countryWithFlag = await geocode.getCountryWithFlag('XX');
      expect(countryWithFlag).toBeNull();
    });
  });

  describe('User country detection', () => {
    it('should detect user country', async () => {
      const mockGeoData = { country_code: 'US' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeoData)
      });

      const userCountry = await geocode.detectUserCountry();
      expect(userCountry).not.toBeNull();
      expect(userCountry?.isoCode).toBe('US');
    });

    it('should fallback to default country when detection fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Geolocation failed'));

      const userCountry = await geocode.detectUserCountry();
      expect(userCountry?.isoCode).toBe('US'); // Default fallback
    });

    it('should get and set user country', () => {
      const testCountry = geocode.getCountryByIsoCode('CA');
      expect(testCountry).toBeDefined();
      
      geocode.setUserCountry(testCountry!);
      const userCountry = geocode.getUserCountry();
      expect(userCountry).toEqual(testCountry);
    });
  });

  describe('Configuration', () => {
    it('should accept custom configuration', () => {
      const customConfig = {
        flagBasePath: 'https://custom-flags.com/',
        fallbackCountry: 'GB'
      };
      const customGeocode = new GeoLookup(customConfig);
      expect(customGeocode).toBeInstanceOf(GeoLookup);
      
      const flagUrl = customGeocode.getFlagUrl('US');
      expect(flagUrl).toContain('custom-flags.com');
    });

    it('should use caching when enabled', async () => {
      const mockSvgContent = '<svg>cached flag</svg>';
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSvgContent)
      });

      // First call should fetch
      await geocode.loadFlagSvg(testCode);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const cachedContent = await geocode.loadFlagSvg(testCode);
      expect(fetch).toHaveBeenCalledTimes(1); // No additional fetch
      expect(cachedContent).toBe(mockSvgContent);
    });
  });
});

// Additional test for edge cases
describe('Geocode Edge Cases', () => {
  let geocode: GeoLookup;

  beforeEach(() => {
    geocode = new GeoLookup();
  });

  it('should handle empty or null search queries', () => {
    expect(() => geocode.searchCountries('')).not.toThrow();
    expect(() => geocode.searchCountries(null as any)).not.toThrow();
    expect(() => geocode.searchCountries(undefined as any)).not.toThrow();
  });

  it('should handle special characters in search', () => {
    const results = geocode.searchCountries("Côte d'Ivoire");
    expect(Array.isArray(results)).toBe(true);
  });

  it('should handle whitespace in search queries', () => {
    const results = geocode.searchCountries('  United States  ');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle case insensitive search', () => {
    const lowerResults = geocode.searchCountries('united states');
    const upperResults = geocode.searchCountries('UNITED STATES');
    expect(lowerResults).toEqual(upperResults);
  });
});