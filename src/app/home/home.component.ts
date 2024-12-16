import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElementRef!: ElementRef;

  constructor(
    @Inject(Router) private router: Router
  ) { }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  ngAfterViewInit(): void {
    this.triggerVideoPlay();
  }

  triggerVideoPlay(): void {
    const videoElement = this.videoElementRef.nativeElement;
    videoElement.muted = true;

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    videoElement.dispatchEvent(clickEvent);
  }
}
