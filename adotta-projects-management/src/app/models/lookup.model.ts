// Tabelle di Supporto (Lookup/Master Data)

export interface Cliente {
  id?: number;
  nome: string;
  email?: string;
  telefono?: string;
  partitaIVA?: string;
  indirizzoCompleto?: string;
  contatto?: string;
  note?: string;
}

export interface Stato {
  id?: number;
  nome: string;
  codiceISO: string;
  continente: string;
}

export interface Citta {
  id?: number;
  nome: string;
  statoId: number;
  cap?: string;
  provincia?: string;
  regione?: string;
}

export interface TeamTecnico {
  id?: number;
  nome: string;
  specializzazione?: string;
  membri?: string[];
  email?: string;
  telefono?: string;
  disponibilita?: boolean;
}

export interface TeamAPL {
  id?: number;
  nome: string;
  email?: string;
  telefono?: string;
  area?: string;
  competenze?: string[];
}

export interface Sales {
  id?: number;
  nome: string;
  email?: string;
  telefono?: string;
  zona?: string;
  regioneDiCompetenza?: string;
  progettiGestiti?: number;
}

export interface ProjectManager {
  id?: number;
  nome: string;
  email?: string;
  telefono?: string;
  progettiAttivi?: number;
  esperienza?: string;
  certificazioni?: string[];
}

export interface SquadraInstallazione {
  id?: number;
  nome: string;
  tipo?: string;
  contatto?: string;
  disponibilita?: boolean;
  competenze?: string[];
  numeroMembri?: number;
}

export interface ProdottoMaster {
  id?: number;
  nome: string;
  categoria: string; // Metafora/Wallen/Armonica
  unitaMisura: string;
  codiceSAP?: string;
  descrizione?: string;
  variantiDisponibili?: string[];
}
