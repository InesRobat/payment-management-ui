import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent implements OnInit {

  ngOnInit(): void { }

}
