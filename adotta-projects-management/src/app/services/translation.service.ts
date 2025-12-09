import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export type SupportedLanguage = 'en' | 'it';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: SupportedLanguage = 'en'; // Default: inglese
  private translations: { [key: string]: string } = {};
  private languageSubject = new BehaviorSubject<SupportedLanguage>(this.currentLanguage);
  public language$ = this.languageSubject.asObservable();

  constructor(private http: HttpClient) {
    // Non carica automaticamente, sarà inizializzato tramite APP_INITIALIZER
  }

  /**
   * Carica le traduzioni per una lingua specifica
   */
  loadTranslations(lang: SupportedLanguage): Observable<void> {
    this.currentLanguage = lang;
    
    return this.http.get<{ [key: string]: any }>(`/assets/i18n/${lang}.json`).pipe(
      map(translations => {
        // Appiattisce la struttura annidata in un dizionario piatto
        this.translations = this.flattenTranslations(translations);
        // Salva la lingua nel localStorage
        localStorage.setItem('preferredLanguage', lang);
        // Emetti il cambio lingua DOPO che le traduzioni sono caricate
        this.languageSubject.next(lang);
      }),
      catchError(error => {
        console.error(`Error loading translations for ${lang}:`, error);
        // Fallback: carica inglese se disponibile
        if (lang !== 'en') {
          return this.loadTranslations('en');
        }
        return of(undefined);
      })
    );
  }

  /**
   * Appiattisce una struttura annidata di traduzioni
   */
  private flattenTranslations(obj: { [key: string]: any }, prefix: string = ''): { [key: string]: string } {
    const flattened: { [key: string]: string } = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Ricorsivamente appiattisce gli oggetti annidati
          Object.assign(flattened, this.flattenTranslations(obj[key], newKey));
        } else {
          // Aggiunge il valore finale
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  /**
   * Inizializza il servizio caricando la lingua preferita dall'utente o quella di default
   */
  initialize(): Observable<void> {
    const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
    const lang = savedLanguage && (savedLanguage === 'en' || savedLanguage === 'it') 
      ? savedLanguage 
      : 'en'; // Default: inglese
    
    return this.loadTranslations(lang);
  }

  /**
   * Traduce una chiave
   */
  translate(key: string, params?: { [key: string]: string | number }): string {
    let translation = this.translations[key] || key;
    
    // Sostituisce i parametri se presenti
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const value = String(params[paramKey]);
        // Supporta sia {{param}} che {param} per compatibilità
        translation = translation.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), value);
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
      });
    }
    
    return translation;
  }

  /**
   * Ottiene la lingua corrente
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Cambia la lingua
   */
  setLanguage(lang: SupportedLanguage): Observable<void> {
    return this.loadTranslations(lang);
  }

  /**
   * Verifica se una traduzione esiste
   */
  hasTranslation(key: string): boolean {
    return key in this.translations;
  }
}
