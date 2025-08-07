import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Character } from '../../interfaces/character';
import { CharacterService } from '../../services/charater.service';

interface Question {
  id: number;
  character: Character;
  question: string;
  correctAnswer: boolean;
  userAnswer?: boolean;
  answered: boolean;
}

@Component({
  selector: 'app-questions-game',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './questions-game.component.html',
  animations: [
    trigger('slideInFromTop', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    
    trigger('questionTransition', [
      transition(':enter', [
        style({ transform: 'scale(0.8) translateX(50px)', opacity: 0 }),
        animate('500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ transform: 'scale(1) translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ transform: 'scale(0.8) translateX(-50px)', opacity: 0 }))
      ])
    ]),
    
    trigger('buttonAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('400ms 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    
    trigger('feedbackAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.5) rotateX(-90deg)', opacity: 0 }),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'scale(1) rotateX(0deg)', opacity: 1 }))
      ])
    ]),
    
    trigger('progressAnimation', [
      transition(':enter', [
        style({ width: '0%', opacity: 0 }),
        animate('800ms ease-out', style({ width: '*', opacity: 1 }))
      ])
    ]),
    
    trigger('resultsAnimation', [
      transition(':enter', [
        query('*', [
          style({ transform: 'translateY(30px)', opacity: 0 }),
          stagger(100, [
            animate('600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
              style({ transform: 'translateY(0)', opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ]),
    
    trigger('pulseAnimation', [
      state('pulse', style({ transform: 'scale(1)' })),
      transition('* => pulse', [
        animate('1s ease-in-out', style({ transform: 'scale(1.1)' })),
        animate('1s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class QuestionsGameComponent implements OnInit {
  private readonly characterService = inject(CharacterService);

  private readonly _questions = signal<Question[]>([]);
  private readonly _currentQuestionIndex = signal<number>(0);
  private readonly _gameStarted = signal<boolean>(false);
  private readonly _gameFinished = signal<boolean>(false);
  private readonly _isLoading = signal<boolean>(false);
  
  pulseState = 'pulse';

  readonly questions = this._questions.asReadonly();
  readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  readonly gameStarted = this._gameStarted.asReadonly();
  readonly gameFinished = this._gameFinished.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly currentQuestion = computed(() => {
    const questions = this._questions();
    const index = this._currentQuestionIndex();
    return questions[index] || null;
  });

  readonly score = computed(() => {
    return this._questions().filter(q => q.answered && q.userAnswer === q.correctAnswer).length;
  });

  readonly totalQuestions = computed(() => this._questions().length);

  readonly progress = computed(() => {
    const answered = this._questions().filter(q => q.answered).length;
    return Math.round((answered / this.totalQuestions()) * 100);
  });

  ngOnInit() {
    this.characterService.init();
  }

  startGame() {
    this._isLoading.set(true);
    this._gameStarted.set(true);
    this._gameFinished.set(false);
    this._currentQuestionIndex.set(0);
    
    setTimeout(() => {
      this.generateQuestions();
      this._isLoading.set(false);
    }, 1000);
  }

  private generateQuestions() {
    const characters = this.characterService.characters();
    if (characters.length === 0) {
      console.error('No hay personajes disponibles');
      return;
    }

    const selectedCharacters = this.getRandomCharacters(characters, 10);
    const questions: Question[] = [];

    selectedCharacters.forEach((character, index) => {
      const questionType = Math.random();
      let question: string;
      let correctAnswer: boolean;

      if (questionType < 0.2) {
        const isAlive = character.status === 'Alive';
        question = `¿${character.name} está vivo?`;
        correctAnswer = isAlive;
      } else if (questionType < 0.4) {
        const isMale = character.gender === 'Male';
        question = `¿${character.name} es de género masculino?`;
        correctAnswer = isMale;
      } else if (questionType < 0.6) {
        const isHuman = character.species === 'Human';
        question = `¿${character.name} es humano?`;
        correctAnswer = isHuman;
      } else if (questionType < 0.8) {
        const isFromEarth = character.origin.name.toLowerCase().includes('earth');
        question = `¿${character.name} es originario de la Tierra?`;
        correctAnswer = isFromEarth;
      } else {
        const isOnEarth = character.location.name.toLowerCase().includes('earth');
        question = `¿${character.name} se encuentra actualmente en la Tierra?`;
        correctAnswer = isOnEarth;
      }

      questions.push({
        id: index + 1,
        character,
        question,
        correctAnswer,
        answered: false
      });
    });

    this._questions.set(questions);
  }

  private getRandomCharacters(characters: Character[], count: number): Character[] {
    const shuffled = [...characters].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, characters.length));
  }

  answerQuestion(answer: boolean) {
    const questions = this._questions();
    const currentIndex = this._currentQuestionIndex();
    
    if (currentIndex < questions.length) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        userAnswer: answer,
        answered: true
      };
      
      this._questions.set(updatedQuestions);
      
      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          this._currentQuestionIndex.set(currentIndex + 1);
        } else {
          this._gameFinished.set(true);
        }
      }, 1500);
    }
  }

  restartGame() {
    this._gameStarted.set(false);
    this._gameFinished.set(false);
    this._questions.set([]);
    this._currentQuestionIndex.set(0);
  }

  getScoreMessage(): string {
    const score = this.score();
    const total = this.totalQuestions();
    const percentage = (score / total) * 100;

    if (percentage >= 90) return '¡Excelente! Eres un experto en Rick y Morty 🎉';
    if (percentage >= 70) return '¡Muy bien! Conoces bien a los personajes 👏';
    if (percentage >= 50) return 'No está mal, pero puedes mejorar 👍';
    return 'Necesitas ver más Rick y Morty 📺';
  }
}
