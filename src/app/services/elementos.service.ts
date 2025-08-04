import { Injectable, signal } from '@angular/core';
import { Elemento } from '../interface/elemento';
import { CharacterService } from './charater.service';
import { Character } from '../interface/character';

@Injectable({ providedIn: 'root' })
export class ElementosService {
  private readonly elementos = signal<Elemento[]>([]);
  private initialDataLoaded = false;

  constructor(private characterService: CharacterService) {
    this.cargarElementosAleatorios();
  }

  cargarElementosAleatorios() {
    // Si ya tenemos datos, no volvemos a cargar
    if (this.initialDataLoaded) return;

    // Generamos páginas aleatorias para obtener personajes diversos
    const randomPage = Math.floor(Math.random() * 20) + 1;
    
    this.characterService.getCharacters(randomPage).subscribe({
      next: (response) => {
        // Seleccionamos 10 personajes aleatorios de la respuesta
        const characters = response.results.slice(0, 10);
        const elementosNuevos = this.convertirCharactersAElementos(characters);
        this.elementos.set(elementosNuevos);
        this.initialDataLoaded = true;
      },
      error: (err) => {
        console.error('Error cargando personajes aleatorios:', err);
        // En caso de error, creamos algunos elementos genéricos en lugar de usar datos estáticos
        this.elementos.set(this.crearElementosGenericos());
        this.initialDataLoaded = true;
      }
    });
  }

  // Método para crear elementos genéricos en caso de error
  private crearElementosGenericos(): Elemento[] {
    const elementosGenericos: Elemento[] = [];
    
    for (let i = 1; i <= 5; i++) {
      elementosGenericos.push({
        id: i,
        nombre: `Android ${i}`,
        apellido: `Modelo X${i}`,
        amigo: i % 2 === 0, // Alternamos entre amigo y no amigo
        fechaFabricacion: new Date().toISOString().split('T')[0],
        avatar: `https://robohash.org/android${i}.png?size=250x250&set=set1`,
        grupo: Math.floor(Math.random() * 3) + 1
      });
    }
    
    return elementosGenericos;
  }

  private convertirCharactersAElementos(characters: Character[]): Elemento[] {
    return characters.map((character, index) => ({
      id: character.id,
      nombre: character.name.split(' ')[0] || character.name,
      apellido: character.name.split(' ').slice(1).join(' ') || character.species,
      amigo: character.status === 'Alive',
      fechaFabricacion: character.created.split('T')[0],
      avatar: character.image,
      grupo: Math.floor(Math.random() * 3) + 1
    }));
  }

  getElementos = () => {
    // Si no hay datos cargados, intentamos cargarlos
    if (this.elementos().length === 0 && !this.initialDataLoaded) {
      this.cargarElementosAleatorios();
    }
    return this.elementos();
  }

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
