import type { CountryData } from "../types/index";


export class GeocodeUtils {
  static cleanPhoneNumber(input: string): string {
    return input.replace(/[^\d]/g, "");
  }

  static isValidIsoCode(code: string): boolean {
    return /^[A-Z]{2}(-[A-Z]{3})?$/.test(code.toUpperCase());
  }

  static normalizeCountryName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  static getCountryEmoji(isoCode: string): string {
    const codePoints = isoCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }

  static compareCountries(
    a: CountryData,
    b: CountryData,
    sortBy: "name" | "code" = "name"
  ): number {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return a.isoCode.localeCompare(b.isoCode);
  }
}