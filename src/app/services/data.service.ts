import { Injectable } from '@angular/core';


export interface IProduct {
  id: number,
  name: string,
  price: number,
  image: string,
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private storage: Storage) { }

  // Example of storing data
  async saveData(key: string, value: any) {
    await this.storage['set'](key, value);
  }

  // Example of retrieving data
  async getData(key: string) {
    return await this.storage['get'](key);
  }

  // Example of removing data
  async removeData(key: string) {
    await this.storage['remove'](key);
  }

}
