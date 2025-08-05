import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CardElementoComponent } from './card-elemento/card-elemento.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ElementosService } from '../../services/elementos.service';
import { Elemento } from '../../interfaces/elemento';

@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.component.html',
  standalone: true,
  imports: [CommonModule, CardElementoComponent, DragDropModule]
})
export class ElementosComponent implements OnInit {
  private elementosService = inject(ElementosService);

  // Usar directamente los signals del servicio
  elementos = this.elementosService.elementos;
  isLoading = this.elementosService.isLoading;
  error = this.elementosService.error;
  
  // Computed signals para los grupos
  elementosGrupo1 = computed(() => 
    this.elementos().filter(elemento => elemento.grupo === 1)
  );
  elementosGrupo2 = computed(() => 
    this.elementos().filter(elemento => elemento.grupo === 2)
  );
  elementosGrupo3 = computed(() => 
    this.elementos().filter(elemento => elemento.grupo === 3)
  );

  // Estadísticas de grupos
  grupoStats = computed(() => ({
    grupo1: {
      total: this.elementosGrupo1().length,
      amigos: this.elementosGrupo1().filter(e => e.amigo).length
    },
    grupo2: {
      total: this.elementosGrupo2().length,
      amigos: this.elementosGrupo2().filter(e => e.amigo).length
    },
    grupo3: {
      total: this.elementosGrupo3().length,
      amigos: this.elementosGrupo3().filter(e => e.amigo).length
    }
  }));

  // Signals para el modal
  modalVisible = signal<boolean>(false);
  elementoSeleccionado = signal<Elemento | null>(null);

  ngOnInit(): void {
    this.elementosService.init();
  }

  // Métodos para el drag & drop
  moverElemento(event: CdkDragDrop<Elemento[]>, grupoDestino: number): void {
    if (event.previousContainer === event.container) {
      // Mover dentro del mismo grupo
      const elementosActuales = [...this.obtenerArrayPorGrupo(grupoDestino)];
      moveItemInArray(elementosActuales, event.previousIndex, event.currentIndex);
      // No necesitamos actualizar nada porque es solo reordenamiento visual
    } else {
      // Mover entre grupos diferentes
      const grupoOrigen = this.obtenerNumeroGrupo(event.previousContainer.id);
      const elementosOrigen = [...this.obtenerArrayPorGrupo(grupoOrigen)];
      const elementosDestino = [...this.obtenerArrayPorGrupo(grupoDestino)];
      
      const elemento = elementosOrigen[event.previousIndex];
      
      // Crear nuevo elemento con el grupo actualizado
      const elementoActualizado = { ...elemento, grupo: grupoDestino };
      
      // Actualizar la lista principal de elementos
      const todosLosElementos = this.elementos().map(e => 
        e.id === elemento.id ? elementoActualizado : e
      );
      
      // Actualizar el signal del servicio (esto actualizará automáticamente los computed signals)
      this.actualizarElementosEnServicio(todosLosElementos);
    }
  }

  private actualizarElementosEnServicio(elementos: Elemento[]): void {
    this.elementosService.updateElementos(elementos);
  }
  
  private obtenerArrayPorGrupo(grupo: number): Elemento[] {
    switch (grupo) {
      case 1: return this.elementosGrupo1();
      case 2: return this.elementosGrupo2();
      case 3: return this.elementosGrupo3();
      default: return [];
    }
  }
  
  private obtenerNumeroGrupo(containerId: string): number {
    if (containerId.includes('listaGrupo1')) return 1;
    if (containerId.includes('listaGrupo2')) return 2;
    return 3;
  }

  // Métodos para el modal
  verElemento(id: number): void {
    const elemento = this.elementosService.getElementoXId(id);
    this.elementoSeleccionado.set(elemento || null);
    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.elementoSeleccionado.set(null);
  }

  // Métodos adicionales
  recargarElementos(): void {
    this.elementosService.recargarElementos();
  }

  filtrarPorAmigos(soloAmigos: boolean): Elemento[] {
    return this.elementosService.filtrarPorAmigos(soloAmigos);
  }

  buscarElemento(termino: string): Elemento[] {
    return this.elementosService.buscarElemento(termino);
  }
}
