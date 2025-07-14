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
    { label: 'Androides', link: '/androides', icon: '🤖' },
    { label: 'About', link: '/about', icon: '👤' }
  ]);
}
