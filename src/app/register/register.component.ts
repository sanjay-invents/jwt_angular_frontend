import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../service/authentication.service";
import {NotificationService} from "../service/notification.service";
import {User} from "../model/user";
import {HttpErrorResponse} from "@angular/common/http";
import {NotificationType} from "../enum/notification-type.enum";
import {SubSink} from "subsink";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy{
  private subs = new SubSink();
  public showLoading: boolean = false;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
  }

  public onRegister(user: User): void {
    this.showLoading = true;
    this.subs.add(
      this.authenticationService
        .register(user)
        .subscribe(
          (response: User) => {
            this.showLoading = false;
            this.sendNotification(NotificationType.SUCCESS, `A new account was created for ${response.firstName}.
            Please check you email for password to log in.`);
          },
          (errorResponse: HttpErrorResponse) => {
            this.sendNotification(NotificationType.ERROR, errorResponse.error.message)
            this.showLoading = false;
          }
        )
    );
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
