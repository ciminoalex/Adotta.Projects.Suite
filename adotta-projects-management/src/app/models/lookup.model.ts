// Tabelle di Supporto (Lookup/Master Data)
// Allineato con swagger.json API schemas

export interface BPAddress {
  addressName?: string;
  street?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

export interface Cliente {
  id?: string;
  cardCode?: string;
  nome: string;
  email?: string;
  telefono?: string;
  partitaIVA?: string;
  contatto?: string;
  indirizzoCompleto?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  stato?: string;
  note?: string;
  validFor?: string;
  addresses?: BPAddress[];
}

export interface Stato {
  id?: string;
  nome: string;
  codiceISO: string;
  continente: string;
}

export interface Citta {
  id?: string;
  nome: string;
  statoId?: string;
  cap?: string;
  provincia?: string;
  regione?: string;
}

export interface TeamTecnico {
  id?: string;
  nome: string;
  specializzazione?: string;
  membri?: string[];
  email?: string;
  telefono?: string;
  disponibilita?: boolean;
}

export interface TeamAPL {
  id?: string;
  nome: string;
  email?: string;
  telefono?: string;
  area?: string;
  competenze?: string[];
}

export interface Sales {
  id?: string;
  nome: string;
  email?: string;
  telefono?: string;
  zona?: string;
  regioneDiCompetenza?: string;
  progettiGestiti?: number;
}

export interface ProjectManager {
  id?: string;
  nome: string;
  email?: string;
  telefono?: string;
  progettiAttivi?: number;
  esperienza?: string;
  certificazioni?: string[];
}

export interface SquadraInstallazione {
  id?: string;
  nome: string;
  tipo?: string;
  contatto?: string;
  disponibilita?: boolean;
  competenze?: string[];
  numeroMembri?: number;
}

export interface ProdottoMaster {
  id?: string;
  nome: string;
  categoria: string; // Metafora/Wallen/Armonica
  unitaMisura: string;
  codiceSAP?: string;
  descrizione?: string;
  variantiDisponibili?: string[];
}
