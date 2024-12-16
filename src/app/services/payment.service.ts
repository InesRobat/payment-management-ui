// src/app/services/payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getPayments(search: string, page: number, pageSize: number) {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<any>(`${this.apiUrl}/get-payments`, { params });
  }

  // Get a single payment by ID
  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/get-payment/${id}`);
  }

  // Update payment details
  updatePayment(paymentId: string, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/update-payment/${paymentId}`, payment);
  }

  // Delete a payment by ID
  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-payment/${id}`);
  }

  // Create a new payment
  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/create-payment`, payment);
  }

  // Upload evidence for a payment
  uploadEvidence(paymentId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload-evidence/${paymentId}`, formData);
  }

  // Download evidence for a payment
  downloadEvidence(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-evidence/${paymentId}`, { responseType: 'blob' });
  }

  // Get payment stats
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  // getPaymentStatusStats(): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/payment-status-stats`);
  // }

  // getPaymentCurrencyStats(): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/payment-currency-stats`);
  // }

  // getPaymentCountryStats(): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/payment-country-stats`);
  // }

}
