import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = localStorage.getItem('loggedIn') === "true";
    if (isLoggedIn) {
      // L'utilisateur est connecté, donc autorisé à accéder à la route
      return true;
    } else {
      // L'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
      this.router.navigateByUrl('/');
      return false;
    }
  }
}
