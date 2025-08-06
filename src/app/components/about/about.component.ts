import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about.component.html',
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(30px)' }),
                animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('slideInLeft', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(-50px)' }),
                animate('500ms 200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
        ]),
        trigger('slideInRight', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(50px)' }),
                animate('500ms 300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
        ]),
        trigger('staggerCards', [
            transition(':enter', [
                query('.card-item', [
                    style({ opacity: 0, transform: 'translateY(20px)' }),
                    stagger(100, [
                        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ], { optional: true })
            ])
        ]),
        trigger('scaleIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class AboutComponent {
    habilidadesLenguajes = [
        'TypeScript',
        'JavaScript',
        'Git',
        'C#',
        'HTML',
        'CSS'
    ];

    frameworks = [
        'Angular',
        'Ionic',
        'Tailwind CSS',
        'Angular Material',
        'PrimeNG',
        'React'
    ];
}
