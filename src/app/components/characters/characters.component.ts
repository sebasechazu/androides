import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../service/charater.service';
import { Character } from '../../interface/character';
import { FormsModule } from '@angular/forms';
import { CardCharacterComponent } from '../card-character/card-character.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, FormsModule, CardCharacterComponent],
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

  ngOnInit(): void {
    this.loadCharacters();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
  }

  onSpeciesChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.speciesFilter.set(value);
  }

  onGenderChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.genderFilter.set(value);
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
      },
      error: (err) => {
        this.error.set('Error al cargar los personajes. Intenta de nuevo más tarde.');
        this.isLoading.set(false);
        console.error('Error cargando personajes:', err);
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
      },
      error: (err) => {
        this.error.set('Error al aplicar los filtros. Intenta de nuevo más tarde.');
        this.isLoading.set(false);
        console.error('Error aplicando filtros:', err);
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
