import { Component, Input } from '@angular/core';
import { Elemento } from '../../../interfaces/elemento';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-status',
  templateUrl: './card-status.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class CardStatusComponent {
  @Input() elemento!: Elemento;
}
