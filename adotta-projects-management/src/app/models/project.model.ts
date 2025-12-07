// Allineato con swagger.json API schemas (ProjectDto, LivelloProgettoDto, etc.)

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
  dataInizioInstallazione?: Date;
  dataFineInstallazione?: Date;
  versioneWIC?: string;
  ultimaModifica?: Date;
  statoProgetto?: ProjectStatus | string;
  note?: string;

  // Campi finanziari dall'API
  valoreProgetto?: number;
  marginePrevisto?: number;
  costiSostenuti?: number;

  // Metodi dell'entità Progetto
  isInRitardo?: boolean;
    
  // Relazioni con le entità figlie
  livelli?: LivelloProgetto[];
  prodotti?: ProdottoProgetto[];
  storico?: StoricoModifica[];
  messaggi?: MessaggioProgetto[];
  changeLog?: ChangeLog[];

  // Proprietà calcolate per le quantità totali dei prodotti
  quantitaTotaleMq?: number;
  quantitaTotaleFt?: number;
  
  // Proprietà UI per espansione (non viene salvata nel backend)
  expanded?: boolean;
}

export interface LivelloProgetto {
  // Proprietà dell'entità Livello dal diagramma - allineato con LivelloProgettoDto
  id?: number;
  numeroProgetto?: string; // FK al progetto (stringa come da API)
  nome: string;
  ordine: number;
  descrizione?: string;
  dataInizioInstallazione?: Date;
  dataFineInstallazione?: Date;
  dataCaricamento?: Date;
  // Prodotti subordinati al livello
  prodotti?: ProdottoProgetto[];
  // Proprietà UI per espansione (non viene salvata nel backend)
  expanded?: boolean;
}

export interface ProdottoProgetto {
  // Proprietà dell'entità Prodotto - allineato con ProdottoProgettoDto
  id?: number;
  numeroProgetto?: string; // FK al progetto (stringa come da API)
  livelloId?: number; // FK al livello
  tipoProdotto: string;
  variante: string;
  qMq: number;
  qFt: number;
}

export interface StoricoModifica {
  // Proprietà dell'entità Storico - allineato con StoricoModificaDto
  id?: number;
  numeroProgetto?: string;
  dataModifica: Date;
  utenteModifica: string;
  campoModificato: string;
  valorePrecedente?: string;
  nuovoValore?: string;
  versioneWIC?: string;
  descrizione?: string;
}

export interface MessaggioProgetto {
  // Messaggi per il progetto - allineato con MessaggioProgettoDto
  id?: number;
  numeroProgetto?: string;
  data: Date;
  utente: string;
  messaggio: string;
  tipo?: string; // 'info', 'warning', 'error', 'success' o altri
  allegato?: string;
}

export interface ChangeLog {
  // Registro modifiche - allineato con ChangeLogDto
  id?: number;
  numeroProgetto?: string;
  data: Date;
  utente: string;
  azione: string;
  descrizione: string;
  dettagli?: Record<string, string>;
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
  TO_BE_ASSIGNED = 'TO_BE_ASSIGNED',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED'
}
