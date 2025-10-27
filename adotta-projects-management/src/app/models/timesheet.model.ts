export interface TimesheetEntry {
  id?: number;
  progettoId: string;
  numeroProgetto: string;
  nomeProgetto: string;
  cliente: string;
  dataRendicontazione: Date;
  oreLavorate: number;
  note: string;
  utente: string;
  dataCreazione?: Date;
  ultimaModifica?: Date;
}

export interface TimesheetOverview {
  numeroProgetto: string;
  nomeProgetto: string;
  cliente: string;
  totaleOre: number;
  numeroRendicontazioni: number;
  ultimaRendicontazione?: Date;
  rendicontazioni: TimesheetEntry[];
}

export interface TimesheetSummary {
  totaleOre: number;
  totaleRendicontazioni: number;
  progettiRendicontati: number;
  mediaOrePerProgetto: number;
}

