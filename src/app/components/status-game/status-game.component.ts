import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CardStatusComponent } from './card-elemento/card-status.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/charater.service';
import { NavigationService } from '../../services/navigation.service';
import { Character } from '../../interfaces/character';
import { Elemento } from '../../interfaces/elemento';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';

@Component({
  selector: 'app-status-game',
  templateUrl: './status-game.component.html',
  standalone: true,
  imports: [CommonModule, CardStatusComponent, DragDropModule, TooltipComponent]
})
export class StatusGameComponent implements OnInit {
  private characterService = inject(CharacterService);
  private navigationService = inject(NavigationService);

  // Signals para el estado del juego
  gameElements = signal<Elemento[]>([]);
  isLoading = signal<boolean>(true);
  gameInitialized = signal<boolean>(false);
  
  // Contadores de movimientos
  totalMovements = signal<number>(0);
  correctMovements = signal<number>(0);
  incorrectMovements = signal<number>(0);
  
  // Estado del juego completado
  gameCompleted = signal<boolean>(false);
  
  // Grupos de elementos por estado
  aliveElements = signal<Elemento[]>([]);
  deadElements = signal<Elemento[]>([]);
  unknownElements = signal<Elemento[]>([]);

  // Computed para obtener el título de la página
  pageTitle = this.navigationService.pageTitle;

  // Computed para calcular la precisión
  accuracy = computed(() => {
    const total = this.totalMovements();
    const correct = this.correctMovements();
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  // Computed para verificar si el juego está completo
  isGameComplete = computed(() => {
    const alive = this.aliveElements();
    const dead = this.deadElements();
    const unknown = this.unknownElements();
    const allAliveCorrect = alive.every(elem => elem.grupo === 1);
    const allDeadCorrect = dead.every(elem => elem.grupo === 2);
    const allUnknownCorrect = unknown.every(elem => elem.grupo === 3);

    return alive.length > 0 && dead.length > 0 && unknown.length > 0 &&
           allAliveCorrect && allDeadCorrect && allUnknownCorrect;
  });

  ngOnInit(): void {
    this.initializeGame();
  }

  private async initializeGame(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Cargar personajes del servicio
      this.characterService.init();
      
      // Esperar a que se carguen los personajes
      setTimeout(() => {
        const allCharacters = this.characterService.characters();
        if (allCharacters.length > 0) {
          this.setupGame(allCharacters);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error al inicializar el juego:', error);
      this.isLoading.set(false);
    }
  }

  private setupGame(characters: Character[]): void {
    // Filtrar para obtener exactamente 10 personajes (asegurando variedad de estados)
    const aliveChars = characters.filter(c => c.status === 'Alive').slice(0, 4);
    const deadChars = characters.filter(c => c.status === 'Dead').slice(0, 3);
    const unknownChars = characters.filter(c => c.status === 'unknown').slice(0, 3);
    
    const selectedCharacters = [...aliveChars, ...deadChars, ...unknownChars];
    
    // Convertir personajes a elementos
    const elements = selectedCharacters.map((char, index) => ({
      id: char.id,
      nombre: char.name.split(' ')[0] || char.name,
      apellido: char.name.split(' ').slice(1).join(' ') || char.species,
      amigo: Math.random() > 0.5, // Valor aleatorio para amigo
      fechaFabricacion: char.created,
      avatar: char.image,
      grupo: char.status === 'Alive' ? 1 : char.status === 'Dead' ? 2 : 3 // Grupo correcto basado en estado
    }));
    
    // Mezclar aleatoriamente
    const shuffled = this.shuffleArray([...elements]);
    
    // Distribuir aleatoriamente en las 3 columnas (sin importar su grupo correcto)
    const third = Math.ceil(shuffled.length / 3);
    this.aliveElements.set(shuffled.slice(0, third));
    this.deadElements.set(shuffled.slice(third, third * 2));
    this.unknownElements.set(shuffled.slice(third * 2));
    
    this.gameElements.set(elements);
    this.isLoading.set(false);
    this.gameInitialized.set(true);
    
    // Reset contadores
    this.totalMovements.set(0);
    this.correctMovements.set(0);
    this.incorrectMovements.set(0);
    this.gameCompleted.set(false);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  moverElemento(event: CdkDragDrop<Elemento[]>, targetGroup: number): void {
    const elemento = event.item.data as Elemento;
    const isCorrectPlacement = elemento.grupo === targetGroup;
    
    // Incrementar contadores
    this.totalMovements.update(count => count + 1);
    if (isCorrectPlacement) {
      this.correctMovements.update(count => count + 1);
    } else {
      this.incorrectMovements.update(count => count + 1);
    }

    if (event.previousContainer === event.container) {
      // Mover dentro del mismo contenedor
      const targetArray = this.getArrayByGroup(targetGroup);
      const currentArray = [...targetArray()];
      moveItemInArray(currentArray, event.previousIndex, event.currentIndex);
      targetArray.set(currentArray);
    } else {
      // Mover entre contenedores
      const sourceGroup = this.getGroupFromContainerId(event.previousContainer.id);
      const sourceArray = this.getArrayByGroup(sourceGroup);
      const targetArray = this.getArrayByGroup(targetGroup);
      
      const sourceElements = [...sourceArray()];
      const targetElements = [...targetArray()];
      
      transferArrayItem(sourceElements, targetElements, event.previousIndex, event.currentIndex);
      
      sourceArray.set(sourceElements);
      targetArray.set(targetElements);
    }

    // Verificar si el juego está completo
    setTimeout(() => {
      if (this.isGameComplete() && !this.gameCompleted()) {
        this.gameCompleted.set(true);
      }
    }, 100);
  }

  private getArrayByGroup(group: number) {
    switch (group) {
      case 1: return this.aliveElements; // Vivos
      case 2: return this.deadElements; // Muertos
      case 3: return this.unknownElements; // Desconocidos
      default: return this.aliveElements;
    }
  }

  private getGroupFromContainerId(containerId: string): number {
    if (containerId.includes('Vivos')) return 1;
    if (containerId.includes('Muertos')) return 2;
    if (containerId.includes('Desconocidos')) return 3;
    return 1;
  }

  getElementBorderClass(elemento: Elemento, currentGroup: number): string {
    if (elemento.grupo === currentGroup) {
      return 'border-green-500 border-4'; // Correcto
    } else {
      return 'border-red-500 border-4'; // Incorrecto
    }
  }

  resetGame(): void {
    this.gameInitialized.set(false);
    this.initializeGame();
  }
}
