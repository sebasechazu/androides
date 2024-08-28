import { Component, OnInit } from '@angular/core';
import { Androide } from '../../interface/androide';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidesService } from '../../service/androides.service';

@Component({
    selector: 'app-buscador',
    templateUrl: './buscador.component.html',
    styleUrls: ['./buscador.component.css'],
    standalone: true
})
export class BuscadorComponent implements OnInit {

  androides: Androide[] = []
  termino: string | undefined;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private _AndroidesService: AndroidesService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.termino = params['termino'];
      this.androides = this._AndroidesService.buscarAndroide(params['termino']);
    });
  }

  public verAndroide(idx:number){ this.router.navigate(['/androide', idx]) }

}
