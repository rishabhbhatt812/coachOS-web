import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, filter, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private swUpdate = inject(SwUpdate, { optional: true });
  private platformId = inject(PLATFORM_ID);

  private deferredPrompt: any = null;
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  public isInstallable$ = this.isInstallableSubject.asObservable();

  private isInstalledSubject = new BehaviorSubject<boolean>(false);
  public isInstalled$ = this.isInstalledSubject.asObservable();

  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();

  private isIosSubject = new BehaviorSubject<boolean>(false);
  public isIos$ = this.isIosSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPwa();
    }
  }

  private initPwa(): void {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    this.isInstalledSubject.next(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    this.isIosSubject.next(isIos && !isStandalone);

    // Listen for beforeinstallprompt event on Chromium / Android / Desktop
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallableSubject.next(true);
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstallableSubject.next(false);
      this.isInstalledSubject.next(true);
      console.log('EduNex PWA successfully installed!');
    });

    // Check for ServiceWorker updates
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailableSubject.next(true);
        });
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.isInstallableSubject.next(false);

    return outcome === 'accepted';
  }

  public updateApp(): void {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        document.location.reload();
      });
    } else {
      document.location.reload();
    }
  }

  public dismissPrompt(): void {
    this.isInstallableSubject.next(false);
    this.isIosSubject.next(false);
  }
}
