import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'recommande',
  standalone: false
})
export class RecommandePipe implements PipeTransform {

  
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }

    const searchTerms = searchText.toLowerCase().split(' ');

    return items.filter((item: any) => {
      let relevanceScore = 0;

      // Vérifiez chaque propriété de l'article et de la pharmacie pour correspondance avec les mots-clés
      for (const key in item) {
        if (item.hasOwnProperty(key) && typeof item[key] === 'object') {
          const values = Object.values(item[key]);
          values.forEach((value: any) => {
            if (typeof value === 'string') {
              const lowercaseValue = value.toLowerCase();

              // Vérifiez chaque mot-clé
              searchTerms.forEach(term => {
                if (lowercaseValue.includes(term)) {
                  // Augmentez le score de pertinence pour chaque correspondance
                  relevanceScore++;
                }
              });
            }
          });
        }
      }

      // Gardez les articles ayant un score de pertinence supérieur à 0
      return relevanceScore > 0;
    })
      // Triez les articles en fonction de leur score de pertinence (optionnel)
      .sort((a: any, b: any) => {
        // Trier par ordre décroissant de score de pertinence
        return this.getRelevanceScore(b, searchTerms) - this.getRelevanceScore(a, searchTerms);
      });
  }

  // Fonction pour calculer le score de pertinence (à ajouter)
  getRelevanceScore(item: any, searchTerms: string[]): number {
    let relevanceScore = 0;

    for (const key in item) {
      if (item.hasOwnProperty(key) && typeof item[key] === 'object') {
        const values = Object.values(item[key]);
        values.forEach((value: any) => {
          if (typeof value === 'string') {
            const lowercaseValue = value.toLowerCase();

            // Vérifiez chaque mot-clé
            searchTerms.forEach(term => {
              if (lowercaseValue.includes(term)) {
                // Augmentez le score de pertinence pour chaque correspondance
                relevanceScore++;
              }
            });
          }
        });
      }
    }

    return relevanceScore;
  }

}
