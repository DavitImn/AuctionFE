import { Routes } from '@angular/router';
import { HomeComponent } from './routes/home/home.component';
import { AboutComponent } from './routes/about/about.component';
import { ProfileComponent } from './routes/profile/profile.component';
import { AuctionDetailsComponent } from './routes/auction-details/auction-details.component';
import { LoginComponent } from './routes/login/login.component';
import { RegisterComponent } from './routes/register/register.component';
import { VerifyEmailComponent } from './routes/verify-email/verify-email.component';
import { SearchComponent } from './routes/search/search.component';

export const routes: Routes = [
     { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'details/:id', component: AuctionDetailsComponent },
    { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'search', component: SearchComponent }
  //ASDBCX
];
