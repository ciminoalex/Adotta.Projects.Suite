export interface Project {
  // Proprietà principali dell'entità Progetto dal diagramma
  numeroProgetto: string;
  cliente: string;
  nomeProgetto: string;
  citta: string;
  stato: string;
  teamTecnico?: string;
  teamAPL?: string;
  sales?: string;
  projectManager?: string;
  teamInstallazione?: string;
  dataCreazione: Date;
  dataInizioInstallazione: Date;
  dataFineInstallazione: Date;
  versioneWIC?: string;
  ultimaModifica?: Date;
  statoProgetto?: ProjectStatus | string; // Should be a ProjectStatus enum value (string)
  note?: string;

  // Metodi dell'entità Progetto
  isInRitardo?: boolean; // Calcolato dal metodo IsInRitardo()
    
  // Relazioni con le entità figlie
  livelli?: LivelloProgetto[];
  prodotti?: ProdottoProgetto[];
  storico?: StoricoModifica[];
  messaggi?: MessaggioProgetto[];
  changeLog?: ChangeLog[];

  // Proprietà calcolate per le quantità totali dei prodotti
  quantitaTotaleMq?: number;
  quantitaTotaleFt?: number;
}

export interface LivelloProgetto {
  // Proprietà dell'entità Livello dal diagramma
  id?: number;
  progettoId: number;
  nome: string;
  ordine: number;
  descrizione: string;
  dataInizioInstallazione?: Date;
  dataFineInstallazione?: Date;
  dataCaricamento?: Date;
  // Prodotti subordinati al livello
  prodotti?: ProdottoProgetto[];
  // Proprietà UI per espansione (non viene salvata nel backend)
  expanded?: boolean;
}

export interface ProdottoProgetto {
  // Proprietà dell'entità Prodotto dal diagramma
  id?: number;
  progettoId: number;
  livelloId?: number; // FK al livello - ora i prodotti sono subordinati ai livelli
  tipoProdotto: string;
  variante: string;
  qMq: number;
  qFt: number;
}

export interface StoricoModifica {
  // Proprietà dell'entità Storico dal diagramma
  id?: number;
  progettoId: number;
  dataModifica: Date;
  utenteModifica: string;
  campoModificato: string;
  valorePrecedente?: string;
  nuovoValore?: string;
}

export interface MessaggioProgetto {
  // Messaggi per il progetto
  id?: number;
  progettoId: number;
  data: Date;
  utente: string;
  messaggio: string;
  tipo?: 'info' | 'warning' | 'error' | 'success';
  allegato?: string;
}

export interface ChangeLog {
  // Registro modifiche per il progetto
  id?: number;
  progettoId: number;
  data: Date;
  utente: string;
  azione: string; // 'created', 'updated', 'deleted', 'status_changed', etc.
  descrizione: string;
  dettagli?: Record<string, any>;
}

// Enums per i nuovi stati del progetto (formato API con underscore)
export enum ProjectStatus {
  ON_GOING = 'ON_GOING',
  CRITICAL = 'CRITICAL',
  HOLD_ON = 'HOLD_ON',
  RUSH = 'RUSH',
  TO_CHECK = 'TO_CHECK',
  UPCOMING = 'UPCOMING',
  PUSHED_OUT = 'PUSHED_OUT',
  ON_BID = 'ON_BID'
}
