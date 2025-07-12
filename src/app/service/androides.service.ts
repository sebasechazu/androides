import { Injectable, computed, signal } from '@angular/core';
import { Androide } from '../interface/androide';
import { ANDROIDES } from '../data/androides.data';

@Injectable({ providedIn: 'root' })
export class AndroidesService {

  private readonly androides = signal(ANDROIDES);

  getAndroides = () => this.androides();

  getAndroideXId = (id: number) =>
    this.androides().find(a => a.id === id) ?? this.androides()[0];

  buscarAndroide = (termino: string) => {
    const lowerTerm = termino.toLowerCase();
    return this.androides().filter(a =>
      a.apellido.toLowerCase().includes(lowerTerm)
    );
  };
}
