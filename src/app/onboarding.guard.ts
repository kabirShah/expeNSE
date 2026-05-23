import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { OnboardingService } from './services/onboarding.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {
  constructor(
    private router: Router,
    private onboardingService: OnboardingService
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const state = await this.onboardingService.initialize();

    if (state.is_completed) {
      return true;
    }

    return this.router.createUrlTree(['/onboarding']);
  }
}
