import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Character } from '../interface/character';

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

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = 'https://rickandmortyapi.com/api';
  
  constructor(private http: HttpClient) { }

  // Obtener todos los personajes con paginación
  getCharacters(page: number = 1): Observable<ApiResponse<Character>> {
    return this.http.get<ApiResponse<Character>>(`${this.apiUrl}/character/?page=${page}`)
      .pipe(
        tap(response => console.log('Characters fetched', response)),
        catchError(this.handleError<ApiResponse<Character>>('getCharacters', { info: { count: 0, pages: 0, next: null, prev: null }, results: [] }))
      );
  }

  // Obtener un personaje por ID
  getCharacter(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/character/${id}`)
      .pipe(
        tap(character => console.log(`Fetched character id=${id}`, character)),
        catchError(this.handleError<Character>(`getCharacter id=${id}`))
      );
  }

  // Buscar personajes por nombre
  searchCharacters(name: string): Observable<Character[]> {
    if (!name.trim()) {
      return of([]);
    }
    return this.http.get<ApiResponse<Character>>(`${this.apiUrl}/character/?name=${name}`)
      .pipe(
        map(response => response.results),
        tap(characters => console.log(`Found characters matching "${name}"`, characters)),
        catchError(this.handleError<Character[]>('searchCharacters', []))
      );
  }

  // Filtrar personajes por status, species, gender, etc.
  filterCharacters(filters: { [key: string]: string }): Observable<Character[]> {
    let queryParams = '';
    
    Object.keys(filters).forEach((key, index) => {
      if (filters[key]) {
        queryParams += index === 0 ? '?' : '&';
        queryParams += `${key}=${filters[key]}`;
      }
    });
    
    return this.http.get<ApiResponse<Character>>(`${this.apiUrl}/character/${queryParams}`)
      .pipe(
        map(response => response.results),
        tap(characters => console.log('Filtered characters', characters)),
        catchError(this.handleError<Character[]>('filterCharacters', []))
      );
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
