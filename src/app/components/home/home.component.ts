import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.component.html',
    animations: [
        // Animación para fade in con escala
        trigger('fadeInScale', [
            transition(':enter', [
                style({ transform: 'scale(0.8)', opacity: 0 }),
                animate('600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
                    style({ transform: 'scale(1)', opacity: 1 }))
            ])
        ]),
        // Animación para slide in desde abajo
        trigger('slideInUp', [
            transition(':enter', [
                style({ transform: 'translateY(30px)', opacity: 0 }),
                animate('600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
                    style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ]),
        
        // Animación para el contenedor de juegos con stagger
        trigger('gamesContainer', [
            transition(':enter', [
                query('.group', [
                    style({ transform: 'translateY(50px) scale(0.9)', opacity: 0 }),
                    stagger(150, [
                        animate('700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
                            style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
                    ])
                ], { optional: true })
            ])
        ])
    ]
})
export class HomeComponent { }
