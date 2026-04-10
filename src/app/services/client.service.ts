import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private baseUrl = environment.url; // ✅ prend l’URL de l’environnement

  constructor(private http: HttpClient) { }

  // Définition explicite du type pour LoginRequest
  Login(loginRequest: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/MsAClient/loginComm`, loginRequest);
  }
  
  // client.service.ts
checkIn(request: { username: string; localisationCheckIn: string; dateCheckIn: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}/api/MsAClient/check-in`, request);
}

checkOut(request: { username: string; localisationCheckOut: string; dateCheckOut: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}/api/MsAClient/check-out`, request);
}

  
  GetAuthClients() {
    return this.http.get(`${this.baseUrl}/api/MsAClient/auth
    `)
  }
  GetPharmacie() {
    return this.http.get(`${this.baseUrl}/api/MsAClient
    `)
  }
  GetPharmacieToPromise() {
    return this.http.get(`${this.baseUrl}/api/MsAClient
    `).toPromise()
  }
  GetAuthClient(id: any) {
    return this.http.get(`${this.baseUrl}/auth/${id}
    `)
  }
 AddCommande(commande: any, commercial: any, source: any) {
  return this.http.post(
    `${this.baseUrl}/api/MsAClient/commandeComm?commercial=${commercial}&source=${source}`,
    commande
  );
}


 AddCommandes(commandes: any, commercial: any, source: any) {
  return this.http.post(
    `${this.baseUrl}/api/MsAClient/commandeMultiple?commercial=${commercial}&source=${source}`,
    commandes
  );
}

// client.service.ts
GetDermos(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/api/MsAClient/dermos`);
}



  updateCommandeQte(id: any, qte: any, prix: any, client: any) {
    return this.http.put(`${this.baseUrl}/api/MsAClient/${id}/update-quantity?newQuantityVendue=${qte}&prixVente=${prix}`, client)
  }
  updateCommandeWithImage(id: any, client: any) {
    return this.http.put(`${this.baseUrl}/api/MsAClient/${id}/update-quantity-image`, client)
  }
  UpdateEnabledAuthClient(id: any, client: any) {
    return this.http.put(`${this.baseUrl}/auth/update/${id}
    `, client)
  }

  uploadCommandImage(commandId: any, file: File, commercial: any) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/api/MsAClient/commandeComm/upload-image?commandId=${commandId}&commercial=${commercial}`, formData);
  }

  getCommandImage(commandId: any) {
    return this.http.get(`${this.baseUrl}/api/MsAClient/commandeComm/${commandId}/image`);
  }
  getCommandeAll(date: string, dermo: string, pharmacyName: string) {
  const params = new URLSearchParams({
    date,
    dermo,
    pharmacyName
  });

  return this.http.get(`${this.baseUrl}/api/MsAClient/commande?${params.toString()}`);
}

  getCommandeFiltree(pharmacyId: string, username: string, date: string): Observable<any[]> {
    const params = new HttpParams()
      .set('pharmacieId', pharmacyId)
      .set('createdBy', username)
      .set('date', date); // Format : yyyy-MM-dd

    return this.http.get<any[]>(`${this.baseUrl}/api/MsAClient/commande/filtre`, { params });
  }
  getCommandPharm(pharmacieId: any) {
    return this.http.get(`${this.baseUrl}/api/MsAClient/commandeP/${pharmacieId}`);
  }
  getCommandArticle(articleId: any) {
    return this.http.get(`${this.baseUrl}/api/MsAClient/commandeP/${articleId}`);
  }
  getCommandPharmArt(pharmacieId: any, articleId: any) {
    return this.http.get(`${this.baseUrl}/api/MsAClient/commandeP/${pharmacieId}/${articleId}`);
  }
}
