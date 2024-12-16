import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountriesNowService {
  private countriesUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private http: HttpClient) { }

  getCountries() {
    return this.http.get(`${this.countriesUrl}`);
  }

  getStates(country: string) {
    return this.http.post(`${this.countriesUrl}/states`, { country });
  }

  getCities(country: string, state: string) {
    console.log(country, state)
    return this.http.post(`${this.countriesUrl}/state/cities`, { country, state });
  }

  getCurrency(country: string) {
    return this.http.post(`${this.countriesUrl}/currency`, { country });
  }

  getCountryByPosition(): Observable<any> {
    return this.http.get(`${this.countriesUrl}/positions`);
  }

}
