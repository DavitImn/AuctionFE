import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-button" (click)="close.emit()">×</button>
        <img [src]="imageUrl" [alt]="altText" class="modal-image">
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 8px;
      overflow: hidden;
    }

    .modal-image {
      display: block;
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }

    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class ImageModalComponent {
  @Input() imageUrl: string = '';
  @Input() altText: string = '';
  @Output() close = new EventEmitter<void>();
} 