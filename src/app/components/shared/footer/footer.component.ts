import { DatePipe } from '@angular/common';
import { Component, effect, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [DatePipe],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  now = signal(new Date());

  constructor() {
    effect(() => {
      const interval = setInterval(() => {
        this.now.set(new Date());
      }, 1000);

      return () => clearInterval(interval);
    });
  }
}
