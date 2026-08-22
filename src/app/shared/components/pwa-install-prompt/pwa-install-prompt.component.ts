import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install-prompt.component.html',
  styleUrls: ['./pwa-install-prompt.component.scss']
})
export class PwaInstallPromptComponent {
  private pwaService = inject(PwaService);

  isInstallable$ = this.pwaService.isInstallable$;
  isIos$ = this.pwaService.isIos$;
  updateAvailable$ = this.pwaService.updateAvailable$;

  showIosGuide = false;

  async installApp() {
    await this.pwaService.promptInstall();
  }

  updateApp() {
    this.pwaService.updateApp();
  }

  toggleIosGuide() {
    this.showIosGuide = !this.showIosGuide;
  }

  dismiss() {
    this.pwaService.dismissPrompt();
  }
}
