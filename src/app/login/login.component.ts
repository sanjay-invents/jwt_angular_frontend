import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../service/authentication.service";
import {NotificationService} from "../service/notification.service";
import {User} from "../model/user";
import {HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {NotificationType} from "../enum/notification-type.enum";
import {HeaderType} from "../enum/header-type.enum";
import {SubSink} from "subsink";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  public showLoading: boolean = false;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  public onLogin(user: User): void {
    this.showLoading = true;
    this.subs.add(
      this.authenticationService
        .login(user)
        .subscribe(
          (response: HttpResponse<User>) => {
            const token: string | null = response.headers.get(HeaderType.JWT_TOKEN);
            this.authenticationService.saveToken(token);
            this.authenticationService.addUserToLocalCache(response.body);
            this.router.navigateByUrl('/user/management');
            this.showLoading = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message)
            this.showLoading = false;
          }
        )
    );
  }

  private sendErrorNotification(notificationType: NotificationType, message: string): void {
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
