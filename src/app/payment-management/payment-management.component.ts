import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaymentService } from './../services/payment.service';
import { Payment } from '../models/payment';
import { ErrorDialogComponent } from '../shared/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    StatsComponent
  ],
  templateUrl: './payment-management.component.html',
  styleUrl: './payment-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentManagementComponent {
  displayedColumns: string[] = ['status', 'payee_due_date', 'name', 'payee_added_date_utc', 'total_due', 'actions'];
  totalPayments = 0;
  pageSize = 10;
  filters: any = {};
  pageIndex = 1;
  payments: WritableSignal<Payment[]> = signal([]);
  searchText: string = '';
  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService
      .getPayments(this.searchText, this.pageIndex, this.pageSize)
      .subscribe(
        (response) => {
          this.payments.set(response.items.payments);
          this.totalPayments = response.total;
        },
        (error) => {
          console.error('Error fetching payments', error);
          this.dialog.open(ErrorDialogComponent);
        }
      );
  }

  searchPayments(): void {
    // this.filters.search = this.filters.search || '';
    console.log(this.filters.search, 'SEARCH')
    this.pageIndex = 0;
    this.loadPayments();
  }

  onPaginateChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.loadPayments();
  }

  viewPayment(id: string): void {
    this.router.navigate([`/payment/${id}`]);
  }

  editPayment(id: string): void {
    this.router.navigate([`/edit-payment/${id}`]);
  }

  deletePayment(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to delete this payment?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.paymentService.deletePayment(id).subscribe({
          next: () => {
            const updatedPayments = this.payments().filter((p: Payment) => p._id !== id);
            this.payments.set(updatedPayments);
          },
          error: () => {
            this.dialog.open(ErrorDialogComponent);
          },
        });
      }
    });
  }

  navigateToAddPayment(): void {
    this.router.navigate(['add-payment']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'overdue':
        return 'mat-warn';
      case 'pending':
        return 'mat-accent';
      case 'completed':
        return 'mat-primary';
      default:
        return 'mat-basic';
    }
  }
}
