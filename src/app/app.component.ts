import { Component } from '@angular/core';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/shared/footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet, NavbarComponent, FooterComponent]
})
export class AppComponent {
  title = 'Androides App';
}
