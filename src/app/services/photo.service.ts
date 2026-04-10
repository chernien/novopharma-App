import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  baseUrl = "https://novopharma.tn"

  constructor(private http: HttpClient) { }

  Facture(facture: any) {
    return this.http.post(`${this.baseUrl}/api/Facture
    `, facture)
  }
}
