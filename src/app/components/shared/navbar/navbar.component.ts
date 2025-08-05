import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink],
  animations: [
    trigger('slideDown', [
      state('closed', style({
        height: '0px',
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('open', style({
        height: '*',
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('closed => open', [
        animate('300ms ease-out')
      ]),
      transition('open => closed', [
        animate('200ms ease-in')
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class NavbarComponent {
  isOpen = signal(false);

  items = signal([
    { label: 'Elementos', link: '/elementos' },
    { label: 'Personajes', link: '/characters' },
    { label: 'Juego', link: '/memory-game' },
    { label: 'About', link: '/about' },
  ]);

  constructor(private navigationService: NavigationService) {}

  // Getter para acceder al título desde el servicio
  get pageTitle() {
    return this.navigationService.pageTitle();
  }
}
