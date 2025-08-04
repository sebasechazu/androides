import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ElementosComponent } from './components/elementos/elementos.component';
import { AboutComponent } from './components/about/about.component';
import { CharactersComponent } from './components/characters/characters.component';
import { MemoryGameComponent } from './components/memory-game/memory-game.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'elementos', component: ElementosComponent },
    { path: 'about', component: AboutComponent },
    { path: 'characters', component: CharactersComponent },
    { path: 'memory-game', component: MemoryGameComponent },
    { path: '**', pathMatch: 'full', redirectTo: 'home' }
];
