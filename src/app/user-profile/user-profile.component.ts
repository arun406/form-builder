import { Component } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true
})
export class UserProfileComponent {
  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onProfileClick(): void {
    console.log('Profile clicked');
    this.isDropdownOpen = false;
  }

  onSettingsClick(): void {
    console.log('Settings clicked');
    this.isDropdownOpen = false;
  }

  onLogoutClick(): void {
    console.log('Logout clicked');
    this.isDropdownOpen = false;
  }
}
