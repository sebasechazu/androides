import { Component } from '@angular/core';
// primeNG
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { AccordionModule} from 'primeng/accordion';
import {DividerModule} from 'primeng/divider';


@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
    imports: [FieldsetModule, AvatarModule, AccordionModule, DividerModule],
    standalone: true
})
export class AboutComponent{


}
