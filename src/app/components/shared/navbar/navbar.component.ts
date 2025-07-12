import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink],
})
export class NavbarComponent {

  // Usamos signals modernos en vez de OnInit
  items = signal([
    { label: 'Home', link: '/home', icon: '🏠' },
    { label: 'Androides', link: '/androides', icon: '🤖' },
    { label: 'About', link: '/about', icon: '👤' }
  ]);

  constructor(private router: Router) { }

  buscarAndroides(textoBusqueda: string) {
    this.router.navigate(['/buscar', textoBusqueda]);
  }
}
