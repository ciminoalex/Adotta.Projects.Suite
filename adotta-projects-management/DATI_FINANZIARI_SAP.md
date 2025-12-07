# Documentazione Integrazione Dati Finanziari SAP

## Panoramica

I dati finanziari del progetto provengono da commerciale e amministrazione. Il sistema gestisce tre campi principali con diverse modalità di integrazione.

## Campi Dati Finanziari

### 1. Valore Progetto

**Tipo:** Dinamico  
**Source:** SAP Business One  
**Collegamento:** Numero commessa (codiceSAP)  
**Comportamento:** 
- Valore che può cambiare in positivo/negativo durante la vita del progetto
- Aggiornato automaticamente da SAP Business One
- Collegato tramite il campo `codiceSAP` del progetto

**Implementazione:**
- Il valore viene ricavato automaticamente da SAP Business One
- Richiede integrazione API con SAP Business One
- Il campo è attualmente presente nel form progetto (`valoreProgetto`)
- Campo di tipo `decimal?` nel modello dati

**Domande per il team:**
- È possibile estrarre "Valore Progetto" da SAP in tempo reale?
- Quale API/servizio SAP utilizzare?
- Quale endpoint/query utilizzare per recuperare il valore basato sul codice commessa?

---

### 2. Margine Previsto

**Tipo:** Manuale  
**Input:** Inserito dall'utente  
**Base:** Scheda costi dell'offerta approvata  
**Comportamento:**
- Campo editabile dall'utente
- Basato sulla scheda costi dell'offerta approvata
- Valore percentuale

**Implementazione:**
- Campo già implementato nel form progetto (`marginePrevisto`)
- Campo di tipo `decimal?` nel modello dati
- Input manuale tramite `p-inputNumber` con suffisso "%"
- Nessuna integrazione SAP richiesta

---

### 3. Costi Sostenuti

**Tipo:** Dinamico (preferibile)  
**Source:** SAP Business One (se possibile)  
**Alternativa:** Inserimento manuale a fine progetto (da evitare)  
**Comportamento:**
- Preferibilmente estratto automaticamente da SAP Business One
- Alternativa: inserimento manuale a fine progetto (non ideale)

**Implementazione:**
- Campo presente nel form progetto (`costiSostenuti`)
- Campo di tipo `decimal` nel modello dati (default: 0)
- Attualmente impostato come `readonly` nel form
- Campo di tipo `decimal` nel modello dati

**Domande per il team:**
- È possibile estrarre "Costi Sostenuti" da SAP?
- Quale API/servizio SAP utilizzare?
- Come vengono tracciati i costi in SAP Business One?
- Quale endpoint/query utilizzare per recuperare i costi basati sul codice commessa?

---

## Stato Attuale Implementazione

### Form Progetto (`project-form.html`)

I campi finanziari sono già presenti nella sezione "Dati Finanziari":

```html
<div class="col-span-12 md:col-span-4">
  <label class="block text-900 font-medium mb-2">Valore Progetto</label>
  <p-inputNumber 
    formControlName="valoreProgetto"
    mode="currency"
    currency="EUR"
    locale="it-IT"
    placeholder="Valore progetto"
    class="w-full">
  </p-inputNumber>
</div>

<div class="col-span-12 md:col-span-4">
  <label class="block text-900 font-medium mb-2">Margine Previsto (%)</label>
  <p-inputNumber 
    formControlName="marginePrevisto"
    suffix="%"
    placeholder="Margine previsto"
    class="w-full">
  </p-inputNumber>
</div>

<div class="col-span-12 md:col-span-4">
  <label class="block text-900 font-medium mb-2">Costi Sostenuti</label>
  <p-inputNumber 
    formControlName="costiSostenuti"
    mode="currency"
    currency="EUR"
    locale="it-IT"
    placeholder="Costi sostenuti"
    [readonly]="true"
    class="w-full">
  </p-inputNumber>
</div>
```

### Modello Dati (`project.model.ts`)

```typescript
export interface Project {
  // ... altri campi
  valoreProgetto?: number;
  marginePrevisto?: number;
  costiSostenuti?: number;
  // ...
}
```

---

## Prossimi Passi per Integrazione SAP

### 1. Identificare API SAP Business One

- Verificare quale versione di SAP Business One è in uso
- Identificare API disponibili (REST, SOAP, OData)
- Ottenere credenziali e documentazione API

### 2. Creare Service SAP

Creare un nuovo service Angular per l'integrazione SAP:

```typescript
// sap-integration.service.ts
@Injectable({
  providedIn: 'root'
})
export class SapIntegrationService {
  // Metodi per recuperare:
  // - getValoreProgetto(codiceSAP: string): Observable<number>
  // - getCostiSostenuti(codiceSAP: string): Observable<number>
}
```

### 3. Aggiornare ProjectService

Integrare il recupero automatico dei dati finanziari:

- Al caricamento del progetto, chiamare SAP per aggiornare `valoreProgetto` e `costiSostenuti`
- Implementare polling periodico o webhook per aggiornamenti in tempo reale (opzionale)

### 4. Gestione Errori

- Gestire casi in cui SAP non è disponibile
- Fallback a valori manuali se necessario
- Logging degli errori di integrazione

---

## Note Tecniche

- Il campo `codiceSAP` è già presente nel modello Project e viene utilizzato per il collegamento
- I campi finanziari sono opzionali (nullable) per permettere progetti senza dati finanziari
- Il campo `costiSostenuti` ha default 0 per evitare valori null

---

## Domande Aperte per il Team

1. **API SAP Business One:**
   - Quale versione di SAP Business One è in uso?
   - Quale tipo di API è disponibile (REST, SOAP, OData)?
   - Quali sono le credenziali e l'endpoint base?

2. **Valore Progetto:**
   - Quale tabella/campo in SAP contiene il valore progetto?
   - Come viene calcolato il valore (ordine, fattura, altro)?
   - Il valore può cambiare nel tempo? Con quale frequenza?

3. **Costi Sostenuti:**
   - Come vengono tracciati i costi in SAP?
   - Quale tabella/campo contiene i costi sostenuti?
   - I costi vengono aggiornati in tempo reale o periodicamente?

4. **Sincronizzazione:**
   - Quale frequenza di aggiornamento è necessaria?
   - È necessario polling periodico o webhook?
   - Come gestire progetti senza codiceSAP?

---

## Riferimenti

- Form Progetto: `src/app/pages/projects/project-form.html`
- Modello Dati: `src/app/models/project.model.ts`
- Service Progetto: `src/app/services/project.service.ts`
