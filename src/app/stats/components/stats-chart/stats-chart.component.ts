import { ChangeDetectionStrategy, Component, Inject, type OnInit } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-stats-chart',
  standalone: true,
  imports: [],
  templateUrl: './stats-chart.component.html',
  styleUrl: './stats-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsChartComponent implements OnInit {

  chart: any;

  constructor(
    @Inject(PaymentService) private paymentService: PaymentService
  ) { }
  ngOnInit(): void {
    // Fetch payment status stats
    // this.paymentService.getPaymentStatusStats().subscribe((data) => {
    //   // this.createPaymentStatusChart(data);
    // });

    // // Fetch payment currency stats
    // this.paymentService.getPaymentCurrencyStats().subscribe((data) => {
    //   // this.createPaymentCurrencyChart(data);
    // });
  }

  // createPaymentStatusChart(data: any): void {
  //   const labels = Object.keys(data.status_counts);
  //   const values = Object.values(data.status_counts);

  //   this.chart = new Chart('paymentStatusChart', {
  //     type: 'pie',
  //     data: {
  //       labels: labels,
  //       datasets: [{
  //         data: values,
  //         backgroundColor: ['#FF9999', '#66B3FF', '#99FF99', '#FFCC99'],
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       plugins: {
  //         legend: {
  //           position: 'top',
  //         },
  //       },
  //     }
  //   });
  // }

  // createPaymentCurrencyChart(data: any): void {
  //   const labels = Object.keys(data.currency_counts);
  //   const values = Object.values(data.currency_counts);

  //   this.chart = new Chart('paymentCurrencyChart', {
  //     type: 'bar',
  //     data: {
  //       labels: labels,
  //       datasets: [{
  //         data: values,
  //         label: 'Number of Payments',
  //         backgroundColor: '#42A5F5',
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       scales: {
  //         x: {
  //           beginAtZero: true
  //         }
  //       }
  //     }
  //   });
  // }
}