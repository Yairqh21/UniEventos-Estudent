import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit, OnDestroy {
  public currentPath = '';
  private destroy$ = new Subject<void>();

  public readonly menuItems: MenuItem[] = [
    { title: 'Inicio', url: '/main/home', icon: 'home' },
    { title: 'Eventos', url: '/main/events', icon: 'calendar' },
    { title: 'Historial', url: '/main/history', icon: 'list' },
    { title: 'Perfil', url: '/main/profile', icon: 'person' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.setupRouterListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login/auth']);
  }

  private setupRouterListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.url;
      });
  }
}
