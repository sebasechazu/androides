import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, } from '@angular/router';
import { ElementosService } from '../../service/elementos.service';

@Component({
  selector: 'app-elemento',
  templateUrl: './elemento.component.html',
  imports: [],
})
export class ElementoComponent {
  private route = inject(ActivatedRoute);
  private elementosService = inject(ElementosService);

  id = signal<number | null>(null);
  elemento = computed(() =>
    this.id() != null ? this.elementosService.getElementoXId(this.id()!) : undefined
  );

  constructor() {
    this.route.params.subscribe(params => {
      this.id.set(+params['id']);
    });
  }
}
