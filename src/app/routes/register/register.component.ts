import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PopoverModule } from 'ngx-bootstrap/popover';

interface RegisterData {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ValidationErrors {
  userName?: string[];
  email?: string[];
  password?: string[];
  firstName?: string[];
  lastName?: string[];
  userImage?: string[];
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PopoverModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerData: RegisterData = {
    userName: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };

  selectedImage: File | null = null;
  previewUrl: string | null = null;
  validationErrors: ValidationErrors = {};
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showForm: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.validationErrors.userImage = ['Please select an image file'];
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.validationErrors.userImage = ['Image size should not exceed 5MB'];
        return;
      }

      this.selectedImage = file;
      // Clear validation errors when valid image is selected
      if (this.validationErrors.userImage) {
        delete this.validationErrors.userImage;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  validateField(field: string, value: string): string[] {
    const errors: string[] = [];
    
    switch (field) {
      case 'userName':
        if (!value) errors.push('Username is required.');
        else if (value.length < 6) errors.push('Username must be at least 6 characters.');
        break;
      case 'password':
        if (!value) errors.push('Password is required.');
        else {
          if (value.length < 6) errors.push('Password must be at least 6 characters.');
          if (!/[A-Z]/.test(value)) errors.push('Password must contain at least one uppercase letter.');
          if (!/[a-z]/.test(value)) errors.push('Password must contain at least one lowercase letter.');
          if (!/[^a-zA-Z0-9]/.test(value)) errors.push('Password must contain at least one special character.');
        }
        break;
      case 'email':
        if (!value) errors.push('Email is required.');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push('Invalid email address format.');
        break;
      case 'firstName':
        if (!value) errors.push('First name is required.');
        break;
      case 'lastName':
        if (!value) errors.push('Last name is required.');
        break;
    }
    
    return errors;
  }

  validateForm(): boolean {
    let isValid = true;

    if (!this.selectedImage) {
      this.validationErrors.userImage = ['Profile image is required'];
      isValid = false;
    }

    return isValid;
  }

  private parseValidationMessage(msg: string): { field: string, message: string } | null {
    // Map of keywords to field names
    const fieldMap: { [key: string]: string } = {
      'Username': 'userName',
      'Password': 'password',
      'Email': 'email',
      'First name': 'firstName',
      'Last name': 'lastName'
    };

    // Try to determine which field this message belongs to
    for (const [keyword, fieldName] of Object.entries(fieldMap)) {
      if (msg.toLowerCase().includes(keyword.toLowerCase())) {
        // Extract the full message after the field name
        const messageStart = msg.indexOf(':');
        const message = messageStart !== -1 ? msg.substring(messageStart + 1).trim() : msg.trim();
        return { field: fieldName, message: message };
      }
    }
    return null;
  }

  private parseValidationErrors(error: HttpErrorResponse): void {
    if (error.error && typeof error.error === 'string') {
      try {
        const errorMessage = error.error;
        if (errorMessage.includes('FluentValidation.ValidationException')) {
          const validationMessages = errorMessage.match(/[A-Z][^.!?]*[.!?]/g) || [];
          
          // Clear previous validation errors
          this.validationErrors = {};
          
          validationMessages.forEach(message => {
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('username')) {
              if (!this.validationErrors.userName) this.validationErrors.userName = [];
              this.validationErrors.userName.push(message.trim());
            }
            else if (lowerMessage.includes('password')) {
              if (!this.validationErrors.password) this.validationErrors.password = [];
              this.validationErrors.password.push(message.trim());
            }
            else if (lowerMessage.includes('email')) {
              if (!this.validationErrors.email) this.validationErrors.email = [];
              this.validationErrors.email.push(message.trim());
            }
            else if (lowerMessage.includes('first name')) {
              if (!this.validationErrors.firstName) this.validationErrors.firstName = [];
              this.validationErrors.firstName.push(message.trim());
            }
            else if (lowerMessage.includes('last name')) {
              if (!this.validationErrors.lastName) this.validationErrors.lastName = [];
              this.validationErrors.lastName.push(message.trim());
            }
          });
        }
      } catch (e) {
        console.error('Error parsing validation messages:', e);
        this.errorMessage = 'An error occurred while processing the response.';
      }
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;

    // Clear previous messages and errors
    this.successMessage = '';
    this.errorMessage = '';
    this.validationErrors = {};

    // Validate all fields before submission
    let hasErrors = false;
    Object.keys(this.registerData).forEach(key => {
      const errors = this.validateField(key, this.registerData[key as keyof typeof this.registerData]);
      if (errors.length > 0) {
        this.validationErrors[key as keyof ValidationErrors] = errors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('UserName', this.registerData.userName);
    formData.append('Email', this.registerData.email);
    formData.append('Password', this.registerData.password);
    formData.append('FirstName', this.registerData.firstName);
    formData.append('LastName', this.registerData.lastName);
    
    if (this.selectedImage) {
      formData.append('UserImage', this.selectedImage);
    }

    // Store email before making the request
    const registeredEmail = this.registerData.email;

    this.http
      .post(`${this.apiService.publicUrl}/api/Auth/register`, formData, { responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          console.log('Registration response:', response);
          this.isLoading = false;

          if (response === 'Registered') {
            console.log('Registration successful, preparing to redirect...');
            this.successMessage = 'Registration successful! Redirecting to verification page...';
            this.validationErrors = {};
            this.errorMessage = '';
            
            // Force UI update
            this.cdr.detectChanges();

            // Navigate to verify page
            setTimeout(() => {
              console.log('Navigating to verify-email with email:', registeredEmail);
              this.router.navigate(['/verify-email'], {
                queryParams: { email: registeredEmail }
              }).then(() => {
                console.log('Navigation successful');
              }).catch(err => {
                console.error('Navigation failed:', err);
                this.errorMessage = 'Failed to navigate to verification page. Please try manually.';
                this.cdr.detectChanges();
              });
            }, 2000);
          } else {
            console.error('Unexpected response:', response);
            this.errorMessage = 'Unexpected response from server. Please try again.';
            this.cdr.detectChanges();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          this.isLoading = false;

          if (error.status === 500 && error.error && typeof error.error === 'string' && 
              error.error.includes('FluentValidation.ValidationException')) {
            this.parseValidationErrors(error);
          } else if (error.status === 400) {
            if (error.error && typeof error.error === 'string') {
              if (error.error.includes('User already exists')) {
                this.errorMessage = 'A user with this email already exists.';
                this.validationErrors.email = ['A user with this email already exists.'];
              } else {
                this.errorMessage = error.error;
              }
            }
          } else {
            this.errorMessage = 'An error occurred during registration. Please try again.';
          }
          
          this.cdr.detectChanges();
        }
      });
  }

  private handleStructuredValidationErrors(errors: any) {
    if (errors.errors) {
      Object.keys(errors.errors).forEach(key => {
        const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
        this.validationErrors[fieldName as keyof ValidationErrors] = errors.errors[key];
      });
    }
  }

  onInputChange(field: keyof ValidationErrors): void {
    // Validate the field as user types
    const value = this.registerData[field as keyof typeof this.registerData];
    const errors = this.validateField(field, value);
    
    if (errors.length > 0) {
      this.validationErrors[field] = errors;
    } else {
      delete this.validationErrors[field];
    }

    // Clear general error message
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onInputBlur(field: keyof ValidationErrors): void {
    // Optional: Add any blur handling logic here
  }
}
