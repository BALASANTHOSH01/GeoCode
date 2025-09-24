# @balasanthosh01/geolookup

Universal geocoding library for JavaScript/TypeScript with country data, phone formatting, and flag utilities.

[![npm version](https://img.shields.io/npm/v/@balasanthosh01/geolookup.svg)](https://www.npmjs.com/package/@balasanthosh01/geolookup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- Get country data by **ISO code**
- Get **all countries** with details
- Search countries by **name or partial name**
- Get countries by **phone code**
- Phone number **formatting and validation**
- Country **flag utilities** (with URLs or inline SVG)
- Detect user country and set defaults
- Works with **React, Vue, Angular**, and plain JS/TS

---

## Installation

```bash
npm install @balasanthosh01/geolookup
```

or using Yarn:

```bash
yarn add @balasanthosh01/geolookup
```

---

## Core Methods

```ts
import { geolookup } from '@balasanthosh01/geolookup';

// Search countries by name or ISO code
geolookup.searchCountries("India");

// Get country by ISO code
geolookup.getCountryByIsoCode("IN");

// Parse and validate phone number
geolookup.parsePhoneNumber("+911234567890");

// Get country with flag SVG
await geolookup.getCountryWithFlag("IN");

// Detect user's country via IP
await geolookup.detectUserCountry();

// Get user's selected country
geolookup.getUserCountry();

// Set user's country manually
geolookup.setUserCountry({ isoCode: "US", name: "United States", phoneCode: "+1", flag: "us.svg" });
```

---

## Usage Examples

### 1️⃣ React

```tsx
import React, { useEffect, useState } from 'react';
import { geolookup } from '@balasanthosh01/geolookup';

const App = () => {
  const [countries, setCountries] = useState([]);
  const [countryFlag, setCountryFlag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const result = geolookup.searchCountries("India");
      setCountries(result);

      const country = await geolookup.getCountryWithFlag("IN");
      setCountryFlag(country?.flagUrl || '');
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Countries</h1>
      <pre>{JSON.stringify(countries, null, 2)}</pre>
      {countryFlag && <img src={countryFlag} alt="India Flag" width="50" />}
    </div>
  );
};

export default App;
```

---

### 2️⃣ Angular

```ts
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { geolookup } from '@balasanthosh01/geolookup';

@Component({
  selector: 'app-root',
  template: `
    <h1>Countries</h1>
    <pre>{{ countries | json }}</pre>
    <img *ngIf="flagUrl" [src]="flagUrl" alt="Flag" width="50">
  `
})
export class AppComponent implements OnInit {
  countries = [];
  flagUrl = '';

  async ngOnInit() {
    this.countries = geolookup.searchCountries("India");
    const country = await geolookup.getCountryWithFlag("IN");
    this.flagUrl = country?.flagUrl || '';
  }
}
```

---

### 3️⃣ Vue 3

```vue
<template>
  <div>
    <h1>Countries</h1>
    <pre>{{ countries }}</pre>
    <img v-if="flagUrl" :src="flagUrl" alt="Flag" width="50">
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { geolookup } from '@balasanthosh01/geolookup';

const countries = ref([]);
const flagUrl = ref('');

onMounted(async () => {
  countries.value = geolookup.searchCountries("India");
  const country = await geolookup.getCountryWithFlag("IN");
  flagUrl.value = country?.flagUrl || '';
});
</script>
```

---

### 4️⃣ Plain HTML (Browser)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Geolookup Demo</title>
</head>
<body>
<h1>Geolookup Demo</h1>
<pre id="output"></pre>
<img id="flag" width="50" />

<script type="module">
  import { geolookup } from 'https://unpkg.com/@balasanthosh01/geolookup?module';

  async function runDemo() {
    const countries = geolookup.searchCountries("India");
    document.getElementById('output').textContent = JSON.stringify(countries, null, 2);

    const country = await geolookup.getCountryWithFlag("IN");
    document.getElementById('flag').src = country.flagUrl;
  }

  runDemo();
</script>
</body>
</html>
```

---

## Available Fields

* `COUNTRY_DATA` – All countries data.
* `PHONE_FORMATS` – Phone number formatting per country.
* `ALTERNATIVE_NAMES` – Alternative country names for search.

---

## Notes

* All methods are **async-safe**, use `await` for methods returning promises (`getCountryWithFlag`, `detectUserCountry`).
* Works in **modern browsers** using ES modules.
* Supports **phone parsing, validation, and formatting**.

---

## License

MIT

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.