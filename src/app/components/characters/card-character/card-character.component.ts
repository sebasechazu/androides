import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule, NgClass } from '@angular/common';
import { Character } from '../../../interfaces/character';
import { ModalCharacterComponent } from '../modal-character/modal-character.component';

@Component({
  selector: 'app-card-character',
  templateUrl: './card-character.component.html',
  standalone: true,
  imports: [CommonModule, NgClass, ModalCharacterComponent]
  ,
  animations: [
    trigger('cardHover', [
      state('default', style({
        transform: 'scale(1)',
        boxShadow: '0 2px 8px rgba(59,130,246,0.1)',
      })),
      state('hovered', style({
        transform: 'scale(1.05)',
        boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
      })),
      transition('default <=> hovered', [
        animate('250ms cubic-bezier(.4,0,.2,1)')
      ])
    ])
  ]
})
export class CardCharacterComponent {
  @Input() character!: Character;
  showModal: boolean = false;

  hoverState: 'default' | 'hovered' = 'default';

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  setHover(state: 'default' | 'hovered') {
    this.hoverState = state;
  }
}
