import { Component, OnInit,ApplicationRef } from '@angular/core';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

import { user_types } from '../../models/user_types';
import { users } from '../../models/users';
import { userService } from '../../service/user.service';
import { Authentication } from '../../config/authentication';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [userService,Authentication]
})
export class LoginComponent implements OnInit {
  person: users
  constructor(
    private userService : userService
  ) {}

  ngOnInit() {
    this.person = new users();
  }

  login() {
    if(this.userService.Login(this.person)){ 
        window.location.reload();
    }
  }
}
