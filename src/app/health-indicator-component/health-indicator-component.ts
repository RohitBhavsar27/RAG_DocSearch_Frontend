import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { RagApiService } from '../services/api-service'; // adjust path if needed
import { interval, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Status = 'online' | 'degraded' | 'offline';
@Component({
  selector: 'app-health-indicator-component',
  imports: [],
  templateUrl: './health-indicator-component.html',
  styleUrl: './health-indicator-component.css'
})
export class HealthIndicatorComponent {
    private api = inject(RagApiService);
    private cdr = inject(ChangeDetectorRef);

    status: Status = 'offline';
    ms: number | null = null;
    tooltip = 'Checking…';

    constructor() {
        // Ping every 30s, and immediately on mount
        interval(30_000).pipe(
            startWith(0),
            switchMap(() => {
                const t0 = performance.now();
                return this.api.health().pipe(
                    map(() => ({ ok: true, ms: Math.round(performance.now() - t0) })),
                    catchError(() => of({ ok: false, ms: null }))
                );
            }),
            takeUntilDestroyed()
        ).subscribe(({ ok, ms }) => {
            this.ms = ms;
            if (!ok) {
                this.status = 'offline';
                this.tooltip = 'Backend unreachable';
            } else if (ms! <= 400) {
                this.status = 'online';
                this.tooltip = `Healthy • ${ms} ms`;
            } else if (ms! <= 1200) {
                this.status = 'degraded';
                this.tooltip = `Slow • ${ms} ms`;
            } else {
                this.status = 'offline';
                this.tooltip = `Timeout / very slow`;
            }
            this.cdr.markForCheck();
        });
    }
}