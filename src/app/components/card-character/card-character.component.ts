import { Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Character } from '../../interface/character';

@Component({
  selector: 'app-card-character',
  templateUrl: './card-character.component.html',
  standalone: true,
  imports: [CommonModule, NgClass, RouterLink]
})
export class CardCharacterComponent {
  @Input() character!: Character;
}
