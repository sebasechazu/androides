import { Component, Input } from '@angular/core';
import { Elemento } from '../../../interfaces/elemento';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-elemento',
  templateUrl: './card-elemento.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class CardElementoComponent {
  @Input() elemento!: Elemento;
}
