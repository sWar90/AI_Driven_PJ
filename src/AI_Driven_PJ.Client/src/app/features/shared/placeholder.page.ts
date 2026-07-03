import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="placeholder-page">
      <h1>{{ title }}</h1>
    </section>
  `,
  styles: [`
    .placeholder-page {
      padding: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
    }
  `],
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] ?? 'Page';
}
