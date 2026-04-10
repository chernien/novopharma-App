import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // ✅ import environnement

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  private baseUrl = environment.url; // ✅ prend l’URL de l’environnement


  constructor(private http: HttpClient) { }


  getArticles() {
    return this.http.get(`${this.baseUrl}/api/MbArticle`)
  }
  getAllArticles() {
    return this.http.get(`${this.baseUrl}/api/MbArticle/all-articles`)
  }

 getArticleByBarcode(barcode: string): Promise<any> {
  return this.http
    .get(`${this.baseUrl}/api/MbArticle/article-by-barcode/${barcode}`)
    .toPromise();
}


  getMarque() {
    return this.http.get(`${this.baseUrl}/api/MBAArticle/all-marques`)
  }
  getGiftsByDermo(dermoId: number): Promise<any[]> {
    return this.http.get<any>(`${this.baseUrl}/api/gift/gifts-by-dermo/${dermoId}`).toPromise();
  }
  orderGift(requestData: any): Promise<any> {
  // Convertir la date en ISO si nécessaire
  if (requestData.dateCommande instanceof Date) {
    requestData.dateCommande = requestData.dateCommande.toISOString();
  }
  return this.http.post(`${this.baseUrl}/api/gift/order-gift`, requestData).toPromise();
}

  orderGiftMed(requestData: any): Promise<any> {
// Convertir la date en ISO si nécessaire
  if (requestData.dateCommande instanceof Date) {
    requestData.dateCommande = requestData.dateCommande.toISOString();
  }
  return this.http.post(`${this.baseUrl}/api/gift/order-gift`, requestData).toPromise();

}

  getArticlesToPromise() {
    return this.http.get(`${this.baseUrl}/api/MbArticle`).toPromise()
  }
  getAllArticlesToPromise() {
    return this.http.get(`${this.baseUrl}/api/MbArticle/all-articles`).toPromise();
  }
  getArticlesGift() {
    return this.http.get(`${this.baseUrl}/api/MbArticle/gift`)
  }
  getArticlesToPromiseGift() {
    return this.http.get(`${this.baseUrl}/api/MbArticle/gift`).toPromise()
  }
  getArticlesRec() {
    return this.http.get(`${this.baseUrl}/api/MbArticle/recommande`)
  }
  
  getArticleById(ref: any) {
    return this.http.get(`${this.baseUrl}/api/MbArticle/${ref}`)
  }
  getFamilleArticle(ref: any) {
    return this.http.get(`${this.baseUrl}/api/MbArticle/famille/${ref}`)
  }
  saveDetailsArticle(detail: any, ref: any) {
    return this.http.post(`${this.baseUrl}/api/MbArticle/detail/${ref}`, detail)
  }
  updateDetailsArticle(detail: any, arRef: any) {
    return this.http.put(`${this.baseUrl}/api/MbArticle/detail/${arRef}`, detail)
  }
  getEntetesFactures(code_client: string) {
    return this.http.get(`${this.baseUrl}/api/MsAEntt/facture?code_client=${code_client}`)
  }
  getLigneByDop(dop: any) {
    return this.http.get(`${this.baseUrl}/api/MsAEntt/ligne/${dop}`)
  }
  getEntetesCommandes(code_client: string) {
    return this.http.get(`${this.baseUrl}/api/MsAEntt/commande?code_client=${code_client}`)
  }
  getEntetesCommandesMois(code_client: string) {
    return this.http.get(`${this.baseUrl}/api/MsAEntt/commande/mois?code_client=${code_client}`)
  }
  getEntetesCommandesTrimestre(code_client: string) {
    return this.http.get(`${this.baseUrl}/api/MsAEntt/commande/trimestre?code_client=${code_client}`)
  }
  getLignes() {
    return this.http.get(`${this.baseUrl}/api/Ligne`)
  }
  getEntete(id: number) {
    return this.http.get(`${this.baseUrl}/api/Ent/${id}`)
  }
  getLigne(id: number) {
    return this.http.get(`${this.baseUrl}/api/Ligne/${id}`)
  }
  getClients() {
    return this.http.get(`${this.baseUrl}/api/MsAClient`)
  }
  getClient(id: number) {
    return this.http.get(`${this.baseUrl}/api/Client/${id}`)
  }
}
