import { Component, Input, ElementRef, signal, effect } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  animations: [
    trigger('tooltipAnim', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-50%) translateY(-4px)', pointerEvents: 'none', visibility: 'hidden' })),
      state('visible', style({ opacity: 1, transform: 'translateX(-50%) translateY(0)', pointerEvents: 'auto', visibility: 'visible' })),
      transition('hidden <=> visible', [
        animate('250ms cubic-bezier(0.4,0,0.2,1)')
      ])
    ])
  ]
})
export class TooltipComponent {
  @Input({ required: true }) triggerText!: string;
  @Input() triggerClass: string = '';
  @Input() tooltipClass: string = '';
  @Input() width: string = '16rem';

  readonly isVisible = signal(false);

  constructor(private elementRef: ElementRef) {
    effect(() => {
      const handler = (event: Event) => {
        if (!this.elementRef.nativeElement.contains(event.target)) {
          this.isVisible.set(false);
        }
      };
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    });
  }

  toggleTooltip(event: Event) {
    event.stopPropagation();
    this.isVisible.update(v => !v);
  }
}
