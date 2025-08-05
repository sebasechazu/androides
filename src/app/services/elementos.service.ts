import { Injectable, signal, computed, inject } from '@angular/core';
import { Elemento } from '../interface/elemento';
import { CharacterService } from './charater.service';
import { Character } from '../interface/character';

@Injectable({ providedIn: 'root' })
export class ElementosService {
  private readonly characterService = inject(CharacterService);
  
  // Signals para el estado del servicio
  private readonly _elementos = signal<Elemento[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _initialDataLoaded = signal<boolean>(false);

  // Signals públicos readonly
  readonly elementos = this._elementos.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isDataLoaded = this._initialDataLoaded.asReadonly();

  // Computed signals
  readonly totalElementos = computed(() => this._elementos().length);
  readonly elementosAmigos = computed(() => 
    this._elementos().filter(elemento => elemento.amigo)
  );
  readonly elementosNoAmigos = computed(() => 
    this._elementos().filter(elemento => !elemento.amigo)
  );
  readonly gruposUnicos = computed(() => 
    Array.from(new Set(this._elementos().map(elemento => elemento.grupo)))
  );

  // Método de inicialización
  init(): void {
    if (!this._initialDataLoaded()) {
      this.cargarElementosAleatorios();
    }
  }

  private cargarElementosAleatorios(): void {
    // Si ya tenemos datos, no volvemos a cargar
    if (this._initialDataLoaded()) return;

    this._isLoading.set(true);
    this._error.set(null);

    // Generamos una página aleatoria para obtener personajes diversos
    const randomPage = Math.floor(Math.random() * 20) + 1;
    
    // Configuramos el servicio de characters para obtener una página específica
    this.characterService.setPage(randomPage);
    
    // Simulamos un pequeño delay y luego obtenemos los datos
    setTimeout(() => {
      const characters = this.characterService.characters();
      
      if (characters.length > 0) {
        // Seleccionamos hasta 10 personajes aleatorios
        const selectedCharacters = this.shuffleArray([...characters]).slice(0, 10);
        const elementosNuevos = this.convertirCharactersAElementos(selectedCharacters);
        this._elementos.set(elementosNuevos);
        this._initialDataLoaded.set(true);
        this._isLoading.set(false);
      } else {
        // Si no hay characters, usamos elementos genéricos
        this._elementos.set(this.crearElementosGenericos());
        this._initialDataLoaded.set(true);
        this._isLoading.set(false);
      }
    }, 500); // Pequeño delay para permitir que se carguen los datos
  }

  // Método para mezclar array (Fisher-Yates shuffle)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

  // Métodos públicos
  getElementos(): Elemento[] {
    // Si no hay datos cargados, intentamos cargarlos
    if (this._elementos().length === 0 && !this._initialDataLoaded()) {
      this.init();
    }
    return this._elementos();
  }

  getElementoXId(id: number): Elemento | undefined {
    const elemento = this._elementos().find(a => a.id === id);
    return elemento || this._elementos()[0];
  }

  buscarElemento(termino: string): Elemento[] {
    const lowerTerm = termino.toLowerCase();
    return this._elementos().filter(a =>
      a.nombre.toLowerCase().includes(lowerTerm) || 
      a.apellido.toLowerCase().includes(lowerTerm)
    );
  }

  // Métodos para filtrar elementos
  filtrarPorGrupo(grupo: number): Elemento[] {
    return this._elementos().filter(elemento => elemento.grupo === grupo);
  }

  filtrarPorAmigos(soloAmigos: boolean): Elemento[] {
    return this._elementos().filter(elemento => elemento.amigo === soloAmigos);
  }

  // Método para recargar elementos
  recargarElementos(): void {
    this._initialDataLoaded.set(false);
    this._elementos.set([]);
    this.cargarElementosAleatorios();
  }

  // Método para actualizar elementos (necesario para drag & drop)
  updateElementos(elementos: Elemento[]): void {
    this._elementos.set(elementos);
  }

  // Método para actualizar un elemento específico
  updateElemento(elementoActualizado: Elemento): void {
    this._elementos.update(elementos => 
      elementos.map(e => e.id === elementoActualizado.id ? elementoActualizado : e)
    );
  }

  // Computed signals como métodos (para compatibilidad)
  getTotalElementos = () => this.totalElementos();
  getElementosAmigos = () => this.elementosAmigos();
  getElementosNoAmigos = () => this.elementosNoAmigos();
  getGruposUnicos = () => this.gruposUnicos();
}
