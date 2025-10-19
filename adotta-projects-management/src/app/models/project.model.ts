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

  // Metodi dell'entità Progetto
  isInRitardo?: boolean; // Calcolato dal metodo IsInRitardo()
    
  // Relazioni con le entità figlie
  livelli?: LivelloProgetto[];
  prodotti?: ProdottoProgetto[];
  storico?: StoricoModifica[];

  // Proprietà calcolata per la somma delle quantità dei prodotti
  quantitaTotaleProdotti?: number;
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
  quantita: number;
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
