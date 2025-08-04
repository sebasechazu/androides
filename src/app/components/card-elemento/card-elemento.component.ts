import { Component, Input } from '@angular/core';
import { Elemento } from '../../interface/elemento';

@Component({
  selector: 'app-card-elemento',
  templateUrl: './card-elemento.component.html'
})
export class CardElementoComponent {
  @Input() elemento!: Elemento;
}
