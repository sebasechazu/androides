import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Character } from '../../../interfaces/character';

@Component({
  selector: 'app-modal-character',
  templateUrl: './modal-character.component.html',
  standalone: true,
  imports: [CommonModule]
  ,
  animations: [
    trigger('modalAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class ModalCharacterComponent {
  @Input() character!: Character;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
