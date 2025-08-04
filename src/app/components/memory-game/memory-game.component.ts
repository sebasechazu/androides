import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/charater.service';

@Component({
  selector: 'app-memory-game',
  standalone: true,
  templateUrl: './memory-game.component.html',
  imports: [CommonModule]
})
export class MemoryGameComponent {
  cards: { id: number; img: string; key: number; flipped: boolean; matched: boolean }[] = [];
  flippedCards: { id: number; img: string; key: number; flipped: boolean; matched: boolean }[] = [];
  score: number = 0;
  errors: number = 0;
  loading: boolean = true;
  animateScore: boolean = false;
  animateErrors: boolean = false;
  characterService = inject(CharacterService);

  constructor() {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;
    const randomPage = Math.floor(Math.random() * 41) + 1;
    this.characterService.getCharacters(randomPage).subscribe(response => {
      const shuffled = response.results.sort(() => Math.random() - 0.5);
      const characters = shuffled.slice(0, 10);
      this.cards = [...characters, ...characters]
        .map((c, idx) => ({ id: c.id, img: c.image, key: idx, flipped: false, matched: false }))
        .sort(() => Math.random() - 0.5);
      this.loading = false;
    });
  }

  flipCard(card: { id: number; img: string; key: number; flipped: boolean; matched: boolean }): void {
    if (card.flipped || card.matched || this.flippedCards.length === 2 || this.loading) return;
    card.flipped = true;
    this.flippedCards.push(card);
    if (this.flippedCards.length === 2) {
      setTimeout(() => this.checkMatch(), 700);
    }
  }

  checkMatch(): void {
    if (this.flippedCards.length < 2) return;
    const [a, b] = this.flippedCards;
    if (a.id === b.id) {
      a.matched = b.matched = true;
      this.score++;
      this.animateScore = true;
      setTimeout(() => this.animateScore = false, 400);
    } else {
      a.flipped = b.flipped = false;
      this.errors++;
      this.animateErrors = true;
      setTimeout(() => this.animateErrors = false, 400);
    }
    this.flippedCards = [];
  }

  resetGame(): void {
    this.score = 0;
    this.errors = 0;
    this.flippedCards = [];
    this.loadCharacters();
  }
}
