import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Non pura per reagire ai cambiamenti di lingua
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string = '';
  private lastValue: string = '';
  private lastParams?: { [key: string]: string | number };
  private lastLanguage: string = '';
  private subscription?: Subscription;

  constructor(
    private translationService: TranslationService,
    private changeDetector: ChangeDetectorRef
  ) {
    // Inizializza la lingua corrente
    this.lastLanguage = this.translationService.getCurrentLanguage();
    
    // Sottoscrivi ai cambiamenti di lingua
    this.subscription = this.translationService.language$.subscribe(() => {
      // Invalida completamente la cache quando cambia la lingua
      this.lastKey = '';
      this.lastValue = '';
      this.lastParams = undefined;
      this.lastLanguage = this.translationService.getCurrentLanguage();
      // Forza il change detection per aggiornare tutti i binding
      this.changeDetector.markForCheck();
    });
  }

  transform(key: string, params?: { [key: string]: string | number }): string {
    if (!key) {
      return '';
    }

    const currentLanguage = this.translationService.getCurrentLanguage();
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(this.lastParams);
    
    // Se la lingua è cambiata, i parametri sono cambiati, o la chiave è diversa, ricalcola
    if (currentLanguage !== this.lastLanguage || key !== this.lastKey || paramsChanged) {
      this.lastKey = key;
      this.lastParams = params ? { ...params } : undefined;
      this.lastLanguage = currentLanguage;
      this.lastValue = this.translationService.translate(key, params);
    }

    return this.lastValue || '';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
