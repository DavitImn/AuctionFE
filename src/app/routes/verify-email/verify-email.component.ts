import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="text-center mb-4">Email Verification</h2>
              
              <!-- Success Message -->
              <div *ngIf="successMessage" class="alert alert-success mb-3">
                <i class="fas fa-check-circle me-2"></i>
                {{ successMessage }}
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage" class="alert alert-danger mb-3">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ errorMessage }}
              </div>

              <div *ngIf="!successMessage">
                <p class="text-center mb-4">
                  Please enter the verification code sent to<br>
                  <strong>{{ email }}</strong>
                </p>

                <form (ngSubmit)="onSubmit()" #verifyForm="ngForm">
                  <div class="mb-3">
                    <label for="verifyCode" class="form-label">Verification Code</label>
                    <input
                      type="text"
                      class="form-control form-control-lg text-center"
                      id="verifyCode"
                      name="verifyCode"
                      [(ngModel)]="verifyCode"
                      required
                      pattern="[0-9]*"
                      maxlength="4"
                      [class.is-invalid]="errorMessage"
                      placeholder="Enter 4-digit code"
                    >
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100"
                    [disabled]="!verifyForm.valid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Verifying...' : 'Verify Email' }}
                  </button>
                </form>
              </div>

              <!-- Success state -->
              <div *ngIf="successMessage" class="text-center">
                <p>You will be redirected to login page in {{ redirectCountdown }} seconds...</p>
                <button class="btn btn-link" (click)="redirectToLogin()">
                  Click here to login now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-control-lg {
      font-size: 1.5rem;
      letter-spacing: 0.5rem;
    }
    .alert {
      display: flex;
      align-items: center;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
    }
    .alert-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    .alert-danger {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
    .alert i {
      margin-right: 0.5rem;
      font-size: 1.1em;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  verifyCode: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  redirectCountdown: number = 5;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.errorMessage = 'No email address provided. Please try registering again.';
      }
    });
  }

  onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';

    // Ensure verifyCode is a number
    const numericCode = parseInt(this.verifyCode, 10);
    if (isNaN(numericCode)) {
      this.errorMessage = 'Please enter a valid numeric code';
      this.isLoading = false;
      return;
    }

    this.http.post(`${this.apiService.publicUrl}/api/Auth/verify`, null, {
      params: {
        email: this.email,
        verifyCode: numericCode
      }
    }).subscribe({
      next: (response: any) => {
        console.log('Verification successful:', response);
        this.isLoading = false;
        this.successMessage = 'Email verified successfully! Redirecting to login...';
        this.startRedirectCountdown();
      },
      error: (error) => {
        console.error('Verification error:', error);
        this.isLoading = false;
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'An error occurred during verification. Please try again.';
        }
      }
    });
  }

  private startRedirectCountdown() {
    this.redirectCountdown = 5;
    this.countdownInterval = setInterval(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown <= 0) {
        this.redirectToLogin();
      }
    }, 1000);
  }

  redirectToLogin() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
} 