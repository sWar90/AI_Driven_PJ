import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-page">
      <h1>Dashboard</h1>
    </section>
  `,
  styles: [`
    .dashboard-page {
      padding: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
    }
  `],
})
export class DashboardPage {}
