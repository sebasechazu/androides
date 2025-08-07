import { Component, Input, signal, DestroyRef, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cronometro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cronometro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CronometroComponent implements OnInit, OnChanges {
  @Input() running: boolean = true;
  @Input() initialTime: number = 0;
  time = signal<number>(0);
  private intervalId: number | null = null;
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.time.set(this.initialTime);
    if (this.running) {
      this.start();
    }
    this.destroyRef.onDestroy(() => this.stop());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['running']) {
      if (changes['running'].currentValue) {
        this.start();
      } else {
        this.stop();
      }
    }
    if (changes['initialTime']) {
      this.time.set(this.initialTime);
    }
  }

  start() {
    this.stop();
    this.intervalId = window.setInterval(() => {
      this.time.update(t => t + 1);
    }, 1000);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.time.set(0);
  }

  formattedTime(): string {
    const t = this.time();
    const min = Math.floor(t / 60).toString().padStart(2, '0');
    const sec = (t % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }
}
