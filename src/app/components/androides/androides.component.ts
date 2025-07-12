import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AndroidesService } from '../../service/androides.service';
import { Androide } from '../../interface/androide';

@Component({
  selector: 'app-androides',
  templateUrl: './androides.component.html'
})
export class AndroidesComponent {
  private androidesService = inject(AndroidesService);
  private router = inject(Router);

  androides: Androide[] = this.androidesService.getAndroides();

  verAndroide(id: number) {
    this.router.navigate(['/androide', id]);
  }
}
