import { Component, Inject, OnInit, signal } from '@angular/core';
import { GenericPaymentComponent } from '../../../shared/generic-payment/generic-payment.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-payment',
  standalone: true,
  imports: [
    GenericPaymentComponent
  ],
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.scss']
})
export class EditPaymentComponent implements OnInit {

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
