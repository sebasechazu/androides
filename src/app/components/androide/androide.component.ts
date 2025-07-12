import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AndroidesService } from '../../service/androides.service';
import { AsyncPipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-androide',
  templateUrl: './androide.component.html',
  imports: [RouterLink],
})
export class AndroideComponent {
  private route = inject(ActivatedRoute);
  private androidesService = inject(AndroidesService);

  id = signal<number | null>(null);
  androide = computed(() =>
    this.id() != null ? this.androidesService.getAndroideXId(this.id()!) : undefined
  );

  constructor() {
    this.route.params.subscribe(params => {
      this.id.set(+params['id']);
    });
  }
}
