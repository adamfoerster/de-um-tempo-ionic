import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  loginForm = {
    email: '',
    password: ''
  };

  constructor(public service: ServiceService) { }

  ngOnInit() {
  }

  post() {
    if (!this.loginForm.email || !this.loginForm.password) {
      return false;
    }
    this.service.register(this.loginForm.email, this.loginForm.password);
  }

}
