import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LazyProgressBar } from '@shared_component/lazy-progress-bar/lazy-progress-bar';
import { TitleService } from '@shared_services/title.service';
import { ToastModule } from 'primeng/toast';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LazyProgressBar, ToastModule],
  template: `
    <p-toast key="globalMessage" />
    <app-lazy-progress-bar />
    <router-outlet />
  `,
})
export class App {
  protected readonly title = signal('RixsFinTrack.Client');
  private translateService = inject(TranslateService);
  private translationsLoaded = false;

  constructor(
    private translate: TranslateService,
    private titleService: TitleService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    const lang = window.localStorage.getItem('lang') || 'en';
    this.setDocumentLanguage(lang);
    this.translateService.use(lang);
    this.translateService.onLangChange.subscribe((event) => {
      this.setDocumentLanguage(event.lang);
    });

    this.translate.use(lang).subscribe({
      next: () => {
        this.translationsLoaded = true;
      },
      error: (error) => {
        console.error('Failed to load translations:', error);
        // You might want to show an error message or fallback
        this.translationsLoaded = true;
      },
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(true), // Ensure execution on refresh
        map(() => this.activatedRoute),
        map((route) => {
          const titles: string[] = [];
          while (route) {
            if (route.snapshot.data['title']) {
              titles.unshift(route.snapshot.data['title']);
            }
            route = route.firstChild!;
          }
          return titles;
        }),
      )
      .subscribe((titles) => {
        this.titleService.setTitle(titles);
      });
  }

  private setDocumentLanguage(lang: string): void {
    document.documentElement.lang = lang;
  }
}
