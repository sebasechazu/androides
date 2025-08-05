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

  // Signals para el estado del juego
  gameElements = signal<Elemento[]>([]);
  isLoading = signal<boolean>(true);
  gameInitialized = signal<boolean>(false);
  showInitialAnimations = signal<boolean>(false);
  
  // Variables para mejorar scroll en móviles
  private isDragging = false;
  private scrollContainer: HTMLElement | null = null;
  private isScrolling = false;
  private scrollTimeout: any;
  private lastTouchY = 0;
  
  // Contadores de movimientos
  totalMovements = signal<number>(0);
  correctMovements = signal<number>(0);
  incorrectMovements = signal<number>(0);
  
  // Estado del juego completado
  gameCompleted = signal<boolean>(false);
  showVictoryModal = signal<boolean>(false);
  
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
    
    // Verificar que todos los elementos en cada columna estén en el lugar correcto
    const allAliveCorrect = alive.length === 0 || alive.every(elem => elem.grupo === 1);
    const allDeadCorrect = dead.length === 0 || dead.every(elem => elem.grupo === 2);
    const allUnknownCorrect = unknown.length === 0 || unknown.every(elem => elem.grupo === 3);
    
    // El juego está completo si:
    // 1. Hay al menos un elemento total en el juego
    // 2. Todos los elementos están en sus lugares correctos
    const totalElements = alive.length + dead.length + unknown.length;
    const gameHasElements = totalElements > 0;
    
    return gameHasElements && allAliveCorrect && allDeadCorrect && allUnknownCorrect;
  });

  ngOnInit(): void {
    this.initializeGame();
    this.setupMobileScrollOptimization();
  }

  private setupMobileScrollOptimization(): void {
    // Detectar si es dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
    
    if (!isMobile) return; // Solo aplicar optimizaciones en móviles
    
    // Encontrar el contenedor principal de scroll
    this.scrollContainer = this.elementRef.nativeElement.closest('.mobile-grid-container') || 
                          document.querySelector('.mobile-grid-container') ||
                          document.documentElement;

    // Agregar listeners para mejorar el scroll en móviles
    if (this.scrollContainer) {
      // Passive listeners para mejor rendimiento
      this.scrollContainer.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
      this.scrollContainer.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
      this.scrollContainer.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
      
      // Optimizar el scroll para touch devices desde el inicio
      this.scrollContainer.style.overflowY = 'auto';
      (this.scrollContainer.style as any).webkitOverflowScrolling = 'touch';
      this.scrollContainer.style.scrollBehavior = 'auto'; // Scroll rápido por defecto
      
      // Preparar body para scroll ultra-rápido
      document.body.style.overscrollBehavior = 'auto';
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      
      // Eliminar cualquier interferencia de CSS
      document.body.style.touchAction = 'manipulation';
    }
    
    console.log('Mobile scroll optimizations initialized - smart drag/scroll detection enabled');
  }

  private onTouchStart(event: TouchEvent): void {
    // Detectar si el touch está en una tarjeta arrastrable
    const target = event.target as Element;
    const isDragElement = target.closest('[cdkDrag]');
    
    if (isDragElement) {
      this.isDragging = false; // Reset dragging state
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  private onTouchMove(event: TouchEvent): void {
    const currentY = event.touches[0].clientY;
    const deltaY = Math.abs(currentY - this.lastTouchY);
    
    // Si se mueve verticalmente más de 5px, es scroll, no drag
    if (deltaY > 5) {
      this.isScrolling = true;
      this.disableDragTemporarily();
      
      // Clear previous timeout
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // Re-enable drag after scroll stops
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.enableDrag();
      }, 150);
    }
    
    this.lastTouchY = currentY;
  }

  private onTouchEnd(event: TouchEvent): void {
    this.isDragging = false;
    
    // Re-enable drag after a short delay
    setTimeout(() => {
      if (!this.isScrolling) {
        this.enableDrag();
      }
    }, 100);
  }

  private disableDragTemporarily(): void {
    const dragElements = document.querySelectorAll('[cdkDrag]');
    dragElements.forEach(element => {
      (element as HTMLElement).style.pointerEvents = 'none';
      element.setAttribute('data-drag-disabled', 'true');
    });
  }

  private enableDrag(): void {
    const dragElements = document.querySelectorAll('[cdkDrag]');
    dragElements.forEach(element => {
      (element as HTMLElement).style.pointerEvents = '';
      element.removeAttribute('data-drag-disabled');
    });
  }

  private async initializeGame(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Cargar personajes del servicio con página aleatoria desde el inicio
      const randomPage = Math.floor(Math.random() * 41) + 1;
      this.characterService.setPage(randomPage);
      
      // Esperar a que se carguen los personajes
      setTimeout(() => {
        const allCharacters = this.characterService.characters();
        console.log(`Status Game: Loaded ${allCharacters.length} characters from page ${randomPage}`);
        
        if (allCharacters.length >= 8) {
          this.setupGame(allCharacters);
        } else {
          // Si no hay suficientes, intentar con página 1 (siempre tiene personajes)
          console.log('Not enough characters, trying page 1...');
          this.characterService.setPage(1);
          
          setTimeout(() => {
            const fallbackCharacters = this.characterService.characters();
            console.log(`Status Game: Loaded ${fallbackCharacters.length} characters from page 1`);
            
            if (fallbackCharacters.length > 0) {
              this.setupGame(fallbackCharacters);
            } else {
              console.error('Failed to load characters');
              this.isLoading.set(false);
            }
          }, 1000);
        }
      }, 1200);
      
    } catch (error) {
      console.error('Error al inicializar el juego:', error);
      this.isLoading.set(false);
    }
  }

  private setupGame(characters: Character[]): void {
    // Asegurar que tenemos al menos algunos personajes
    if (characters.length === 0) {
      console.error('No characters available for the game');
      this.isLoading.set(false);
      return;
    }
    
    // Mezclar todos los personajes disponibles
    const shuffledCharacters = this.shuffleArray([...characters]);
    
    // Intentar obtener una distribución equilibrada, pero ser flexible
    const aliveChars = shuffledCharacters.filter(c => c.status === 'Alive');
    const deadChars = shuffledCharacters.filter(c => c.status === 'Dead');
    const unknownChars = shuffledCharacters.filter(c => c.status === 'unknown');
    
    let selectedCharacters: Character[] = [];
    
    // Estrategia adaptativa: usar lo que esté disponible
    const totalAvailable = characters.length;
    const targetTotal = Math.min(10, totalAvailable);
    
    if (aliveChars.length >= 2 && deadChars.length >= 2 && unknownChars.length >= 2) {
      // Caso ideal: hay variedad de estados
      const aliveCount = Math.min(4, aliveChars.length);
      const deadCount = Math.min(3, deadChars.length);
      const unknownCount = Math.min(3, unknownChars.length);
      
      selectedCharacters.push(...aliveChars.slice(0, aliveCount));
      selectedCharacters.push(...deadChars.slice(0, deadCount));
      selectedCharacters.push(...unknownChars.slice(0, unknownCount));
      
      // Completar con el resto si es necesario
      if (selectedCharacters.length < targetTotal) {
        const remaining = shuffledCharacters.filter(
          char => !selectedCharacters.some(selected => selected.id === char.id)
        );
        selectedCharacters.push(...remaining.slice(0, targetTotal - selectedCharacters.length));
      }
    } else {
      // Caso de respaldo: usar los primeros N personajes disponibles
      selectedCharacters = shuffledCharacters.slice(0, targetTotal);
    }
    
    console.log(`Status Game: Using ${selectedCharacters.length} characters`, {
      alive: selectedCharacters.filter(c => c.status === 'Alive').length,
      dead: selectedCharacters.filter(c => c.status === 'Dead').length,
      unknown: selectedCharacters.filter(c => c.status === 'unknown').length,
      total: selectedCharacters.length
    });
    
    // Convertir personajes a elementos
    const elements = selectedCharacters.map((char, index) => ({
      id: char.id,
      nombre: char.name.split(' ')[0] || char.name,
      apellido: char.name.split(' ').slice(1).join(' ') || char.species,
      amigo: Math.random() > 0.5,
      fechaFabricacion: char.created,
      avatar: char.image,
      grupo: char.status === 'Alive' ? 1 : char.status === 'Dead' ? 2 : 3
    }));
    
    // Mezclar y distribuir en las columnas asegurando que todos estén en lugares incorrectos
    const shuffled = this.shuffleArray([...elements]);
    
    // Separar por grupos para asegurar distribución incorrecta
    const aliveEls = shuffled.filter(el => el.grupo === 1); // Vivos
    const deadEls = shuffled.filter(el => el.grupo === 2);  // Muertos
    const unknownEls = shuffled.filter(el => el.grupo === 3); // Desconocidos
    
    // Distribuir estratégicamente para que todos estén mal ubicados
    const aliveColumn: Elemento[] = [];
    const deadColumn: Elemento[] = [];
    const unknownColumn: Elemento[] = [];
    
    // Función helper para distribuir elementos en columnas incorrectas
    const distributeIncorrectly = (elements: Elemento[], correctGroup: number) => {
      if (elements.length === 0) return;
      
      const availableColumns: string[] = [];
      if (correctGroup !== 1) availableColumns.push('alive');
      if (correctGroup !== 2) availableColumns.push('dead');
      if (correctGroup !== 3) availableColumns.push('unknown');
      
      // Distribuir entre las columnas incorrectas disponibles
      elements.forEach((el, index) => {
        const targetColumn = availableColumns[index % availableColumns.length];
        if (targetColumn === 'alive') aliveColumn.push(el);
        else if (targetColumn === 'dead') deadColumn.push(el);
        else if (targetColumn === 'unknown') unknownColumn.push(el);
      });
    };
    
    // Distribuir cada grupo en lugares incorrectos
    distributeIncorrectly(aliveEls, 1);    // Vivos a columnas incorrectas
    distributeIncorrectly(deadEls, 2);     // Muertos a columnas incorrectas
    distributeIncorrectly(unknownEls, 3);  // Desconocidos a columnas incorrectas
    
    // Mezclar cada columna para que no se vea el patrón
    this.aliveElements.set(this.shuffleArray(aliveColumn));
    this.deadElements.set(this.shuffleArray(deadColumn));
    this.unknownElements.set(this.shuffleArray(unknownColumn));
    
    console.log('Initial distribution (all incorrect):', {
      aliveColumn: aliveColumn.length,
      deadColumn: deadColumn.length,
      unknownColumn: unknownColumn.length,
      originalCounts: {
        alive: aliveEls.length,
        dead: deadEls.length,
        unknown: unknownEls.length
      },
      verification: {
        correctInAlive: aliveColumn.filter(el => el.grupo === 1).length,
        correctInDead: deadColumn.filter(el => el.grupo === 2).length,
        correctInUnknown: unknownColumn.filter(el => el.grupo === 3).length
      }
    });
    
    this.gameElements.set(elements);
    this.isLoading.set(false);
    this.gameInitialized.set(true);
    
    // Activar animaciones de entrada solo en la primera carga
    this.showInitialAnimations.set(true);
    
    // Desactivar las animaciones después de que se ejecuten
    setTimeout(() => {
      this.showInitialAnimations.set(false);
    }, 2000); // 2 segundos es suficiente para que terminen todas las animaciones
    
    // Reset contadores
    this.totalMovements.set(0);
    this.correctMovements.set(0);
    this.incorrectMovements.set(0);
    this.gameCompleted.set(false);
    this.showVictoryModal.set(false);
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
        this.showVictoryModal.set(true);
      }
    }, 100);
  }

  // Método para manejar cuando se entra a una zona de drop
  onDragEntered(event: any): void {
    const dropListElement = event.container.element.nativeElement;
    dropListElement.classList.add('drop-zone-hover');
  }

  // Método para manejar cuando se sale de una zona de drop
  onDragExited(event: any): void {
    const dropListElement = event.container.element.nativeElement;
    dropListElement.classList.remove('drop-zone-hover');
  }

  // Métodos para mejorar el comportamiento de drag en móviles
  onDragStarted(event: any): void {
    this.isDragging = true;
    this.isScrolling = false; // Ensure scrolling is disabled when dragging
    console.log('Drag started - disabling scroll interference');
    
    // Activar scroll rápido durante el drag en móviles
    if (this.scrollContainer) {
      // Forzar scroll nativo optimizado
      this.scrollContainer.style.overflowY = 'scroll';
      (this.scrollContainer.style as any).webkitOverflowScrolling = 'touch';
      this.scrollContainer.style.scrollBehavior = 'auto'; // Scroll inmediato, no suave
      
      // Remover restricciones que puedan interferir
      document.body.style.overscrollBehavior = 'auto';
      document.documentElement.style.overscrollBehavior = 'auto';
      
      // Forzar aceleración por hardware en todo el viewport
      document.body.style.transform = 'translateZ(0)';
      document.body.style.willChange = 'scroll-position';
      
      // Eliminar cualquier restricción de momentum
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    }
    
    // Optimizar el elemento siendo arrastrado
    const dragElement = event.source.element.nativeElement;
    if (dragElement) {
      dragElement.style.willChange = 'transform';
      dragElement.style.transform = 'translateZ(0)';
    }
  }

  onDragEnded(event: any): void {
    this.isDragging = false;
    console.log('Drag ended - restoring normal scroll behavior');
    
    // Restaurar comportamiento normal de forma más agresiva
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.style.scrollBehavior = 'smooth';
      }
      
      // Limpiar optimizaciones del body
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.transform = '';
      document.body.style.willChange = '';
      (document.body.style as any).webkitOverflowScrolling = '';
      
      // Re-enable drag functionality
      this.enableDrag();
      
    }, 150); // Delay ligeramente mayor para asegurar que el drag terminó
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
    const baseClasses = 'rounded-xl overflow-hidden';
    
    if (elemento.grupo === currentGroup) {
      return `${baseClasses} border-green-500 border-4`;
    } else {
      return `${baseClasses} border-red-500 border-4`;
    }
  }

  resetGame(): void {
    this.gameInitialized.set(false);
    this.showVictoryModal.set(false);
    this.showInitialAnimations.set(false); // Resetear animaciones
    this.initializeGame();
  }

  closeVictoryModal(): void {
    this.showVictoryModal.set(false);
  }

  // Método para generar la clase CSS de delay para las cartas
  getCardDelayClass(columnIndex: number, cardIndex: number): string {
    if (!this.showInitialAnimations()) {
      return ''; // No aplicar animaciones después de la carga inicial
    }
    const totalDelay = columnIndex * 2 + cardIndex;
    return `stagger-item status-card-delay-${Math.min(totalDelay, 9)}`;
  }

  // Método para generar las clases de animación de columnas
  getColumnAnimationClass(columnIndex: number): string {
    if (!this.showInitialAnimations()) {
      return ''; // No aplicar animaciones después de la carga inicial
    }
    return `stagger-item status-column-${columnIndex}`;
  }

  // Método para generar las clases de animación de estadísticas
  getStatsAnimationClass(): string {
    if (!this.showInitialAnimations()) {
      return ''; // No aplicar animaciones después de la carga inicial
    }
    return 'stagger-item status-stats';
  }
}
