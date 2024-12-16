import { PaymentManagementComponent } from './payment-management/payment-management.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
        data: { animation: 'Home' }
    },
    {
        path: 'payment',
        loadComponent: () => import('./payment-management/payment-management.component').then(m => m.PaymentManagementComponent),
        data: { animation: 'Payment' }
    },
    {
        path: 'payment/:id',
        loadComponent: () => import('./payment-management/components/payment-detail/payment-detail.component').then(m => m.PaymentDetailComponent),
        data: { animation: 'Payment' }
    },
    {
        path: 'add-payment',
        loadComponent: () => import('./payment-management/components/add-payment/add-payment.component').then(m => m.AddPaymentComponent),
        data: { animation: 'Payment' }
    },
    {
        path: 'edit-payment/:id',
        loadComponent: () => import('./payment-management/components/edit-payment/edit-payment.component').then(m => m.EditPaymentComponent),
        data: { animation: 'Payment' }
    }
];
