import { Injectable, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private currentRoute = signal('');

  // Computed para obtener el título de la página actual
  pageTitle = computed(() => {
    const route = this.currentRoute();
    switch (route) {
      case '/status-game':
        return 'Juego de Estado';
      case '/characters':
        return 'Personajes';
      case '/about':
        return 'Acerca de';
      case '/memory-game':
        return 'Juego de Memoria';
      case '/questions-game':
        return 'Juego de Preguntas';
      case '/home':
      default:
        return '';
    }
  });

  constructor(private router: Router) {
    // Establecer la ruta inicial
    this.currentRoute.set(this.router.url);
    
    // Escuchar cambios de ruta (esto se mantiene en el servicio, encapsulado)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });
  }

  // Método público para obtener la ruta actual si es necesario
  getCurrentRoute() {
    return this.currentRoute();
  }
}
