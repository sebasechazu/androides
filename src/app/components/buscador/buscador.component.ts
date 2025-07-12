import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AndroidesService } from '../../service/androides.service';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html'
})
export class BuscadorComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private androidesService = inject(AndroidesService);

  termino = signal<string>('');
  androides = computed(() => this.androidesService.buscarAndroide(this.termino()));

  constructor() {
    this.route.params.subscribe(params => {
      this.termino.set(params['termino']);
    });
  }

  verAndroide(id: number) {
    this.router.navigate(['/androide', id]);
  }
}
