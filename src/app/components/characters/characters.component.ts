import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CharacterService } from '../../services/charater.service';
import { CardCharacterComponent } from './card-character/card-character.component';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CardCharacterComponent, DropdownComponent],
  templateUrl: './characters.component.html'
})
export class CharactersComponent implements OnInit {
  private characterService = inject(CharacterService);

  // Usar directamente los signals del servicio
  characters = this.characterService.characters;
  isLoading = this.characterService.isLoading;
  error = this.characterService.error;
  currentPage = this.characterService.currentPage;
  totalPages = this.characterService.totalPages;
  totalCount = this.characterService.totalCount;
  hasNextPage = this.characterService.hasNextPage;
  hasPrevPage = this.characterService.hasPrevPage;

  // Filtros locales (solo para la UI)
  statusFilter = signal<string>('');
  speciesFilter = signal<string>('');
  genderFilter = signal<string>('');

  // Opciones para los dropdowns usando computed signals
  statusOptions = computed(() => 
    ['Todos', ...this.characterService.uniqueStatuses()]
  );
  
  speciesOptions = computed(() => 
    ['Todas', ...this.characterService.uniqueSpecies()]
  );
  
  genderOptions = computed(() => 
    ['Todos', ...this.characterService.uniqueGenders()]
  );

  // Computed para mostrar información de paginación
  pageInfo = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const count = this.totalCount();
    return {
      current,
      total,
      count,
      start: ((current - 1) * 20) + 1,
      end: Math.min(current * 20, count)
    };
  });

  ngOnInit(): void {
    this.characterService.init();
  }

  // Métodos para manejar cambios en los filtros
  onStatusChange(value: string): void {
    const statusValue = value === 'Todos' ? '' : value;
    this.statusFilter.set(statusValue);
    this.characterService.updateFilter('status', statusValue);
  }

  onSpeciesChange(value: string): void {
    const speciesValue = value === 'Todas' ? '' : value;
    this.speciesFilter.set(speciesValue);
    this.characterService.updateFilter('species', speciesValue);
  }

  onGenderChange(value: string): void {
    const genderValue = value === 'Todos' ? '' : value;
    this.genderFilter.set(genderValue);
    this.characterService.updateFilter('gender', genderValue);
  }

  // Métodos de navegación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.characterService.setPage(page);
    }
  }

  nextPage(): void {
    this.characterService.nextPage();
  }

  prevPage(): void {
    this.characterService.prevPage();
  }

  // Resetear filtros
  resetFilters(): void {
    this.statusFilter.set('');
    this.speciesFilter.set('');
    this.genderFilter.set('');
    this.characterService.clearFilters();
  }

  // Buscar por nombre
  searchByName(name: string): void {
    this.characterService.searchCharacters(name);
  }
}
