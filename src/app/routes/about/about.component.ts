import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  socialLinks = {
    github: 'https://github.com/DavitImn',
    facebook: 'https://www.facebook.com/datoimna3/',
    linkedin: 'https://www.linkedin.com/in/davit-imnadze-848171327/'
  };

  contactInfo = {
    phone: '+995 555 555 555',
    email: 'Contact@gmail.com'
  };

  features = [
    {
      icon: 'fa-gavel',
      title: 'Live Auctions',
      description: 'Participate in real-time auctions with live bidding and instant updates.'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Transactions',
      description: 'Your transactions are protected with state-of-the-art security measures.'
    },
    {
      icon: 'fa-clock',
      title: '24/7 Support',
      description: 'Our support team is available around the clock to assist you.'
    },
    {
      icon: 'fa-chart-line',
      title: 'Market Insights',
      description: 'Access detailed market analytics and price trends.'
    }
  ];
}
