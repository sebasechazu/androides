import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CardStatusComponent } from './card-elemento/card-status.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/charater.service';
import { NavigationService } from '../../services/navigation.service';
import { Character } from '../../interfaces/character';
import { Elemento } from '../../interfaces/elemento';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';
import { ModalGameComponent } from '../shared/modal-game/modal-game.component';

@Component({
  selector: 'app-status-game',
  templateUrl: './status-game.component.html',
  standalone: true,
  imports: [CommonModule, CardStatusComponent, DragDropModule, TooltipComponent, ModalGameComponent]
})
export class StatusGameComponent implements OnInit {
  private characterService = inject(CharacterService);
  private navigationService = inject(NavigationService);
  private elementRef = inject(ElementRef);

  gameElements = signal<Elemento[]>([]);
  isLoading = signal<boolean>(true);
  gameInitialized = signal<boolean>(false);
  
  private isDragging = false;
  private scrollContainer: HTMLElement | null = null;
  private isScrolling = false;
  private scrollTimeout: any;
  private lastTouchY = 0;
  
  totalMovements = signal<number>(0);
  correctMovements = signal<number>(0);
  incorrectMovements = signal<number>(0);
  
  gameCompleted = signal<boolean>(false);
  showVictoryModal = signal<boolean>(false);
  
  aliveElements = signal<Elemento[]>([]);
  deadElements = signal<Elemento[]>([]);
  unknownElements = signal<Elemento[]>([]);

  // Computed para obtener el título de la página
  pageTitle = this.navigationService.pageTitle;

  accuracy = computed(() => {
    const total = this.totalMovements();
    const correct = this.correctMovements();
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  isGameComplete = computed(() => {
    const alive = this.aliveElements();
    const dead = this.deadElements();
    const unknown = this.unknownElements();
    
    const allAliveCorrect = alive.length === 0 || alive.every(elem => elem.grupo === 1);
    const allDeadCorrect = dead.length === 0 || dead.every(elem => elem.grupo === 2);
    const allUnknownCorrect = unknown.length === 0 || unknown.every(elem => elem.grupo === 3);
    
    const totalElements = alive.length + dead.length + unknown.length;
    const gameHasElements = totalElements > 0;
    
    return gameHasElements && allAliveCorrect && allDeadCorrect && allUnknownCorrect;
  });

  ngOnInit(): void {
    this.initializeGame();
    this.setupMobileScrollOptimization();
  }

  /**
   * Configura optimizaciones para el desplazamiento en dispositivos móviles
   * mejorando la experiencia de arrastrar y soltar en pantallas táctiles
   */
  private setupMobileScrollOptimization(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
    if (!isMobile) return;
    this.scrollContainer = this.elementRef.nativeElement;
    if (this.scrollContainer) {
      this.scrollContainer.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
      this.scrollContainer.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
      this.scrollContainer.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
      this.scrollContainer.style.overflowY = 'auto';
      (this.scrollContainer.style as any).webkitOverflowScrolling = 'touch';
      this.scrollContainer.style.scrollBehavior = 'auto';
      document.body.style.overscrollBehavior = 'auto';
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      document.body.style.touchAction = 'manipulation';
    }
  }

  /**
   * Maneja el evento de inicio de toque en dispositivos móviles
   * @param event Evento de toque
   */
  private onTouchStart(event: TouchEvent): void {
    const target = event.target as Element;
    const isDragElement = target.closest('[cdkDrag]');
    
    if (isDragElement) {
      this.isDragging = false;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  /**
   * Maneja el movimiento del toque para diferenciar entre desplazamiento y arrastre
   * @param event Evento de movimiento de toque
   */
  private onTouchMove(event: TouchEvent): void {
    const currentY = event.touches[0].clientY;
    const deltaY = Math.abs(currentY - this.lastTouchY);
    
    if (deltaY > 5) {
      this.isScrolling = true;
      this.disableDragTemporarily();
      
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.enableDrag();
      }, 150);
    }
    
    this.lastTouchY = currentY;
  }

  /**
   * Maneja el fin del evento de toque
   * @param event Evento de fin de toque
   */
  private onTouchEnd(event: TouchEvent): void {
    this.isDragging = false;
    
    setTimeout(() => {
      if (!this.isScrolling) {
        this.enableDrag();
      }
    }, 100);
  }

  /**
   * Desactiva temporalmente la funcionalidad de arrastre para permitir el desplazamiento
   */
  private disableDragTemporarily(): void {
    const dragElements = document.querySelectorAll('[cdkDrag]');
    dragElements.forEach(element => {
      (element as HTMLElement).style.pointerEvents = 'none';
      element.setAttribute('data-drag-disabled', 'true');
    });
  }

  /**
   * Habilita la funcionalidad de arrastre que se desactivó temporalmente
   */
  private enableDrag(): void {
    const dragElements = document.querySelectorAll('[cdkDrag]');
    dragElements.forEach(element => {
      (element as HTMLElement).style.pointerEvents = '';
      element.removeAttribute('data-drag-disabled');
    });
  }

  /**
   * Inicializa el juego cargando personajes desde la API y configurando el estado inicial
   */
  private async initializeGame(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      const randomPage = Math.floor(Math.random() * 41) + 1;
      this.characterService.setPage(randomPage);
      
      setTimeout(() => {
        const allCharacters = this.characterService.characters();
        
        if (allCharacters.length >= 8) {
          this.setupGame(allCharacters);
        } else {

          this.characterService.setPage(1);
          
          setTimeout(() => {
            const fallbackCharacters = this.characterService.characters();           
            if (fallbackCharacters.length > 0) {
              this.setupGame(fallbackCharacters);
            } else {
              this.isLoading.set(false);
            }
          }, 1000);
        }
      }, 1200);
      
    } catch (error) {
      this.isLoading.set(false);
    }
  }

  /**
   * Configura el juego utilizando los personajes cargados, distribuyéndolos en las columnas
   * @param characters Lista de personajes para usar en el juego
   */
  private setupGame(characters: Character[]): void {
    if (characters.length === 0) {
      this.isLoading.set(false);
      return;
    }
    
    const shuffledCharacters = this.shuffleArray([...characters]);
    
    const aliveChars = shuffledCharacters.filter(c => c.status === 'Alive');
    const deadChars = shuffledCharacters.filter(c => c.status === 'Dead');
    const unknownChars = shuffledCharacters.filter(c => c.status === 'unknown');
    
    let selectedCharacters: Character[] = [];
    
    const totalAvailable = characters.length;
    const targetTotal = Math.min(10, totalAvailable);
    
    if (aliveChars.length >= 2 && deadChars.length >= 2 && unknownChars.length >= 2) {
      const aliveCount = Math.min(4, aliveChars.length);
      const deadCount = Math.min(3, deadChars.length);
      const unknownCount = Math.min(3, unknownChars.length);
      
      selectedCharacters.push(...aliveChars.slice(0, aliveCount));
      selectedCharacters.push(...deadChars.slice(0, deadCount));
      selectedCharacters.push(...unknownChars.slice(0, unknownCount));
      
      if (selectedCharacters.length < targetTotal) {
        const remaining = shuffledCharacters.filter(
          char => !selectedCharacters.some(selected => selected.id === char.id)
        );
        selectedCharacters.push(...remaining.slice(0, targetTotal - selectedCharacters.length));
      }
    } else {
      selectedCharacters = shuffledCharacters.slice(0, targetTotal);
    }
    
    const elements = selectedCharacters.map((char, index) => ({
      id: char.id,
      nombre: char.name.split(' ')[0] || char.name,
      apellido: char.name.split(' ').slice(1).join(' ') || char.species,
      amigo: Math.random() > 0.5,
      fechaFabricacion: char.created,
      avatar: char.image,
      grupo: char.status === 'Alive' ? 1 : char.status === 'Dead' ? 2 : 3
    }));
    
    const shuffled = this.shuffleArray([...elements]);
    
    const aliveEls = shuffled.filter(el => el.grupo === 1);
    const deadEls = shuffled.filter(el => el.grupo === 2);
    const unknownEls = shuffled.filter(el => el.grupo === 3);
    
    const aliveColumn: Elemento[] = [];
    const deadColumn: Elemento[] = [];
    const unknownColumn: Elemento[] = [];
    
    const distributeIncorrectly = (elements: Elemento[], correctGroup: number) => {
      if (elements.length === 0) return;
      
      const availableColumns: string[] = [];
      if (correctGroup !== 1) availableColumns.push('alive');
      if (correctGroup !== 2) availableColumns.push('dead');
      if (correctGroup !== 3) availableColumns.push('unknown');
      
      elements.forEach((el, index) => {
        const targetColumn = availableColumns[index % availableColumns.length];
        if (targetColumn === 'alive') aliveColumn.push(el);
        else if (targetColumn === 'dead') deadColumn.push(el);
        else if (targetColumn === 'unknown') unknownColumn.push(el);
      });
    };
    
    distributeIncorrectly(aliveEls, 1);
    distributeIncorrectly(deadEls, 2);
    distributeIncorrectly(unknownEls, 3);
    
    this.aliveElements.set(this.shuffleArray(aliveColumn));
    this.deadElements.set(this.shuffleArray(deadColumn));
    this.unknownElements.set(this.shuffleArray(unknownColumn));
    
    this.gameElements.set(elements);
    this.isLoading.set(false);
    this.gameInitialized.set(true);
    
    this.totalMovements.set(0);
    this.correctMovements.set(0);
    this.incorrectMovements.set(0);
    this.gameCompleted.set(false);
    this.showVictoryModal.set(false);
  }

  /**
   * Mezcla aleatoriamente los elementos de un array
   * @param array El array a mezclar
   * @returns Un nuevo array con los elementos mezclados
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Maneja el evento de arrastrar y soltar un elemento entre contenedores
   * @param event Evento de arrastrar y soltar
   * @param targetGroup Grupo de destino al que se mueve el elemento
   */
  moverElemento(event: CdkDragDrop<Elemento[]>, targetGroup: number): void {
    const elemento = event.item.data as Elemento;
    const isCorrectPlacement = elemento.grupo === targetGroup;
    
    this.totalMovements.update(count => count + 1);
    if (isCorrectPlacement) {
      this.correctMovements.update(count => count + 1);
    } else {
      this.incorrectMovements.update(count => count + 1);
    }

    if (event.previousContainer === event.container) {
      const targetArray = this.getArrayByGroup(targetGroup);
      const currentArray = [...targetArray()];
      moveItemInArray(currentArray, event.previousIndex, event.currentIndex);
      targetArray.set(currentArray);
    } else {
      const sourceGroup = this.getGroupFromContainerId(event.previousContainer.id);
      const sourceArray = this.getArrayByGroup(sourceGroup);
      const targetArray = this.getArrayByGroup(targetGroup);
      
      const sourceElements = [...sourceArray()];
      const targetElements = [...targetArray()];
      
      transferArrayItem(sourceElements, targetElements, event.previousIndex, event.currentIndex);
      
      sourceArray.set(sourceElements);
      targetArray.set(targetElements);
    }

    setTimeout(() => {
      if (this.isGameComplete() && !this.gameCompleted()) {
        this.gameCompleted.set(true);
        this.showVictoryModal.set(true);
      }
    }, 100);
  }

  /**
   * Maneja el evento cuando un elemento arrastrable entra en una zona de soltar
   * @param event Evento de entrada a la zona
   */
  onDragEntered(event: any): void {
    const dropListElement = event.container.element.nativeElement;
    dropListElement.classList.add('drop-zone-hover');
  }

  /**
   * Maneja el evento cuando un elemento arrastrable sale de una zona de soltar
   * @param event Evento de salida de la zona
   */
  onDragExited(event: any): void {
    const dropListElement = event.container.element.nativeElement;
    dropListElement.classList.remove('drop-zone-hover');
  }

  /**
   * Maneja el inicio del arrastre de un elemento
   * @param event Evento de inicio de arrastre
   */
  onDragStarted(event: any): void {
    this.isDragging = true;
    this.isScrolling = false;
    
    if (this.scrollContainer) {
      this.scrollContainer.style.overflowY = 'scroll';
      (this.scrollContainer.style as any).webkitOverflowScrolling = 'touch';
      this.scrollContainer.style.scrollBehavior = 'auto';
      
      document.body.style.overscrollBehavior = 'auto';
      document.documentElement.style.overscrollBehavior = 'auto';
      
      document.body.style.transform = 'translateZ(0)';
      document.body.style.willChange = 'scroll-position';
      
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    }
    
    const dragElement = event.source.element.nativeElement;
    if (dragElement) {
      dragElement.style.willChange = 'transform';
      dragElement.style.transform = 'translateZ(0)';
    }
  }

  /**
   * Maneja el fin del arrastre de un elemento
   * @param event Evento de fin de arrastre
   */
  onDragEnded(event: any): void {
    this.isDragging = false;
    
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.style.scrollBehavior = 'smooth';
      }
      
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.transform = '';
      document.body.style.willChange = '';
      (document.body.style as any).webkitOverflowScrolling = '';
      
      this.enableDrag();
      
    }, 150);
  }

  /**
   * Obtiene el array de elementos correspondiente a un grupo específico
   * @param group Identificador del grupo (1: vivos, 2: muertos, 3: desconocidos)
   * @returns Signal con el array de elementos del grupo
   */
  private getArrayByGroup(group: number) {
    switch (group) {
      case 1: return this.aliveElements;
      case 2: return this.deadElements;
      case 3: return this.unknownElements;
      default: return this.aliveElements;
    }
  }

  /**
   * Obtiene el identificador de grupo a partir del ID del contenedor
   * @param containerId ID del contenedor
   * @returns Número del grupo correspondiente
   */
  private getGroupFromContainerId(containerId: string): number {
    if (containerId.includes('Vivos')) return 1;
    if (containerId.includes('Muertos')) return 2;
    if (containerId.includes('Desconocidos')) return 3;
    return 1;
  }

  /**
   * Determina la clase CSS para el borde de un elemento según su posición actual
   * @param elemento Elemento a evaluar
   * @param currentGroup Grupo en el que se encuentra actualmente
   * @returns Clase CSS para aplicar al borde
   */
  getElementBorderClass(elemento: Elemento, currentGroup: number): string {
    const baseClasses = 'rounded-xl overflow-hidden w-full h-full';
    
    if (elemento.grupo === currentGroup) {
      return `${baseClasses} border-green-500 border-4`;
    } else {
      return `${baseClasses} border-red-500 border-4`;
    }
  }

  /**
   * Reinicia el juego, cargando nuevos personajes y restableciendo contadores
   */
  resetGame(): void {
    this.gameInitialized.set(false);
    this.showVictoryModal.set(false);
    this.initializeGame();
  }

  /**
   * Cierra el modal de victoria sin reiniciar el juego
   */
  closeVictoryModal(): void {
    this.showVictoryModal.set(false);
  }


}
