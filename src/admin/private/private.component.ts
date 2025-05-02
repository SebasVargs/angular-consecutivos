import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-private',
  imports: [FormsModule, CommonModule, RouterOutlet, RouterLink],
  templateUrl: './private.component.html',
  styleUrl: './private.component.css'
})
export class PrivateComponent {
  currentUser: any;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }
}
