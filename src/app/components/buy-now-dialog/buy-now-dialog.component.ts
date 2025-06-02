import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buy-now-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay">
      <div class="dialog-container">
        <div class="dialog-header">
          <h2>დაადასტურეთ შესყიდვა</h2>
          <button class="close-btn" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="dialog-content">
          <div class="item-info">
            <h3>{{itemTitle}}</h3>
            <div class="price">ფასი: {{price}}₾</div>
          </div>
          
          <div class="confirmation-text">
            გსურთ ამ ნივთის ყიდვა მითითებულ ფასად?
          </div>

          <div class="dialog-actions">
            <button class="cancel-btn" (click)="onClose()">გაუქმება</button>
            <button class="confirm-btn" (click)="onConfirm()">
              <i class="fas fa-shopping-cart"></i>
              დადასტურება
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease;
    }

    .dialog-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dialog-header h2 {
      margin: 0;
      color: #2d3748;
      font-size: 24px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      color: #718096;
      cursor: pointer;
      padding: 5px;
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: #2d3748;
    }

    .dialog-content {
      padding: 20px;
    }

    .item-info {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .item-info h3 {
      margin: 0 0 10px 0;
      color: #2d3748;
      font-size: 18px;
    }

    .price {
      font-size: 24px;
      color: #2196F3;
      font-weight: 600;
    }

    .confirmation-text {
      text-align: center;
      font-size: 18px;
      color: #4a5568;
      margin: 20px 0;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .cancel-btn, .confirm-btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cancel-btn {
      background: #e2e8f0;
      color: #4a5568;
      border: none;
    }

    .cancel-btn:hover {
      background: #cbd5e0;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #2196F3, #1976D2);
      color: white;
      border: none;
      box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
    }

    .confirm-btn:hover {
      background: linear-gradient(135deg, #1976D2, #1565C0);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(33, 150, 243, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class BuyNowDialogComponent {
  @Input() itemTitle: string = '';
  @Input() price: number = 0;
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onClose() {
    this.close.emit();
  }
} 