import { ALTERNATIVE_NAMES, COUNTRY_DATA, PHONE_FORMATS } from "../data/countries";
import type { CountryData, CountryWithFlag, GeocodeConfig, PhoneNumberFormat, SearchOptions } from "../types";

export class GeoLookup {
  private config: GeocodeConfig;
  private flagCache = new Map<string, string>();
  private phoneCodeMap = new Map<string, CountryData[]>();
  private countryNameMap = new Map<string, CountryData[]>();
  private isoCodeMap = new Map<string, CountryData>();
  private userCountry: CountryData | null = null;

  constructor(config: GeocodeConfig = {}) {
    this.config = {
      flagBasePath: 'https://ik.imagekit.io/99y1fc9mh/Uniconnect/Flags/',
      geoLocationService: 'https://ipapi.co/json/',
      enableCache: true,
      fallbackCountry: 'US',
      ...config,
    };

    this.initializeLookupMaps();
  }

  private initializeLookupMaps(): void {
    Object.entries(COUNTRY_DATA).forEach(([isoCode, data]) => {
      const countryData: CountryData = { isoCode, ...data };

      // ISO code mapping
      this.isoCodeMap.set(isoCode.toUpperCase(), countryData);
      this.isoCodeMap.set(isoCode.toLowerCase(), countryData);

      // Phone code mapping
      const phoneKey1 = data.phoneCode;
      const phoneKey2 = data.phoneCode.replace('+', '');

      [phoneKey1, phoneKey2].forEach(key => {
        if (!this.phoneCodeMap.has(key)) {
          this.phoneCodeMap.set(key, []);
        }
        this.phoneCodeMap.get(key)!.push(countryData);
      });

      // Country name mapping
      const nameKey = data.name.toLowerCase();
      if (!this.countryNameMap.has(nameKey)) {
        this.countryNameMap.set(nameKey, []);
      }
      this.countryNameMap.get(nameKey)!.push(countryData);

      // Alternative names
      const alternatives = ALTERNATIVE_NAMES[data.name] || [];
      alternatives.forEach(alt => {
        const altKey = alt.toLowerCase();
        if (!this.countryNameMap.has(altKey)) {
          this.countryNameMap.set(altKey, []);
        }
        this.countryNameMap.get(altKey)!.push(countryData);
      });
    });
  }

  // Core Methods
  getAllCountries(): CountryData[] {
    return Object.entries(COUNTRY_DATA).map(([isoCode, data]) => ({
      isoCode,
      ...data,
    }));
  }

  getCountriesSorted(): CountryData[] {
    return this.getAllCountries().sort((a, b) => a.name.localeCompare(b.name));
  }

  getCountryByIsoCode(isoCode: string): CountryData | undefined {
    return this.isoCodeMap.get(isoCode.toUpperCase());
  }

  getCountriesByPhoneCode(phoneCode: string): CountryData[] {
    const cleanCode = phoneCode.replace(/^\+/, '');
    return (
      this.phoneCodeMap.get(`+${cleanCode}`) ||
      this.phoneCodeMap.get(cleanCode) ||
      []
    );
  }

  searchCountries(query: string, options: SearchOptions = {}): CountryData[] {
    if (!query?.trim()) {
      return options.sortBy === 'name' ? this.getCountriesSorted() : this.getAllCountries();
    }

    const searchTerm = query.toLowerCase().trim();
    const results = new Set<CountryData>();

    // Search by name
    this.countryNameMap.forEach((countries, name) => {
      if (name.includes(searchTerm)) {
        countries.forEach(country => results.add(country));
      }
    });

    // Search by ISO code if no name matches
    if (results.size === 0) {
      this.isoCodeMap.forEach((country, code) => {
        if (code.toLowerCase().includes(searchTerm)) {
          results.add(country);
        }
      });
    }

    const resultArray = Array.from(results);
    
    if (options.limit) {
      return resultArray.slice(0, options.limit);
    }

    return options.sortBy === 'name' 
      ? resultArray.sort((a, b) => a.name.localeCompare(b.name))
      : resultArray;
  }

  // Phone number utilities
  getPhoneFormat(countryCode: string): string {
    return PHONE_FORMATS[countryCode.toUpperCase()] || PHONE_FORMATS.DEFAULT;
  }

  formatPhoneNumber(phoneNumber: string, countryCode: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const format = this.getPhoneFormat(countryCode);

    let formatted = '';
    let numberIndex = 0;

    for (let i = 0; i < format.length && numberIndex < cleanNumber.length; i++) {
      if (format[i] === '0') {
        formatted += cleanNumber[numberIndex];
        numberIndex++;
      } else {
        formatted += format[i];
      }
    }

    return formatted;
  }

  validatePhoneNumber(phoneNumber: string, countryCode: string): boolean {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const format = this.getPhoneFormat(countryCode);
    const expectedLength = format.replace(/\D/g, '').length;

    return cleanNumber.length === expectedLength;
  }

  parsePhoneNumber(fullPhoneNumber: string): PhoneNumberFormat | null {
    const cleaned = fullPhoneNumber.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+')) {
      return null;
    }

    // Try to match country codes (1-4 digits)
    for (let i = 4; i >= 1; i--) {
      const potentialCode = cleaned.substring(0, i + 1);
      const countries = this.getCountriesByPhoneCode(potentialCode);

      if (countries.length > 0) {
        const nationalNumber = cleaned.substring(i + 1);
        const countryCode = countries[0].isoCode;
        const isValid = this.validatePhoneNumber(nationalNumber, countryCode);

        return {
          countryCode,
          nationalNumber,
          isValid,
          formatted: isValid ? this.formatPhoneNumber(nationalNumber, countryCode) : undefined,
        };
      }
    }

    return null;
  }

  // Flag utilities
  getFlagUrl(countryCode: string): string {
    const country = this.getCountryByIsoCode(countryCode);
    if (!country) {
      return `${this.config.flagBasePath}default.svg`;
    }
    return `${this.config.flagBasePath}${country.flag}`;
  }

  async loadFlagSvg(countryCode: string): Promise<string> {
    const cacheKey = countryCode.toUpperCase();

    // Return cached version if available
    if (this.config.enableCache && this.flagCache.has(cacheKey)) {
      return this.flagCache.get(cacheKey)!;
    }

    try {
      const flagUrl = this.getFlagUrl(countryCode);
      const response = await fetch(flagUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load flag: ${response.statusText}`);
      }

      const svgContent = await response.text();

      if (this.config.enableCache) {
        this.flagCache.set(cacheKey, svgContent);
      }

      return svgContent;
    } catch (error) {
      console.warn(`Failed to load flag for ${countryCode}:`, error);
      return '';
    }
  }

  async getCountryWithFlag(countryCode: string): Promise<CountryWithFlag | null> {
    const country = this.getCountryByIsoCode(countryCode);
    if (!country) {
      return null;
    }

    try {
      const flagSvgContent = await this.loadFlagSvg(countryCode);
      return {
        ...country,
        flagSvgContent,
        flagUrl: this.getFlagUrl(countryCode),
      };
    } catch (error) {
      return {
        ...country,
        flagSvgContent: null,
        flagUrl: this.getFlagUrl(countryCode),
      };
    }
  }

  // Geolocation
  async detectUserCountry(): Promise<CountryData | null> {
    try {
      const response = await fetch(this.config.geoLocationService!);
      const data = await response.json();

      if (data.country_code) {
        const country = this.getCountryByIsoCode(data.country_code);
        if (country) {
          this.userCountry = country;
          return country;
        }
      }
    } catch (error) {
      console.warn('Could not detect user country:', error);
    }

    // Fallback
    const fallback = this.getCountryByIsoCode(this.config.fallbackCountry!);
    if (fallback) {
      this.userCountry = fallback;
    }
    
    return fallback || null;
  }

  getUserCountry(): CountryData | null {
    return this.userCountry;
  }

  setUserCountry(country: CountryData): void {
    this.userCountry = country;
  }
}