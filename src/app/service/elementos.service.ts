import { Injectable, computed, signal } from '@angular/core';
import { Elemento } from '../interface/elemento';
import { ELEMENTOS } from '../data/elementos.data';

@Injectable({ providedIn: 'root' })
export class ElementosService {

  private readonly elementos = signal(ELEMENTOS);

  getElementos = () => this.elementos();

  getElementoXId = (id: number) =>
    this.elementos().find(a => a.id === id) ?? this.elementos()[0];

  buscarElemento = (termino: string) => {
    const lowerTerm = termino.toLowerCase();
    return this.elementos().filter(a =>
      a.nombre.toLowerCase().includes(lowerTerm) || 
      a.apellido.toLowerCase().includes(lowerTerm)
    );
  };
}
