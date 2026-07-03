import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        AI Driven by <a href="https://www.openai.com/" target="_blank" rel="noopener noreferrer">OpenAI</a>
    </div>`
})
export class AppFooter {}
