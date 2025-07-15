# Google Sheets Enhanced Template für AMP - AuftragsManager Pro

## 📋 **Erweiterte Tabellenstruktur**

### 🔹 **Tabelle 1: "Aufträge" (Spalten A-U)**
- **A**: `order_id` (Eindeutige Auftrags-ID)
- **B**: `customer_name` (Kundenname)
- **C**: `customer_phone` (Telefonnummer)
- **D**: `customer_email` (E-Mail)
- **E**: `full_address` (Vollständige Adresse)
- **F**: `branch` (Branche)
- **G**: `description` (Beschreibung)
- **H**: `preferred_time` (Wunschzeit)
- **I**: `priority_score` (Prioritätsscore)
- **J**: `created_at` (Erstellungsdatum)
- **K**: `processed_at` (Verarbeitungsdatum)
- **L**: `telegram_user` (Telegram User ID)
- **M**: `telegram_username` (Telegram Username)
- **N**: `status` (Status)
- **O**: `maps_link` (Google Maps Link)
- **P**: `coordinates` (Koordinaten)
- **Q**: `formatted_address` (Formatierte Adresse)
- **R**: `place_id` (Google Maps Place ID)
- **S**: `app_version` (App Version)
- **T**: `session_id` (Session ID)
- **U**: `request_id` (Request ID)

### 🔹 **Tabelle 2: "Umsatz" (Spalten A-Y)**
- **A**: `revenue_id` (Eindeutige Umsatz-ID)
- **B**: `auftragsnummer` (Verweis auf Auftrags-ID)
- **C**: `brutto_betrag` (Bruttobetrag)
- **D**: `netto_betrag` (Nettobetrag)
- **E**: `mwst_betrag` (MwSt-Betrag)
- **F**: `provision` (Provision)
- **G**: `provisionssatz` (Provisionssatz)
- **H**: `zahlungsart` (Zahlungsart)
- **I**: `land` (Land)
- **J**: `branche` (Branche)
- **K**: `kategorie` (Kategorie)
- **L**: `monteur` (Monteur)
- **M**: `kunde` (Kunde)
- **N**: `plz` (Postleitzahl)
- **O**: `priorität` (Prioritätsscore)
- **P**: `gemeldet_am` (Meldedatum)
- **Q**: `telegram_user` (Telegram User ID)
- **R**: `telegram_username` (Telegram Username)
- **S**: `app_version` (App Version)
- **T**: `session_id` (Session ID)
- **U**: `request_id` (Request ID)
- **V**: `quartal` (Quartal)
- **W**: `jahr` (Jahr)
- **X**: `monat` (Monat)
- **Y**: `kw` (Kalenderwoche)

### 🔹 **Tabelle 3: "Aktivitäten" (Spalten A-J)**
- **A**: `order_id` (Auftrags-ID)
- **B**: `activity_type` (Aktivitätstyp)
- **C**: `timestamp` (Zeitstempel)
- **D**: `user_id` (Benutzer-ID)
- **E**: `description` (Beschreibung)
- **F**: `branch` (Branche)
- **G**: `priority_score` (Prioritätsscore)
- **H**: `session_id` (Session ID)
- **I**: `request_id` (Request ID)
- **J**: `revenue_id` (Umsatz-ID, falls vorhanden)

### 🔹 **Tabelle 4: "Monteur_Statistiken" (Spalten A-L)**
- **A**: `monteur` (Monteur Name)
- **B**: `branche` (Branche)
- **C**: `brutto_betrag` (Bruttobetrag)
- **D**: `provision` (Provision)
- **E**: `gemeldet_am` (Meldedatum)
- **F**: `monat` (Monat)
- **G**: `jahr` (Jahr)
- **H**: `quartal` (Quartal)
- **I**: `kw` (Kalenderwoche)
- **J**: `zahlungsart` (Zahlungsart)
- **K**: `land` (Land)
- **L**: `plz` (PLZ)

### 🔹 **Tabelle 5: "Dashboard" (Spalten A-C)**
- **A**: `Kennzahl` (KPI Name)
- **B**: `Wert` (Aktueller Wert)
- **C**: `Ziel` (Zielwert)

## 📊 **Automatische Berechnungen**

### 🔹 **Dashboard Formeln (Tabelle "Dashboard")**

#### Zeile 2: Heutiger Umsatz
```
A2: Heutiger Umsatz
B2: =SUMIFS(Umsatz!C:C,Umsatz!P:P,">="&TODAY(),Umsatz!P:P,"<"&TODAY()+1)
C2: 5000
```

#### Zeile 3: Aufträge heute
```
A3: Aufträge heute
B3: =COUNTIFS(Aufträge!J:J,">="&TODAY(),Aufträge!J:J,"<"&TODAY()+1)
C3: 20
```

#### Zeile 4: Durchschnittlicher Auftragswert
```
A4: Durchschnittlicher Auftragswert
B4: =AVERAGEIF(Umsatz!C:C,">0")
C4: 300
```

#### Zeile 5: Provisionen heute
```
A5: Provisionen heute
B5: =SUMIFS(Umsatz!F:F,Umsatz!P:P,">="&TODAY(),Umsatz!P:P,"<"&TODAY()+1)
C5: 750
```

#### Zeile 6: Rohrreinigung Umsatz
```
A6: Rohrreinigung Umsatz
B6: =SUMIF(Umsatz!J:J,"rohrreinigung",Umsatz!C:C)
C6: 15000
```

#### Zeile 7: Heizung Umsatz
```
A7: Heizung Umsatz
B7: =SUMIF(Umsatz!J:J,"heizung",Umsatz!C:C)
C7: 12000
```

#### Zeile 8: Barzahlungen
```
A8: Barzahlungen
B8: =SUMIF(Umsatz!H:H,"bar",Umsatz!C:C)
C8: 3000
```

#### Zeile 9: Hohe Priorität Aufträge
```
A9: Hohe Priorität Aufträge
B9: =COUNTIF(Aufträge!I:I,">=15")
C9: 5
```

#### Zeile 10: Conversion Rate
```
A10: Conversion Rate
B10: =COUNTA(Umsatz!A:A)/(COUNTA(Aufträge!A:A)+0.0001)*100
C10: 75
```

### 🔹 **Tabelle 6: "Monteur_Dashboard" (Spalten A-O)**

#### Automatische Monteur-Statistiken
```
A1: Monteur
B1: Aufträge Total
C1: Umsatz Total
D1: Provision Total
E1: Durchschnitt/Auftrag
F1: Rohrreinigung
G1: Heizung
H1: Sanitär
I1: Elektrik
J1: Barzahlungen
K1: Letzter Auftrag
L1: Diesen Monat
M1: Performance Score
N1: Ranking
O1: Trend
```

#### Monteur-Berechnungen (Beispiel für Zeile 2)
```
A2: =UNIQUE(Monteur_Statistiken!A:A)
B2: =COUNTIF(Monteur_Statistiken!A:A,A2)
C2: =SUMIF(Monteur_Statistiken!A:A,A2,Monteur_Statistiken!C:C)
D2: =SUMIF(Monteur_Statistiken!A:A,A2,Monteur_Statistiken!D:D)
E2: =C2/B2
F2: =SUMIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!A:A,A2,Monteur_Statistiken!B:B,"rohrreinigung")
G2: =SUMIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!A:A,A2,Monteur_Statistiken!B:B,"heizung")
H2: =SUMIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!A:A,A2,Monteur_Statistiken!B:B,"sanitär")
I2: =SUMIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!A:A,A2,Monteur_Statistiken!B:B,"elektrik")
J2: =SUMIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!A:A,A2,Monteur_Statistiken!J:J,"bar")
K2: =MAXIFS(Monteur_Statistiken!E:E,Monteur_Statistiken!A:A,A2)
L2: =SUMIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!A:A,A2,Monteur_Statistiken!F:F,MONTH(TODAY()),Monteur_Statistiken!G:G,YEAR(TODAY()))
M2: =(C2/1000)+(D2/100)+(B2/10)
N2: =RANK(M2,M:M,0)
O2: =IF(L2>AVERAGEIFS(Monteur_Statistiken!C:C,Monteur_Statistiken!F:F,MONTH(TODAY()),Monteur_Statistiken!G:G,YEAR(TODAY())),"📈","📉")
```

### 🔹 **Tabelle 7: "Berichte" (Spalten A-M)**
```
A1: Datum
B1: Umsatz Gesamt
C1: Anzahl Aufträge
D1: Durchschnitt
E1: Rohrreinigung
F1: Heizung
G1: Sanitär
H1: Elektrik
I1: Barzahlungen
J1: Provisionen
K1: Aktive Monteure
L1: Conversion Rate
M1: Performance Score
```

#### Tägliche Berichte (automatisch befüllt)
```
A2: =TODAY()
B2: =SUMIF(Umsatz!P:P,">="&A2,Umsatz!C:C)
C2: =COUNTIF(Aufträge!J:J,">="&A2)
D2: =IF(C2>0,B2/C2,0)
E2: =SUMIFS(Umsatz!C:C,Umsatz!P:P,">="&A2,Umsatz!J:J,"rohrreinigung")
F2: =SUMIFS(Umsatz!C:C,Umsatz!P:P,">="&A2,Umsatz!J:J,"heizung")
G2: =SUMIFS(Umsatz!C:C,Umsatz!P:P,">="&A2,Umsatz!J:J,"sanitär")
H2: =SUMIFS(Umsatz!C:C,Umsatz!P:P,">="&A2,Umsatz!J:J,"elektrik")
I2: =SUMIFS(Umsatz!C:C,Umsatz!P:P,">="&A2,Umsatz!H:H,"bar")
J2: =SUMIF(Umsatz!P:P,">="&A2,Umsatz!F:F)
K2: =COUNTUNIQUE(FILTER(Monteur_Statistiken!A:A,Monteur_Statistiken!E:E>=A2))
L2: =IF(C2>0,COUNTA(FILTER(Umsatz!A:A,Umsatz!P:P>=A2))/C2*100,0)
M2: =(B2/1000)+(C2/10)+(L2/100)
```

## 🔧 **Erweiterte Funktionen**

### 🔹 **Bedingte Formatierung**
1. **Prioritätsscore**: Rot für >=15, Gelb für 10-14, Grün für <10
2. **Umsatz**: Grün für >500€, Gelb für 100-500€, Rot für <100€
3. **Status**: Verschiedene Farben für verschiedene Status
4. **Überfällige Aufträge**: Rot für Aufträge älter als 24h ohne Umsatz

### 🔹 **Datenvalidierung**
1. **Branchen**: Dropdown mit vordefinierten Werten
2. **Zahlungsarten**: Dropdown mit "bar", "karte", "überweisung", "rechnung"
3. **Länder**: Dropdown mit "AT", "DE", "CH"
4. **Status**: Dropdown mit "neu", "zugewiesen", "in_bearbeitung", "abgeschlossen"

### 🔹 **Automatische Warnungen**
1. **Niedriger Umsatz**: Benachrichtigung bei <100€
2. **Hohe Priorität**: Hervorhebung bei Score >=15
3. **Überfällige Aufträge**: Markierung nach 24h ohne Status-Update
4. **Geocoding-Fehler**: Markierung bei fehlenden Koordinaten

### 🔹 **Pivot-Tabellen**
1. **Umsatz nach Monteur und Branche**
2. **Aufträge nach Zeitraum und Region**
3. **Provisionen nach Zahlungsart**
4. **Performance-Analyse nach Wochentagen**

## 📱 **Telegram Integration**

### 🔹 **Automatische Benachrichtigungen**
1. **Neue Aufträge**: Sofortige Benachrichtigung an entsprechenden Kanal
2. **Hohe Priorität**: Spezielle Benachrichtigung für dringende Aufträge
3. **Umsatz-Updates**: Benachrichtigungen bei neuen Umsätzen
4. **Tageszusammenfassung**: Tägliche Statistiken um 18:00 Uhr
5. **Wochenbericht**: Wöchentliche Zusammenfassung jeden Montag

### 🔹 **Interaktive Befehle**
1. `/stats` - Aktuelle Statistiken
2. `/today` - Heutige Aufträge und Umsätze
3. `/top` - Top-Monteure
4. `/branch [branche]` - Branchenspezifische Statistiken
5. `/urgent` - Dringende Aufträge

## 🎯 **KPI-Tracking**

### 🔹 **Wichtige Kennzahlen**
1. **Conversion Rate**: Aufträge zu Umsatz
2. **Durchschnittlicher Auftragswert**: Umsatz / Aufträge
3. **Monteur-Performance**: Umsatz pro Monteur
4. **Branchen-Performance**: Umsatz nach Branchen
5. **Zahlungsart-Verteilung**: Anteil verschiedener Zahlungsarten
6. **Geografische Verteilung**: Umsatz nach Regionen
7. **Zeitliche Trends**: Entwicklung über Zeit

### 🔹 **Automatische Berichte**
1. **Tagesbericht**: Automatisch um 18:00 Uhr
2. **Wochenbericht**: Jeden Montag um 8:00 Uhr
3. **Monatsbericht**: Am 1. jeden Monats
4. **Quartalsbericht**: Quartalsweise
5. **Jahresbericht**: Jährlich

## 🔐 **Datenschutz und Sicherheit**

### 🔹 **Zugriffsrechte**
1. **Admin**: Vollzugriff auf alle Daten
2. **Monteure**: Nur eigene Daten sichtbar
3. **Viewer**: Nur Lesezugriff auf Berichte
4. **Regional**: Zugriff nur auf regionale Daten

### 🔹 **Datenvalidierung**
1. **Plausibilitätsprüfung**: Automatische Überprüfung ungewöhnlicher Werte
2. **Duplikatserkennung**: Warnung bei ähnlichen Aufträgen
3. **Konsistenzprüfung**: Überprüfung der Datenintegrität
4. **Backup-System**: Automatische Datensicherung

Dieses erweiterte System bietet eine vollständige Lösung für die Verwaltung und Analyse Ihrer AMP-Aufträge mit automatischen Berechnungen, Benachrichtigungen und umfassenden Berichten.