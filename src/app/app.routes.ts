import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ElementosComponent } from './components/elementos/elementos.component';
import { AboutComponent } from './components/about/about.component';
import { ElementoComponent } from './components/elemento/elemento.component';
import { BuscadorComponent } from './components/buscador/buscador.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'elementos', component: ElementosComponent },
    { path: 'about', component: AboutComponent },
    { path: 'buscar/:termino', component: BuscadorComponent },
    { path: '**', pathMatch: 'full', redirectTo: 'home' }
];
