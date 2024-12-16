import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenericPaymentComponent } from '../../../shared/generic-payment/generic-payment.component';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    GenericPaymentComponent
  ],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailComponent implements OnInit {

  paymentData = signal<any>(null);

  constructor(
    @Inject(ActivatedRoute) private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const paymentId = params['id'];
      console.log('Payment ID:', paymentId);

      const payment = this.getPaymentData(paymentId);
      console.log('Payment Data:', payment);
      this.paymentData.set(payment);
    });
  }

  getPaymentData(paymentId: string) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    return payments.find((payment: any) => payment._id === paymentId);
  }
}
