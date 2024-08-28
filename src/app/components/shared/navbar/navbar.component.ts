import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: true,
    imports: [MenubarModule]
})
export class NavbarComponent {

  items: MenuItem[] | undefined;

  home: MenuItem | undefined;

  constructor(private router: Router) { }

  ngOnInit() {

    this.items = [
      { label: 'home', routerLink: '/', icon: 'pi pi-home' },
      { label: 'androides', routerLink: '/androides', icon: 'pi pi-list'   },
      { label: 'About'  , routerLink: '/about' , icon: 'pi pi-user'}
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };

  }

  buscarAndroides(textoBusqueda: string) {
    this.router.navigate(['/buscar', textoBusqueda]);
  }

}
