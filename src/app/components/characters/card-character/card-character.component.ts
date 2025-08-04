import { Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Character } from '../../../interface/character';
import { ModalCharacterComponent } from '../modal-character/modal-character.component';

@Component({
  selector: 'app-card-character',
  templateUrl: './card-character.component.html',
  standalone: true,
  imports: [CommonModule, NgClass, ModalCharacterComponent]
})
export class CardCharacterComponent {
  @Input() character!: Character;
  showModal: boolean = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
