import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SensorData {
  sensor: string;
  state: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private apiUrl = 'http://localhost:3000/data';

  constructor(private http: HttpClient) {}

  getData(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(this.apiUrl);
  }
}
