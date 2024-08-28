import { Component } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [FieldsetModule],
    standalone: true
})
export class HomeComponent  {

}
