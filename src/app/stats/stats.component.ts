import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentService } from '../services/payment.service';
import { StatsChartComponent } from './components/stats-chart/stats-chart.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [StatsChartComponent],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {

  stats = toSignal(this.paymentService.getStats())

  constructor(
    @Inject(PaymentService) private paymentService: PaymentService
  ) { }
}

