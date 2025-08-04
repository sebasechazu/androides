import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../../service/charater.service';
import { Character } from '../../interface/character';

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character.component.html'
})
export class CharacterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private characterService = inject(CharacterService);

  character = signal<Character | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!isNaN(id)) {
        this.loadCharacter(id);
      } else {
        this.router.navigate(['/characters']);
      }
    });
  }

  loadCharacter(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.characterService.getCharacter(id).subscribe({
      next: (character) => {
        this.character.set(character);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el personaje. Intenta de nuevo más tarde.');
        this.isLoading.set(false);
        console.error('Error cargando el personaje:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/characters']);
  }
}
