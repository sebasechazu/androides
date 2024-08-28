import { Component, OnInit } from '@angular/core';
import { AndroidesService } from '../../service/androides.service';
import { Router } from '@angular/router';
// service
import { Androide } from '../../interface/androide';
//  prime ng
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-androides',
    templateUrl: './androides.component.html',
    styleUrls: ['./androides.component.css'],
    imports: [TableModule , ButtonModule ],
    standalone: true
})
export class AndroidesComponent implements OnInit {

  androides : Androide[] = [];

  constructor(private _androideService:AndroidesService,private router:Router) { }

  ngOnInit() {
    this.androides = this._androideService.getAndroides();

  }

  public verAndroide(idx:string){ this.router.navigate(['/androide', idx]) }
}
