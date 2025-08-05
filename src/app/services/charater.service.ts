import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, of } from 'rxjs';
import { Character } from '../interfaces/character';

// Interfaz para la respuesta paginada de la API
interface ApiResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}

// Interfaz para filtros de búsqueda
interface CharacterFilters {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://rickandmortyapi.com/api';
  
  // Signals para el estado del servicio
  private readonly _currentPage = signal<number>(1);
  private readonly _filters = signal<CharacterFilters>({});
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Computed signals
  readonly currentPage = this._currentPage.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Signal que contiene los datos de caracteres
  private readonly charactersData = signal<ApiResponse<Character>>({
    info: { count: 0, pages: 0, next: null, prev: null },
    results: []
  });

  // Computed signals derivados
  readonly characters = computed(() => this.charactersData().results);
  readonly totalPages = computed(() => this.charactersData().info.pages);
  readonly totalCount = computed(() => this.charactersData().info.count);
  readonly hasNextPage = computed(() => !!this.charactersData().info.next);
  readonly hasPrevPage = computed(() => !!this.charactersData().info.prev);

  // Computed signals para valores únicos
  readonly uniqueStatuses = computed(() => 
    Array.from(new Set(this.characters().map((c: Character) => c.status)))
  );
  
  readonly uniqueSpecies = computed(() => 
    Array.from(new Set(this.characters().map((c: Character) => c.species).filter((s: string) => s)))
  );
  
  readonly uniqueGenders = computed(() => 
    Array.from(new Set(this.characters().map((c: Character) => c.gender)))
  );

  // Métodos públicos para actualizar el estado
  setPage(page: number): void {
    this._currentPage.set(page);
    this.loadCharacters();
  }

  setFilters(filters: CharacterFilters): void {
    this._filters.set(filters);
    this._currentPage.set(1); // Reset a la primera página cuando cambian los filtros
    this.loadCharacters();
  }

  updateFilter(key: keyof CharacterFilters, value: string | number): void {
    this._filters.update(current => ({ ...current, [key]: value }));
    this._currentPage.set(1);
    this.loadCharacters();
  }

  clearFilters(): void {
    this._filters.set({});
    this._currentPage.set(1);
    this.loadCharacters();
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.setPage(this._currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.setPage(this._currentPage() - 1);
    }
  }

  // Método para cargar personajes
  private loadCharacters(): void {
    this._isLoading.set(true);
    this._error.set(null);

    const page = this._currentPage();
    const filters = this._filters();

    this.getCharactersObservable(page, filters).subscribe({
      next: (data) => {
        this.charactersData.set(data);
        this._isLoading.set(false);
      },
      error: (error) => {
        this._error.set('Error al cargar personajes');
        this._isLoading.set(false);
        console.error('Error loading characters:', error);
      }
    });
  }

  // Observable interno para obtener personajes
  private getCharactersObservable(page: number, filters: CharacterFilters): Observable<ApiResponse<Character>> {
    let url = `${this.apiUrl}/character/?page=${page}`;
    
    // Agregar filtros a la URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'page') {
        url += `&${key}=${encodeURIComponent(value)}`;
      }
    });

    return this.http.get<ApiResponse<Character>>(url).pipe(
      catchError(this.handleError<ApiResponse<Character>>('getCharacters', {
        info: { count: 0, pages: 0, next: null, prev: null },
        results: []
      }))
    );
  }

  // Obtener un personaje por ID (mantiene Observable para casos específicos)
  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/character/${id}`)
      .pipe(
        catchError(this.handleError<Character>(`getCharacter id=${id}`))
      );
  }

  // Obtener personaje por ID como Signal
  getCharacterAsSignal(id: number) {
    return toSignal(this.getCharacter(id), { initialValue: null });
  }

  // Buscar personajes por nombre y actualizar el estado
  searchCharacters(name: string): void {
    if (!name.trim()) {
      this.clearFilters();
      return;
    }
    this.setFilters({ name: name.trim() });
  }

  // Método de inicialización
  init(): void {
    this.loadCharacters();
  }

  // Manejador de errores genérico
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Puedes enviar el error a un servicio de registro remoto
      // this.logService.error(error);
      
      // Devuelve un resultado vacío para que la aplicación siga funcionando
      return of(result as T);
    };
  }
}
