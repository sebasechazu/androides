import { Component } from '@angular/core';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/shared/footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, NavbarComponent,FooterComponent] 
})
export class AppComponent {
  title = 'AndroidApp';
}
