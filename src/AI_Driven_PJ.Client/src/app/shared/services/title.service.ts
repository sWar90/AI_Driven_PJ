import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private appName = 'AI Driven';
  private currentRawTitles: string[] = [];

  constructor(
    private titleService: Title,
    private translate: TranslateService
  ) {
    // Automatically update title when language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTitle();
    });
  }

  setTitle(titles: string[]) {
    this.currentRawTitles = titles;
    this.updateTitle();
  }

  private updateTitle() {
    const translatedTitles = this.currentRawTitles.map(t => this.translate.instant(t));
    const fullTitle = [...translatedTitles, this.appName].join(' | ');
    this.titleService.setTitle(fullTitle);
  }
}
