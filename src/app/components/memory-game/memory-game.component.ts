import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/charater.service';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';
import { 
  trigger, 
  style, 
  transition, 
  animate, 
  keyframes,
  query,
  stagger
} from '@angular/animations';

interface GameCard {
  id: number;
  img: string;
  key: number;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memory-game',
  standalone: true,
  templateUrl: './memory-game.component.html',
  imports: [CommonModule, TooltipComponent],
  animations: [
    // Animación para cartas que coinciden
    trigger('matchSuccess', [
      transition(':enter', [
        animate('800ms ease-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.3 }),
          style({ transform: 'scale(0.95)', offset: 0.6 }),
          style({ transform: 'scale(1.05)', offset: 0.8 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),

    // Animación para cartas que no coinciden
    trigger('matchError', [
      transition(':enter', [
        animate('600ms ease-in-out', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-10px)', offset: 0.2 }),
          style({ transform: 'translateX(10px)', offset: 0.4 }),
          style({ transform: 'translateX(-10px)', offset: 0.6 }),
          style({ transform: 'translateX(10px)', offset: 0.8 }),
          style({ transform: 'translateX(0)', offset: 1 })
        ]))
      ])
    ]),

    // Animación para mostrar las cartas inicialmente
    trigger('cardEntrance', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'scale(0.3) rotateY(180deg)' 
        }),
        animate('{{duration}}ms {{delay}}ms ease-out', 
          style({ 
            opacity: 1, 
            transform: 'scale(1) rotateY(0deg)' 
          })
        )
      ])
    ]),

    // Animación para las estadísticas
    trigger('scoreAnimation', [
      transition(':increment', [
        animate('500ms ease-out', keyframes([
          style({ transform: 'scale(1)', color: '*', offset: 0 }),
          style({ transform: 'scale(1.3)', color: '#10b981', offset: 0.3 }),
          style({ transform: 'scale(1.1)', color: '#10b981', offset: 0.7 }),
          style({ transform: 'scale(1)', color: '*', offset: 1 })
        ]))
      ])
    ]),

    trigger('errorAnimation', [
      transition(':increment', [
        animate('500ms ease-out', keyframes([
          style({ transform: 'scale(1)', color: '*', offset: 0 }),
          style({ transform: 'scale(1.3)', color: '#ef4444', offset: 0.3 }),
          style({ transform: 'scale(1.1)', color: '#ef4444', offset: 0.7 }),
          style({ transform: 'scale(1)', color: '*', offset: 1 })
        ]))
      ])
    ]),

    // Animación para la barra de progreso
    trigger('progressBar', [
      transition('* => *', [
        animate('800ms ease-out')
      ])
    ]),

    // Animación para el mensaje de victoria
    trigger('victoryMessage', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'scale(0.5) translateY(-50px)' 
        }),
        animate('600ms 200ms ease-out', 
          style({ 
            opacity: 1, 
            transform: 'scale(1) translateY(0)' 
          })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ 
            opacity: 0, 
            transform: 'scale(0.8) translateY(20px)' 
          })
        )
      ])
    ]),

    // Animación para cuando se cargan las cartas
    trigger('cardsGrid', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.3)' }),
          stagger(50, [
            animate('400ms ease-out', 
              style({ opacity: 1, transform: 'scale(1)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class MemoryGameComponent implements OnInit {
  private characterService = inject(CharacterService);

  // Signals para el estado del juego
  cards = signal<GameCard[]>([]);
  flippedCards = signal<GameCard[]>([]);
  score = signal<number>(0);
  errors = signal<number>(0);
  isLoading = signal<boolean>(true);
  animateScore = signal<boolean>(false);
  animateErrors = signal<boolean>(false);
  
  // Signals para animaciones
  showMatchSuccess = signal<string[]>([]);
  showMatchError = signal<string[]>([]);

  // Computed signals
  totalPairs = computed(() => this.cards().length / 2);
  matchedPairs = computed(() => this.cards().filter(card => card.matched).length / 2);
  isGameComplete = computed(() => this.matchedPairs() === this.totalPairs() && this.totalPairs() > 0);
  canFlipCards = computed(() => this.flippedCards().length < 2 && !this.isLoading());
  
  // Estadísticas del juego
  gameStats = computed(() => ({
    pairs: this.matchedPairs(),
    total: this.totalPairs(),
    accuracy: this.score() + this.errors() > 0 
      ? Math.round((this.score() / (this.score() + this.errors())) * 100) 
      : 0,
    progress: this.totalPairs() > 0 
      ? Math.round((this.matchedPairs() / this.totalPairs()) * 100) 
      : 0
  }));

  ngOnInit(): void {
    this.initializeGame();
  }

  private initializeGame(): void {
    this.characterService.init();
    this.loadCharacters();
  }

  private loadCharacters(): void {
    this.isLoading.set(true);
    
    // Generar página aleatoria y cargar personajes
    const randomPage = Math.floor(Math.random() * 41) + 1;
    this.characterService.setPage(randomPage);
    
    // Esperar un momento para que se carguen los datos
    setTimeout(() => {
      const characters = this.characterService.characters();
      
      if (characters.length > 0) {
        // Seleccionar 10 personajes aleatorios
        const shuffledCharacters = this.shuffleArray([...characters]);
        const selectedCharacters = shuffledCharacters.slice(0, 10);
        
        // Crear cartas duplicadas para el juego de memoria
        const gameCards: GameCard[] = [
          ...selectedCharacters.map((c, idx) => ({
            id: c.id,
            img: c.image,
            key: idx,
            flipped: false,
            matched: false
          })),
          ...selectedCharacters.map((c, idx) => ({
            id: c.id,
            img: c.image,
            key: idx + 10,
            flipped: false,
            matched: false
          }))
        ];
        
        // Mezclar las cartas
        this.cards.set(this.shuffleArray(gameCards));
      } else {
        // Si no hay personajes, crear cartas de ejemplo
        this.createFallbackCards();
      }
      
      this.isLoading.set(false);
    }, 800);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createFallbackCards(): void {
    const fallbackCards: GameCard[] = [];
    for (let i = 1; i <= 8; i++) {
      const card = {
        id: i,
        img: `https://robohash.org/memory${i}.png?size=200x200&set=set1`,
        flipped: false,
        matched: false
      };
      fallbackCards.push(
        { ...card, key: i },
        { ...card, key: i + 8 }
      );
    }
    this.cards.set(this.shuffleArray(fallbackCards));
  }

  flipCard(card: GameCard): void {
    if (card.flipped || card.matched || !this.canFlipCards() || this.isLoading()) return;
    
    // Actualizar el estado de la carta
    this.cards.update(cards => 
      cards.map(c => c.key === card.key ? { ...c, flipped: true } : c)
    );
    
    // Agregar carta a las cartas volteadas
    this.flippedCards.update(flipped => [...flipped, { ...card, flipped: true }]);
    
    // Si hay 2 cartas volteadas, verificar coincidencia después de un delay
    if (this.flippedCards().length === 2) {
      setTimeout(() => this.checkMatch(), 700);
    }
  }

  private checkMatch(): void {
    const flipped = this.flippedCards();
    if (flipped.length < 2) return;
    
    const [cardA, cardB] = flipped;
    
    if (cardA.id === cardB.id) {
      // Coincidencia encontrada - Activar animación de éxito
      this.showMatchSuccess.update(current => [...current, cardA.key.toString(), cardB.key.toString()]);
      
      setTimeout(() => {
        this.cards.update(cards => 
          cards.map(c => 
            (c.key === cardA.key || c.key === cardB.key) 
              ? { ...c, matched: true } 
              : c
          )
        );
        
        this.score.update(s => s + 1);
        this.animateScore.set(true);
        
        // Limpiar animación de éxito
        setTimeout(() => {
          this.showMatchSuccess.update(current => 
            current.filter(key => key !== cardA.key.toString() && key !== cardB.key.toString())
          );
        }, 800);
        
        setTimeout(() => this.animateScore.set(false), 500);
      }, 400);
      
    } else {
      // No hay coincidencia - Activar animación de error
      this.showMatchError.update(current => [...current, cardA.key.toString(), cardB.key.toString()]);
      
      setTimeout(() => {
        this.cards.update(cards => 
          cards.map(c => 
            (c.key === cardA.key || c.key === cardB.key) 
              ? { ...c, flipped: false } 
              : c
          )
        );
        
        this.errors.update(e => e + 1);
        this.animateErrors.set(true);
        
        // Limpiar animación de error
        setTimeout(() => {
          this.showMatchError.update(current => 
            current.filter(key => key !== cardA.key.toString() && key !== cardB.key.toString())
          );
        }, 600);
        
        setTimeout(() => this.animateErrors.set(false), 500);
      }, 400);
    }
    
    this.flippedCards.set([]);
  }

  resetGame(): void {
    this.score.set(0);
    this.errors.set(0);
    this.flippedCards.set([]);
    this.animateScore.set(false);
    this.animateErrors.set(false);
    this.showMatchSuccess.set([]);
    this.showMatchError.set([]);
    this.loadCharacters();
  }

  // Métodos para animaciones
  isCardShowingMatchSuccess(cardKey: number): boolean {
    return this.showMatchSuccess().includes(cardKey.toString());
  }

  isCardShowingMatchError(cardKey: number): boolean {
    return this.showMatchError().includes(cardKey.toString());
  }

  getCardAnimationDelay(index: number): number {
    return index * 100; // 100ms delay entre cada carta
  }
}
