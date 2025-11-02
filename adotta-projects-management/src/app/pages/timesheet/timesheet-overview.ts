import { ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TimesheetService } from '../../services/timesheet.service';
import { MockTimesheetService } from '../../services/mock/mock-timesheet.service';
import { ProjectService } from '../../services/project.service';
import { MockProjectService } from '../../services/mock/mock-project.service';
import { TimesheetProjectDto, TimesheetSummary } from '../../models/timesheet.model';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-timesheet-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    TagModule,
    ToolbarModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './timesheet-overview.html'
})
export class TimesheetOverviewComponent implements OnInit {
  timesheets: TimesheetProjectDto[] = [];
  filteredTimesheets: TimesheetProjectDto[] = [];
  summary: TimesheetSummary | null = null;
  loading = false;
  globalFilter = '';
  tableHeight = '500px';
  
  // Date range filter
  dateRange: Date[] | null = null;

  private timesheetService: TimesheetService;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    // Use mock service for development
    this.timesheetService = new MockTimesheetService() as any;
  }

  ngOnInit() {
    this.calculateTableHeight();
    this.loadData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateTableHeight();
  }

  calculateTableHeight() {
    const viewportHeight = window.innerHeight;
    const headerHeight = 85;
    const toolbarHeight = 60;
    const paddingMargin = 150;
    const footerHeight = 40;
    
    const availableHeight = viewportHeight - headerHeight - toolbarHeight - paddingMargin - footerHeight;
    const calculatedHeight = Math.max(300, Math.min(800, availableHeight));
    this.tableHeight = `${calculatedHeight}px`;
    this.cdr.detectChanges();
  }

  loadData() {
    this.loading = true;
    this.timesheetService.getTimesheetOverview().subscribe({
      next: (data) => {
        // TimesheetOverview has structure: { timesheets: TimesheetProjectDto[], summary: TimesheetSummaryDto }
        this.timesheets = data.timesheets || [];
        this.filteredTimesheets = data.timesheets || [];
        this.summary = data.summary || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento timesheet:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nel caricamento dei dati'
        });
        this.loading = false;
      }
    });

    this.timesheetService.getTimesheetSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (error) => {
        console.error('Errore nel caricamento summary:', error);
      }
    });
  }

  filterGlobal(event: any) {
    const filterValue = event.target.value.toLowerCase();
    if (!filterValue) {
      this.filteredTimesheets = this.timesheets;
      return;
    }
    
    this.filteredTimesheets = this.timesheets.filter(item => {
      return (
        item.numeroProgetto?.toLowerCase().includes(filterValue) ||
        item.nomeProgetto?.toLowerCase().includes(filterValue) ||
        item.cliente?.toLowerCase().includes(filterValue)
      );
    });
  }

  applyDateFilter() {
    if (!this.dateRange || this.dateRange.length !== 2) {
      this.filteredTimesheets = this.timesheets;
      return;
    }

    const startDate = new Date(this.dateRange[0]);
    const endDate = new Date(this.dateRange[1]);

    this.filteredTimesheets = this.timesheets.map(item => ({
      ...item,
      rendicontazioni: (item.rendicontazioni || []).filter(entry => {
        const entryDate = new Date(entry.dataRendicontazione);
        return entryDate >= startDate && entryDate <= endDate;
      })
    })).filter(item => (item.rendicontazioni?.length || 0) > 0);
  }

  clearDateFilter() {
    this.dateRange = null;
    this.filteredTimesheets = this.timesheets;
  }

  exportExcel() {
    if (!this.filteredTimesheets || this.filteredTimesheets.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Nessun dato da esportare'
      });
      return;
    }

    const csvContent: string[] = [];
    
    // Header
    csvContent.push('Progetto,Cliente,Totale Ore,Numero Rendicontazioni,Ultima Rendicontazione');
    
    // Data
    this.filteredTimesheets.forEach(item => {
      const line = [
        item.numeroProgetto,
        item.cliente,
        item.totaleOre.toString(),
        item.numeroRendicontazioni.toString(),
        item.ultimaRendicontazione ? new Date(item.ultimaRendicontazione).toLocaleDateString('it-IT') : '-'
      ].map(v => `"${v}"`).join(',');
      csvContent.push(line);
    });

    const csv = csvContent.join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheet_overview_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Successo',
      detail: 'Export completato'
    });
  }
}

