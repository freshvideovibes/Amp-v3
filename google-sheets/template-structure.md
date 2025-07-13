# Google Sheets Template für AMP - AuftragsManager Pro

## 📋 Tabellenstruktur

### Tabelle 1: "Aufträge"
**Spalten A-O:**
- **A**: `order_id` (Eindeutige Auftrags-ID)
- **B**: `customer_name` (Kundenname)
- **C**: `customer_phone` (Telefonnummer)
- **D**: `full_address` (Vollständige Adresse)
- **E**: `branch` (Branche)
- **F**: `description` (Beschreibung)
- **G**: `preferred_time` (Wunschzeit)
- **H**: `created_at` (Erstellungsdatum)
- **I**: `status` (Status: neu, zugewiesen, in_bearbeitung, abgeschlossen, storniert)
- **J**: `maps_link` (Google Maps Link)
- **K**: `coordinates` (Koordinaten: lat,lng)
- **L**: `telegram_user` (Telegram User ID)
- **M**: `revenue_amount` (Umsatz - wird automatisch aktualisiert)
- **N**: `payment_method` (Zahlungsart - wird automatisch aktualisiert)
- **O**: `completed_at` (Abschlussdatum)

### Tabelle 2: "Umsatz"
**Spalten A-O:**
- **A**: `revenue_id` (Eindeutige Umsatz-ID)
- **B**: `auftragsnummer` (Verweis auf Auftrags-ID)
- **C**: `brutto_betrag` (Bruttobetrag)
- **D**: `netto_betrag` (Nettobetrag - berechnet)
- **E**: `provision` (Provision - berechnet)
- **F**: `zahlungsart` (Zahlungsart)
- **G**: `land` (Land)
- **H**: `branche` (Branche)
- **I**: `kategorie` (Kategorie - berechnet)
- **J**: `monteur` (Monteur)
- **K**: `kunde` (Kunde)
- **L**: `plz` (Postleitzahl)
- **M**: `priorität` (Prioritätsscore - berechnet)
- **N**: `gemeldet_am` (Meldedatum)
- **O**: `telegram_user` (Telegram User ID)

### Tabelle 3: "Monteure"
**Spalten A-K:**
- **A**: `monteur_id` (Eindeutige Monteur-ID)
- **B**: `name` (Name)
- **C**: `phone` (Telefon)
- **D**: `email` (E-Mail)
- **E**: `country` (Land)
- **F**: `service_area` (Servicegebiet)
- **G**: `branches` (Branchen - kommagetrennt)
- **H**: `rating` (Bewertung)
- **I**: `completed_orders` (Abgeschlossene Aufträge)
- **J**: `status` (Status: aktiv, inaktiv, urlaub)
- **K**: `registered_at` (Registrierungsdatum)

### Tabelle 4: "Dashboard"
**KPI-Übersicht mit Formeln:**

#### Zelle B2: Gesamtumsatz heute
```
=SUMIF(Umsatz!N:N,">="&TODAY(),Umsatz!C:C)
```

#### Zelle B3: Anzahl Aufträge heute
```
=COUNTIF(Aufträge!H:H,">="&TODAY())
```

#### Zelle B4: Durchschnittlicher Auftragswert
```
=AVERAGE(Umsatz!C:C)
```

#### Zelle B5: Anzahl aktive Monteure
```
=COUNTIF(Monteure!J:J,"aktiv")
```

#### Zelle B6: Umsatz diese Woche
```
=SUMIFS(Umsatz!C:C,Umsatz!N:N,">="&TODAY()-WEEKDAY(TODAY())+1)
```

#### Zelle B7: Umsatz diesen Monat
```
=SUMIFS(Umsatz!C:C,Umsatz!N:N,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

### Tabelle 5: "Reports"
**Automatische Berichte:**

#### Spalten A-J:
- **A**: `report_date` (Datum)
- **B**: `daily_revenue` (Tagesumsatz)
- **C**: `daily_orders` (Tagesaufträge)
- **D**: `avg_order_value` (Durchschnittlicher Auftragswert)
- **E**: `top_branch` (Top-Branche)
- **F**: `top_monteur` (Top-Monteur)
- **G**: `completion_rate` (Abschlussrate)
- **H**: `cash_percentage` (Bar-Zahlungsanteil)
- **I**: `austria_percentage` (Österreich-Anteil)
- **J**: `created_at` (Erstellungsdatum)

## 🔧 Automatisierungsformeln

### Bedingte Formatierung für Status
1. **Spalte I (Status) in "Aufträge":**
   - `neu` = Rot
   - `zugewiesen` = Gelb
   - `in_bearbeitung` = Blau
   - `abgeschlossen` = Grün
   - `storniert` = Grau

2. **Spalte C (Brutto-Betrag) in "Umsatz":**
   - `>= 1000` = Grün (Hoher Wert)
   - `>= 500` = Gelb (Mittlerer Wert)
   - `< 500` = Standard

### Validierungsregeln
1. **Spalte I (Status) in "Aufträge":**
   ```
   Liste: neu, zugewiesen, in_bearbeitung, abgeschlossen, storniert
   ```

2. **Spalte F (Zahlungsart) in "Umsatz":**
   ```
   Liste: bar, überweisung, karte, rechnung
   ```

3. **Spalte G (Land) in "Umsatz":**
   ```
   Liste: AT, DE, CH
   ```

## 📊 Pivot-Tabellen für Auswertungen

### Pivot 1: Umsatz nach Branche
- **Zeilen**: Branche
- **Werte**: Summe von Brutto-Betrag
- **Filter**: Datum (aktueller Monat)

### Pivot 2: Monteur-Performance
- **Zeilen**: Monteur
- **Werte**: Anzahl Aufträge, Summe Umsatz
- **Filter**: Land, Datum

### Pivot 3: Regionale Verteilung
- **Zeilen**: Land, PLZ
- **Werte**: Anzahl Aufträge, Durchschnittlicher Umsatz
- **Filter**: Branche

## 🔗 Integration mit n8n

### Webhook-URLs für Google Sheets API:
```
GET /sheets/orders - Alle Aufträge abrufen
POST /sheets/orders - Neuen Auftrag hinzufügen
PUT /sheets/orders/{id} - Auftrag aktualisieren
DELETE /sheets/orders/{id} - Auftrag löschen

GET /sheets/revenue - Alle Umsätze abrufen
POST /sheets/revenue - Neuen Umsatz hinzufügen

GET /sheets/monteurs - Alle Monteure abrufen
POST /sheets/monteurs - Neuen Monteur hinzufügen
```

## 🎯 Setup-Anleitung

### 1. Google Sheets erstellen
1. Neue Tabelle erstellen: "AMP - AuftragsManager Pro"
2. Tabellen erstellen: "Aufträge", "Umsatz", "Monteure", "Dashboard", "Reports"
3. Spalten-Header wie oben beschrieben einrichten
4. Formeln in "Dashboard" einfügen

### 2. Google Sheets API aktivieren
1. Google Cloud Console öffnen
2. Projekt erstellen/auswählen
3. Google Sheets API aktivieren
4. Service Account erstellen
5. JSON-Schlüssel herunterladen

### 3. n8n konfigurieren
1. Google Sheets Credentials in n8n hinzufügen
2. Workflows importieren
3. Umgebungsvariablen setzen:
   - `GOOGLE_SHEETS_ID`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ADMIN_CHAT_ID`

### 4. Telegram Bot Setup
1. Bot bei @BotFather erstellen
2. Token in n8n konfigurieren
3. Kanäle/Gruppen erstellen:
   - Admin-Kanal
   - Umsatz-Kanal
   - Branchen-spezifische Kanäle

## 📱 Mobile Optimierung

### Responsive Design für Handy-Nutzung:
- Spaltenbreiten anpassen
- Wichtige Spalten zuerst
- Bedingte Formatierung für bessere Lesbarkeit
- Filter-Buttons für schnelle Navigation

## 🔄 Backup & Synchronisation

### Automatische Backups:
- Täglich: Google Drive Export
- Wöchentlich: CSV-Export per E-Mail
- Monatlich: Vollständige Archivierung

### Synchronisation mit App:
- Echtzeit-Updates über n8n
- Konfliktauflösung bei gleichzeitigen Änderungen
- Offline-Modus mit Sync-Queue