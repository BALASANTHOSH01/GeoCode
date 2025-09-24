import { Injectable } from "@angular/core";
import { Observable, from, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
import type { SafeHtml } from "@angular/platform-browser";
import { GeoLookup } from "../core/geocode";
import type {
  CountryData,
  CountryWithFlag,
  GeocodeConfig,
  SearchOptions,
} from "../types";

export interface AngularCountryWithFlag extends CountryWithFlag {
  flagSafeHtml?: SafeHtml;
}

@Injectable({
  providedIn: "root",
})
export class GeocodeService {
  private geocode: GeoLookup;
  private currentUserCountry = new BehaviorSubject<CountryData | null>(null);
  public currentUserCountry$ = this.currentUserCountry.asObservable();

  private sanitizer: DomSanitizer;

  constructor(sanitizer: DomSanitizer, config?: GeocodeConfig) {
    this.sanitizer = sanitizer;
    this.geocode = new GeoLookup(config);
    this.initUserCountryDetection();
  }

  private async initUserCountryDetection(): Promise<void> {
    const country = await this.geocode.detectUserCountry();
    this.currentUserCountry.next(country);
  }

  // Convert async methods to observables
  detectUserCountry(): Observable<CountryData | null> {
    return from(this.geocode.detectUserCountry()).pipe(
      map((country) => {
        this.currentUserCountry.next(country);
        return country;
      })
    );
  }

  loadFlagSvg(countryCode: string): Observable<string> {
    return from(this.geocode.loadFlagSvg(countryCode));
  }

  getCountryWithFlag(
    countryCode: string
  ): Observable<AngularCountryWithFlag | null> {
    return from(this.geocode.getCountryWithFlag(countryCode)).pipe(
      map((country) => {
        if (!country) return null;
        return {
          ...country,
          flagSafeHtml: country.flagSvgContent
            ? this.sanitizer.bypassSecurityTrustHtml(country.flagSvgContent)
            : undefined,
        };
      })
    );
  }

  // Proxy synchronous methods
  getAllCountries = () => this.geocode.getAllCountries();
  getCountriesSorted = () => this.geocode.getCountriesSorted();
  getCountryByIsoCode = (code: string) =>
    this.geocode.getCountryByIsoCode(code);
  searchCountries = (query: string, options?: SearchOptions) =>
    this.geocode.searchCountries(query, options);
  formatPhoneNumber = (number: string, countryCode: string) =>
    this.geocode.formatPhoneNumber(number, countryCode);
  parsePhoneNumber = (number: string) => this.geocode.parsePhoneNumber(number);
  validatePhoneNumber = (number: string, countryCode: string) =>
    this.geocode.validatePhoneNumber(number, countryCode);
  getFlagUrl = (countryCode: string) => this.geocode.getFlagUrl(countryCode);
  getUserCountry = () => this.geocode.getUserCountry();
  setUserCountry = (country: CountryData) => {
    this.geocode.setUserCountry(country);
    this.currentUserCountry.next(country);
  };
}