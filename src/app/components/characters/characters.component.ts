import { Component, OnInit, inject, signal } from '@angular/core';
import { CharacterService } from '../../services/charater.service';
import { Character } from '../../interface/character';
import { CardCharacterComponent } from './card-character/card-character.component';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CardCharacterComponent,DropdownComponent],
  templateUrl: './characters.component.html'
})
export class CharactersComponent implements OnInit {
  private characterService = inject(CharacterService);

  characters = signal<Character[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);

  // Filtros
  statusFilter = signal<string>('');
  speciesFilter = signal<string>('');
  genderFilter = signal<string>('');

  // Opciones para los dropdowns
  statusOptions = signal<string[]>(['Todos']);
  speciesOptions = signal<string[]>(['Todas']);
  genderOptions = signal<string[]>(['Todos']);

  ngOnInit(): void {
    this.loadCharacters();
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value === 'Todos' ? '' : value);
    this.applyFilters();
  }

  onSpeciesChange(value: string): void {
    this.speciesFilter.set(value === 'Todas' ? '' : value);
    this.applyFilters();
  }

  onGenderChange(value: string): void {
    this.genderFilter.set(value === 'Todos' ? '' : value);
    this.applyFilters();
  }

  loadCharacters(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentPage.set(page);
    this.characterService.getCharacters(page).subscribe({
      next: (response) => {
        this.characters.set(response.results);
        this.totalPages.set(response.info.pages);
        this.isLoading.set(false);
        this.statusOptions.set(['Todos', ...this.characterService.getUniqueStatuses(response.results)]);
        this.speciesOptions.set(['Todas', ...this.characterService.getUniqueSpecies(response.results)]);
        this.genderOptions.set(['Todos', ...this.characterService.getUniqueGenders(response.results)]);
      },
      error: () => {
        this.error.set('Error al cargar los personajes. Intenta de nuevo más tarde.');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadCharacters(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  applyFilters(): void {
    this.isLoading.set(true);
    this.error.set(null);
    const filters: {[key: string]: string} = {};
    if (this.statusFilter()) filters["status"] = this.statusFilter();
    if (this.speciesFilter()) filters["species"] = this.speciesFilter();
    if (this.genderFilter()) filters["gender"] = this.genderFilter();
    this.characterService.filterCharacters(filters).subscribe({
      next: (characters) => {
        this.characters.set(characters);
        this.isLoading.set(false);
        // Actualizar opciones únicas pero NO modificar el valor actual de los filtros
        this.statusOptions.set(['Todos', ...this.characterService.getUniqueStatuses(characters)]);
        this.speciesOptions.set(['Todas', ...this.characterService.getUniqueSpecies(characters)]);
        this.genderOptions.set(['Todos', ...this.characterService.getUniqueGenders(characters)]);
      },
      error: () => {
        this.error.set('Error al aplicar los filtros. Intenta de nuevo más tarde.');
        this.isLoading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.statusFilter.set('');
    this.speciesFilter.set('');
    this.genderFilter.set('');
    this.loadCharacters(1);
  }
}
