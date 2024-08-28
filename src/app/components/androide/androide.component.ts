import { Component, OnInit } from '@angular/core';
import { Androide } from '../../interface/androide';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AndroidesService } from '../../service/androides.service';
import { UpperCasePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-androide',
  templateUrl: './androide.component.html',
  styleUrls: ['./androide.component.css'],
  standalone: true,
  imports: [RouterLink, UpperCasePipe, TableModule, CardModule, ButtonModule]
})
export class AndroideComponent implements OnInit {

  androide: Androide | undefined;

  constructor(private activatedRouted: ActivatedRoute, private _androidesService: AndroidesService) {
    this.activatedRouted.params.subscribe(params => {
      this.androide = this._androidesService.getAndroideXId(params['id'])
    })
  }
  ngOnInit() {
  }

}
