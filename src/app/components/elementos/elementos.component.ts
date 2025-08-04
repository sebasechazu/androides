import { Component, inject } from '@angular/core';
import { ElementoComponent } from '../elemento/elemento.component';
import { CardElementoComponent } from '../card-elemento/card-elemento.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ElementosService } from '../../service/elementos.service';
import { Elemento } from '../../interface/elemento';

@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.component.html',
  standalone: true,
  imports: [CommonModule, ElementoComponent, CardElementoComponent, DragDropModule]
})
export class ElementosComponent {
  moverElemento(event: CdkDragDrop<Elemento[]>, grupoDestino: number) {
    if (event.previousContainer === event.container) {
      // Si se mueve dentro del mismo grupo
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Si se mueve entre grupos
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Actualizar el grupo del elemento
      const elemento = event.container.data[event.currentIndex];
      elemento.grupo = grupoDestino;
    }
  }
  private elementosService = inject(ElementosService);

  elementos: Elemento[] = this.elementosService.getElementos();
  elementosGrupo1: Elemento[] = this.elementos.filter(a => a.grupo === 1);
  elementosGrupo2: Elemento[] = this.elementos.filter(a => a.grupo === 2);

  modalVisible = false;
  elementoSeleccionado: Elemento | null = null;

  verElemento(id: number) {
    this.elementoSeleccionado = this.elementosService.getElementoXId(id);
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.elementoSeleccionado = null;
  }
}
