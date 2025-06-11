import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// rame

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <h2>ავტორიზაცია საჭიროა</h2>
        <p>ბიდის დასადებად გთხოვთ გაიაროთ ავტორიზაცია ან რეგისტრაცია</p>
        <div class="dialog-buttons">
          <button class="login-btn" (click)="login()">შესვლა</button>
          <button class="register-btn" (click)="register()">რეგისტრაცია</button>
        </div>
        <button class="close-btn" (click)="close()">✕</button>
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
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      padding: 30px;
      border-radius: 15px;
      width: 90%;
      max-width: 400px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    h2 {
      margin: 0 0 15px;
      color: #2d3748;
      font-size: 24px;
    }

    p {
      margin: 0 0 25px;
      color: #4a5568;
      font-size: 16px;
      line-height: 1.5;
    }

    .dialog-buttons {
      display: flex;
      gap: 15px;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .login-btn {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white;
      flex: 1;
    }

    .login-btn:hover {
      background: linear-gradient(135deg, #6d28d9, #5b21b6);
      transform: translateY(-1px);
    }

    .register-btn {
      background: white;
      color: #7c3aed;
      border: 2px solid #7c3aed;
      flex: 1;
    }

    .register-btn:hover {
      background: #f8f7ff;
      transform: translateY(-1px);
    }

    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      padding: 5px;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: #2d3748;
    }
  `]
})
export class AuthDialogComponent {
  @Output() closeEvent = new EventEmitter<void>();

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/login']);
    this.close();
  }

  register() {
    this.router.navigate(['/register']);
    this.close();
  }

  close() {
    this.closeEvent.emit();
  }
} 