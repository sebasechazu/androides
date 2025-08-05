import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  animations: [
    trigger('dropdownAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0.8)', transformOrigin: 'top' }),
        animate('220ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'scaleY(1)', transformOrigin: 'top' }))
      ]),
      transition(':leave', [
        animate('180ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'scaleY(0.8)', transformOrigin: 'top' }))
      ])
    ])
  ]
})
export class DropdownComponent {
  @Input() options: string[] = [];
  @Input() value: string = '';
  @Input() placeholder: string = 'Seleccionar';
  @Output() valueChange = new EventEmitter<string>();
  open = false;

  select(option: string) {
    this.valueChange.emit(option);
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }
}
