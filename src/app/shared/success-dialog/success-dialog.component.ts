import { ChangeDetectionStrategy, Component, Inject, type OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './success-dialog.component.html',
  styleUrl: './success-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessDialogComponent {

  constructor(
    @Inject(Router) private router: Router
  ) { }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
