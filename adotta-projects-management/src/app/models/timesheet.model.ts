export interface TimesheetEntry {
  id?: number;
  progettoId: string;
  numeroProgetto: string;
  nomeProgetto: string;
  cliente: string;
  livelloId?: number;
  dataRendicontazione: Date;
  oreLavorate: number;
  note: string;
  utente: string;
  dataCreazione?: Date;
  ultimaModifica?: Date;
}

// Single project overview (used internally)
export interface TimesheetOverview {
  numeroProgetto: string;
  nomeProgetto: string;
  cliente: string;
  totaleOre: number;
  numeroRendicontazioni: number;
  ultimaRendicontazione?: Date;
  rendicontazioni: TimesheetEntry[];
}

// API response structure for overview endpoint (matches swagger TimesheetOverviewDto)
export interface TimesheetOverviewResponse {
  timesheets: TimesheetProjectDto[];
  summary: TimesheetSummary;
}

// Project DTO from API (matches swagger TimesheetProjectDto)
export interface TimesheetProjectDto {
  numeroProgetto: string;
  nomeProgetto: string;
  cliente: string;
  totaleOre: number;
  numeroRendicontazioni: number;
  ultimaRendicontazione?: Date;
  rendicontazioni?: TimesheetEntry[];
}

export interface TimesheetSummary {
  totaleOre: number;
  totaleRendicontazioni: number;
  progettiRendicontati: number;
  mediaOrePerProgetto: number;
}

