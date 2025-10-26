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
  statoProgetto: ProjectStatus;
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
}

export interface ProdottoProgetto {
  // Proprietà dell'entità Prodotto dal diagramma
  id?: number;
  progettoId: number;
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

// Enums per i nuovi stati del progetto (mantenuti per compatibilità con l'interfaccia esistente)
export enum ProjectStatus {
  ON_GOING = 'ON GOING',
  CRITICAL = 'CRITICAL',
  HOLD_ON = 'HOLD ON',
  RUSH = 'RUSH',
  TO_CHECK = 'TO CHECK',
  UPCOMING = 'UPCOMING',
  PUSHED_OUT = 'PUSHED OUT',
  ON_BID = 'ON BID'
}
