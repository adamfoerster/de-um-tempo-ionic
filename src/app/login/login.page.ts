import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm = {
    email: '',
    password: ''
  };

  constructor(public service: ServiceService) { }

  ngOnInit() {
  }

  post() {
    if (!this.loginForm.email || !this.loginForm.password) {
      return null;
    }
    this.service.login(this.loginForm.email, this.loginForm.password);
  }

}
