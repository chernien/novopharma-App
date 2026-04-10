import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gift',
  standalone: false
})
export class GiftPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return items.filter(item =>
      item.arDesign.trim().toLowerCase().includes(searchText) || // Filtrage par titre
      item.arRef.toLowerCase().includes(searchText) // Filtrage par contenu
    );
  }

}
