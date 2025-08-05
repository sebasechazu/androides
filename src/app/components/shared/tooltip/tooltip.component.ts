import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <!-- Ícono trigger -->
      <div 
        class="tooltip-trigger w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-help text-sm font-bold hover:bg-blue-600 transition-colors"
        [class]="triggerClass"
        [class.active]="isVisible"
        (click)="toggleTooltip($event)">
        {{ triggerText }}
      </div>
      
      <!-- Tooltip flotante -->
      <div 
        class="tooltip-content absolute top-full left-1/2 mt-2 px-4 py-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-[9999]"
        [class]="tooltipClass"
        [class.show]="isVisible"
        [style.width]="width"
        style="transform: translateX(-50%)">
        
        <ng-content></ng-content>
        
        <!-- Flecha del tooltip -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
      </div>
    </div>
  `,
  styles: [`
    /* Estado inicial del tooltip */
    .tooltip-content {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
      transform: translateX(-50%) translateY(-4px);
    }

    /* Mostrar tooltip con clase show (para móvil) */
    .tooltip-content.show {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0px);
    }

    /* Estado activo del trigger */
    .tooltip-trigger.active {
      background-color: #1d4ed8; /* bg-blue-700 */
    }

    /* Solo mostrar hover en dispositivos que lo soporten */
    @media (hover: hover) and (pointer: fine) {
      /* Mostrar tooltip al hacer hover en escritorio */
      .tooltip-trigger:hover + .tooltip-content,
      .tooltip-content:hover {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0px);
      }
    }

    @media (max-width: 640px) {
      .tooltip-content {
        width: 250px !important;
      }
    }
  `]
})
export class TooltipComponent {
  @Input() triggerText: string = '?';
  @Input() triggerClass: string = '';
  @Input() tooltipClass: string = '';
  @Input() width: string = '16rem'; // 256px por defecto (w-64)

  isVisible = false;

  constructor(private elementRef: ElementRef) {}

  toggleTooltip(event: Event) {
    event.stopPropagation();
    this.isVisible = !this.isVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Cerrar tooltip si se hace click fuera del componente
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isVisible = false;
    }
  }
}
