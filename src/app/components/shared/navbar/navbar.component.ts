import { Component, signal, HostListener } from '@angular/core';
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
  gamesOpen = signal(false);
  profileOpen = signal(false);

  items = signal([

    {
      label: 'Juegos',
      link: '#',
      hasSubmenu: true,
      submenu: [
        { label: 'Juego de Estado', link: '/status-game' },
        { label: 'Juego de Memoria', link: '/memory-game' }
      ]
    },
    {
      label: 'Perfil',
      link: '#',
      hasSubmenu: true,
      submenu: [
        { label: 'Personajes', link: '/characters' },
        { label: 'Acerca de', link: '/about' }
      ]
    },
  ]);

  constructor(private navigationService: NavigationService) { }

  // Getter para acceder al título desde el servicio
  get pageTitle() {
    return this.navigationService.pageTitle();
  }

  toggleGamesMenu() {
    this.gamesOpen.set(!this.gamesOpen());
    // Cerrar otros menús desplegables
    if (this.gamesOpen()) {
      this.profileOpen.set(false);
    }
  }

  toggleProfileMenu() {
    this.profileOpen.set(!this.profileOpen());
    // Cerrar otros menús desplegables
    if (this.profileOpen()) {
      this.gamesOpen.set(false);
    }
  }

  closeAllMenus() {
    this.isOpen.set(false);
    this.gamesOpen.set(false);
    this.profileOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.gamesOpen.set(false);
      this.profileOpen.set(false);
    }
  }
}
