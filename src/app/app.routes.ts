import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ElementosComponent } from './components/elementos/elementos.component';
import { AboutComponent } from './components/about/about.component';
import { BuscadorComponent } from './components/buscador/buscador.component';
import { CharactersComponent } from './components/characters/characters.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'elementos', component: ElementosComponent },
    { path: 'about', component: AboutComponent },
    { path: 'buscar/:termino', component: BuscadorComponent },
    { path: 'characters', component: CharactersComponent },
    { path: '**', pathMatch: 'full', redirectTo: 'home' }
];
