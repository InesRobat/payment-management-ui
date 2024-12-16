import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GenericPaymentComponent } from '../../../shared/generic-payment/generic-payment.component';

@Component({
  selector: 'app-add-payment',
  standalone: true,
  imports: [
    GenericPaymentComponent
  ],
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentComponent { }