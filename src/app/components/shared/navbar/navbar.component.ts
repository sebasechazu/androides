import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink],
})
export class NavbarComponent {
  isOpen = signal(false);

  items = signal([
    { label: 'Elementos', link: '/elementos', icon: '🤖' },
    { label: 'Personajes', link: '/characters', icon: '👽' },
    { label: 'About', link: '/about', icon: '👤' }
  ]);
}
