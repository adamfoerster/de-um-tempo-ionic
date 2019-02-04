import { ServiceService } from './service.service';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: [
    `.color-medium { color: #fff; }`
  ]
})
export class AppComponent implements OnInit {
  public appPages = [
    {
      title: 'Timeline',
      url: '/timeline',
      icon: 'home'
    },
    {
      title: 'Bíblia',
      url: '/bible',
      icon: 'book'
    },
    {
      title: 'Passagens',
      url: '/passages',
      icon: 'list-box'
    }
  ];
  user: Observable<any>;
  isAdmin = false;

  constructor(
    public alert: AlertController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public service: ServiceService,
    private swUpdate: SwUpdate
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.swUpdate.available.subscribe(_ => {
      this.alert
        .create({
          message: 'Existe uma versão mais nova deste APP',
          backdropDismiss: false,
          buttons: [
            {
              text: 'Atualizar',
              handler: () => {
                window.location.reload();
              }
            }
          ]
        })
        .then(alert => alert.present());
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.user = this.service.user.pipe(
        tap(user => {
          if (!user) {
            return null;
          }
          this.service
            .isAdmin(user.email)
            .subscribe(isadm => (this.isAdmin = !!isadm));
        })
      );
    });
  }

  login() {
    this.service.login();
  }

  logout() {
    this.service.logout();
  }
}
