import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../../interface/character';

@Component({
  selector: 'app-modal-character',
  templateUrl: './modal-character.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ModalCharacterComponent {
  @Input() character!: Character;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
