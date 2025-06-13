import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  socialLinks = {
    github: 'https://github.com/DavitImn',
    facebook: 'https://www.facebook.com/datoimna3/',
    linkedin: 'https://www.linkedin.com/in/davit-imnadze-848171327/'
  };

  contactInfo = {
    phone: '+995 555 555 555',
    email: 'Contact@gmail.com'
  };
}
