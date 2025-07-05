import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  /**
  * Checks the device is a mobile device (iPhone or Android phone)
  */
  public isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    return (/iphone|ipod/.test(userAgent) || /android/.test(userAgent));
  }
}