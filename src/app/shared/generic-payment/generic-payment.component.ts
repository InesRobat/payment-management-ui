import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { CountriesNowService } from '../../services/country-now.service';
import { PaymentService } from '../../services/payment.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-generic-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './generic-payment.component.html',
  styleUrl: './generic-payment.component.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericPaymentComponent implements OnInit {
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() set paymentData(data: any) {
    if (data) {
      this._paymentData = data;
    }
  }

  @Input() imageUrl: string = '';

  get paymentData(): any {
    return this._paymentData;
  }

  _paymentData: any = null;

  paymentForm!: FormGroup;
  countries: any[] = [];
  filteredCountries: any[] = [];
  filteredStates: any[] = [];
  filteredCities: any[] = [];
  currentCountry?: string;
  positions: any[] = [];
  fileName: string = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private countriesNowService: CountriesNowService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      payee_first_name: ['', Validators.required],
      payee_last_name: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      currency: ['', Validators.required],
      payee_due_date: ['', Validators.required],
      payee_payment_status: ['pending', Validators.required],
      due_amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    });

    if (this.paymentData) {
      console.log(this.paymentData, 'DATA')
      this.loadCountryPositions();
    }
  }

  private populateForm(): void {
    if (this.paymentForm && this.paymentData) {
      this.paymentForm.patchValue(this.paymentData);

      if (this.positions && this.positions.length) {
        console.log('Positions available in populateForm:', this.positions);
        const country = this.paymentData.payee_country || this.paymentData.country;


        console.log(country, 'COUN', this.paymentData)
        const countryObj = this.positions.find(position => position.iso2 === country);
        console.log('Country found by ISO code:', countryObj);

        if (countryObj) {
          console.log('Country found by ISO code:', countryObj.name);
          // Update the form with the country name
          this.paymentForm.patchValue({
            country: countryObj.name
          });
        }
      }

      if (this.paymentData?.payee_payment_status === 'overdue') {
        this.paymentForm.patchValue({
          payee_payment_status: 'overdue'
        });
      }
    }
  }

  loadCountries(): void {
    this.countriesNowService.getCountries().subscribe((data: any) => {
      this.countries = data.data;
      this.filteredCountries = [...this.countries];
    });
  }

  loadCountryPositions(): void {
    this.countriesNowService.getCountryByPosition().subscribe(
      (data: any) => {
        this.positions = [...data.data];
        console.log('Positions loaded:', this.positions);

        this.populateForm();
      },
      (error) => {
        console.error('Error loading country positions:', error);
      }
    );
  }


  onCountryInput(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredCountries = this.countries.filter((country) =>
      country.country.toLowerCase().includes(query)
    );
  }

  onCountrySelected(event: any): void {
    const selectedCountry = event.option.value;
    this.currentCountry = selectedCountry.country;

    this.paymentForm.patchValue({
      country: selectedCountry,
      state: '',
      city: ''
    });

    this.countriesNowService.getStates(selectedCountry.country).subscribe((data: any) => {
      this.filteredStates = data.data.states;
    });

    this.countriesNowService.getCurrency(selectedCountry.country).subscribe((data: any) => {
      const currency = data.data.currency;
      this.paymentForm.patchValue({ currency: currency });
    });
  }

  onStateInput(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredStates = this.filteredStates.filter((state) =>
      state.name.toLowerCase().includes(query)
    );
  }

  onStateSelected(event: any): void {
    const selectedState = event.option.value;
    this.paymentForm.patchValue({ state: selectedState, city: '' });

    this.countriesNowService.getCities(this.currentCountry!, selectedState).subscribe((data: any) => {
      this.filteredCities = data.data;
    });
  }

  onCityInput(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredCities = this.filteredCities.filter((city) =>
      city.name.toLowerCase().includes(query)
    );
  }

  displayCountry(country: any): string {
    return country ? country.country : '';
  }

  displayState(state: any): string {
    return state ? state : '';
  }

  displayCity(city: any): string {
    return city ? city : '';
  }

  onStatusChange(): void {
    console.log('Status changed to:', this.paymentForm.get('payee_payment_status')?.value);
    if (this.paymentForm.get('payee_payment_status')?.value === 'completed' && !this.paymentData?.evidence_file_id) {
      const statusControl = this.paymentForm.get('payee_payment_status');
      statusControl?.setErrors({ 'evidenceRequired': true });   // Set the custom error
      statusControl?.markAsDirty();   // Mark the control as dirty
      statusControl?.markAsTouched(); // Mark the control as touched
      this.cdr.detectChanges();
    }
  }

  uploadEvidence(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.fileName = file.name;

      this.paymentService.uploadEvidence(this.route.snapshot.params['id'], file).subscribe({
        next: (response: any) => {
          const evidenceFileId = response.file_id;
          this.paymentData.evidence_file_id = evidenceFileId;
          this.paymentForm.get('payee_payment_status')?.setValue('completed');
        },
        error: (err) => {
          console.error('Error uploading evidence', err);
        },
      });
    }
  }

  downloadEvidence(evidenceFileId: string): void {
    this.paymentService.downloadEvidence(evidenceFileId).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'evidence-file';
        link.click();
      },
      error: (err) => {
        console.error('Error downloading evidence', err);
      },
    });
  }
  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formData = {
        ...this.paymentForm.value,
        payee_added_date_utc: new Date().toISOString(),
        ...(this.paymentData?.evidence_file_id ? { evidence_file_id: this.paymentData.evidence_file_id } : {})
      };


      console.log(formData, 'FORMDATA');

      const submitObservable = this.mode === 'edit'
        ? this.paymentService.updatePayment(this.route.snapshot.params['id'], formData)
        : this.paymentService.createPayment(formData);

      submitObservable.subscribe(
        (response) => {
          console.log(response)
          this.dialog.open(SuccessDialogComponent);
        },
        (error) => {
          console.log(error)
          this.dialog.open(ErrorDialogComponent);
        }
      );
    }
  }
}