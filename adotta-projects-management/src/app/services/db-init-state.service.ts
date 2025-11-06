import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbInitStateService {
  private readonly STORAGE_KEY = 'db_initialized';
  private readonly INIT_CHECK_KEY = 'db_init_check_performed';
  
  private initializedSubject = new BehaviorSubject<boolean>(this.getInitializedFromStorage());
  public initialized$: Observable<boolean> = this.initializedSubject.asObservable();

  constructor() {
    // Se stiamo usando mock services, il DB è sempre considerato inizializzato
    // Questo viene gestito dall'interceptor che imposta lo stato
  }

  /**
   * Verifica se il DB è inizializzato leggendo dal localStorage
   */
  private getInitializedFromStorage(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    // Se non c'è valore salvato, assumiamo che non sia inizializzato
    // Questo è importante per il primo avvio
    return stored === 'true';
  }

  /**
   * Verifica se è stata già eseguita una verifica dello stato di inizializzazione
   */
  hasInitCheckBeenPerformed(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(this.INIT_CHECK_KEY) === 'true';
  }

  /**
   * Imposta che è stata eseguita una verifica dello stato
   */
  setInitCheckPerformed(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.INIT_CHECK_KEY, 'true');
    }
  }

  /**
   * Verifica se il DB è inizializzato
   */
  isInitialized(): boolean {
    return this.initializedSubject.value;
  }

  /**
   * Imposta lo stato di inizializzazione del DB
   */
  setInitialized(initialized: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, initialized.toString());
    }
    this.initializedSubject.next(initialized);
  }

  /**
   * Resetta lo stato (utile per testing o logout)
   */
  reset(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.INIT_CHECK_KEY);
    }
    this.initializedSubject.next(false);
  }
}

