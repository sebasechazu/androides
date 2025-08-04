import { Component, OnInit, inject, signal } from '@angular/core';
import { CardElementoComponent } from './card-elemento/card-elemento.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ElementosService } from '../../services/elementos.service';
import { Elemento } from '../../interface/elemento';

@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.component.html',
  standalone: true,
  imports: [CommonModule, CardElementoComponent, DragDropModule]
})
export class ElementosComponent implements OnInit {
  private elementosService = inject(ElementosService);

  elementos = signal<Elemento[]>([]);
  elementosGrupo1 = signal<Elemento[]>([]);
  elementosGrupo2 = signal<Elemento[]>([]);
  elementosGrupo3 = signal<Elemento[]>([]);
  isLoading = signal<boolean>(true);

  modalVisible = false;
  elementoSeleccionado: Elemento | null = null;

  ngOnInit() {
    this.cargarElementos();
  }

  cargarElementos() {
    this.isLoading.set(true);
    const datos = this.elementosService.getElementos();
    
    if (datos.length > 0) {
      this.actualizarElementos(datos);
      this.isLoading.set(false);
    } else {
      
      setTimeout(() => {
        const nuevosDatos = this.elementosService.getElementos();
        if (nuevosDatos.length > 0) {
          this.actualizarElementos(nuevosDatos);
        }
        this.isLoading.set(false);
      }, 1000);
    }
  }

  actualizarElementos(datos: Elemento[]) {
    this.elementos.set(datos);
    this.elementosGrupo1.set(datos.filter(a => a.grupo === 1));
    this.elementosGrupo2.set(datos.filter(a => a.grupo === 2));
    this.elementosGrupo3.set(datos.filter(a => a.grupo === 3));
  }

  moverElemento(event: CdkDragDrop<Elemento[]>, grupoDestino: number) {
    if (event.previousContainer === event.container) {

      const arrayActual = [...this.obtenerArrayPorGrupo(grupoDestino)];
      moveItemInArray(arrayActual, event.previousIndex, event.currentIndex);
      
      this.actualizarGrupo(grupoDestino, arrayActual);
    } else {

      const grupoOrigen = this.obtenerNumeroGrupo(event.previousContainer.id);
      const arrayOrigen = [...this.obtenerArrayPorGrupo(grupoOrigen)];
      const arrayDestino = [...this.obtenerArrayPorGrupo(grupoDestino)];
      
      const elemento = arrayOrigen[event.previousIndex];
      
      arrayOrigen.splice(event.previousIndex, 1);
      arrayDestino.splice(event.currentIndex, 0, elemento);
      
      elemento.grupo = grupoDestino;
      
      this.actualizarGrupo(grupoOrigen, arrayOrigen);
      this.actualizarGrupo(grupoDestino, arrayDestino);
    }
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
  
  private actualizarGrupo(numeroGrupo: number, array: Elemento[]): void {
    switch (numeroGrupo) {
      case 1:
        this.elementosGrupo1.set(array);
        break;
      case 2:
        this.elementosGrupo2.set(array);
        break;
      case 3:
        this.elementosGrupo3.set(array);
        break;
    }
  }

  verElemento(id: number) {
    this.elementoSeleccionado = this.elementosService.getElementoXId(id);
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.elementoSeleccionado = null;
  }
}
