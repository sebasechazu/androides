import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ElementosService } from '../../service/elementos.service';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html'
})
export class BuscadorComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private elementosService = inject(ElementosService);

  termino = signal<string>('');
  elementos = computed(() => this.elementosService.buscarElemento(this.termino()));

  constructor() {
    this.route.params.subscribe(params => {
      this.termino.set(params['termino']);
    });
  }

  verElemento(id: number) {
    this.router.navigate(['/elemento', id]);
  }
}
