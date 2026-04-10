import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'client'
  , standalone: false
})
export class ClientPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return items.filter(item =>
      item.ctIntitule.trim().toLowerCase().includes(searchText));
  }
}
