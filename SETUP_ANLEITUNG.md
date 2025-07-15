# 🚀 Setup-Anleitung für AMP Enhanced Integration

## 📋 Übersicht der Verbesserungen

Ihre AMP-App wird mit folgenden Verbesserungen erweitert:

### ✅ **Neue Features:**
- **Konfigurierbare n8n Integration** mit Retry-Mechanismus
- **Erweiterte Google Maps API** mit Geocoding und Routenplanung
- **Offline-Support** mit automatischer Synchronisation
- **Google Sheets Integration** für persistente Datenspeicherung
- **Verbesserte Telegram-Funktionen** mit Haptic Feedback
- **Automatische Berechnungen** für Umsätze und Provisionen

---

## 🔧 **Schritt 1: Neue Dateien integrieren**

### 1.1 HTML-Datei aktualisieren
Fügen Sie diese Zeilen in Ihre `index.html` ein (nach dem bestehenden telegram-web-app.js):

```html
<!-- Nach Zeile 6 in index.html einfügen -->
<script src="js/config.js"></script>
<script src="js/amp-enhanced.js"></script>
```

### 1.2 Bestehende amp-app.js ersetzen
Die neue `js/amp-enhanced.js` ersetzt Ihre aktuelle `js/amp-app.js`. 

**Backup erstellen:**
```bash
cp js/amp-app.js js/amp-app.js.backup
```

### 1.3 Konfiguration anpassen
Öffnen Sie `js/config.js` und passen Sie diese Werte an:

```javascript
// Ihre n8n Server URL
baseUrl: 'https://IHR-N8N-SERVER.com',

// Google Maps API Key (optional)
apiKey: 'IHRE_GOOGLE_MAPS_API_KEY',

// Google Sheets ID (optional)
spreadsheetId: 'IHRE_GOOGLE_SHEETS_ID',

// Telegram Bot Token (optional)
botToken: 'IHRE_TELEGRAM_BOT_TOKEN',
```

---

## 🛠️ **Schritt 2: n8n Server konfigurieren**

### 2.1 n8n Installation (falls noch nicht vorhanden)
```bash
# Via npm (lokal)
npm install -g n8n

# Via Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2.2 Umgebungsvariablen setzen
Erstellen Sie eine `.env` Datei in Ihrem n8n Verzeichnis:

```env
# Google Sheets
GOOGLE_SHEETS_ID=1ABC123...
GOOGLE_SHEETS_API_KEY=AIzaSy...

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABC...
TELEGRAM_ADMIN_CHAT_ID=123456789
TELEGRAM_ORDERS_CHANNEL=@your_orders_channel
TELEGRAM_REVENUE_CHANNEL=@your_revenue_channel
TELEGRAM_ROHRREINIGUNG_CHANNEL=@your_rohrreinigung_channel

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...
```

### 2.3 Workflows importieren
1. n8n öffnen (http://localhost:5678)
2. "Import workflow" klicken
3. `n8n-workflows/amp-order-workflow.json` importieren
4. `n8n-workflows/amp-revenue-workflow.json` importieren
5. Workflows aktivieren

### 2.4 Webhook-URLs notieren
Nach Import haben Sie folgende URLs:
- **Orders**: `https://IHR-N8N-SERVER.com/webhook/amp-orders`
- **Revenue**: `https://IHR-N8N-SERVER.com/webhook/amp-revenue`
- **Monteur**: `https://IHR-N8N-SERVER.com/webhook/amp-monteur`
- **Status**: `https://IHR-N8N-SERVER.com/webhook/amp-status`

---

## 📊 **Schritt 3: Google Sheets einrichten**

### 3.1 Neue Tabelle erstellen
1. Google Sheets öffnen
2. Neue Tabelle: "AMP - AuftragsManager Pro"
3. Tabellen erstellen: "Aufträge", "Umsatz", "Monteure", "Dashboard", "Reports"

### 3.2 Spalten-Header einrichten
Verwenden Sie die Struktur aus `google-sheets/template-structure.md`:

**Tabelle "Aufträge":**
```
A: order_id | B: customer_name | C: customer_phone | D: full_address | E: branch
F: description | G: preferred_time | H: created_at | I: status | J: maps_link
K: coordinates | L: telegram_user | M: revenue_amount | N: payment_method | O: completed_at
```

**Tabelle "Umsatz":**
```
A: revenue_id | B: auftragsnummer | C: brutto_betrag | D: netto_betrag | E: provision
F: zahlungsart | G: land | H: branche | I: kategorie | J: monteur
K: kunde | L: plz | M: priorität | N: gemeldet_am | O: telegram_user
```

### 3.3 Dashboard-Formeln hinzufügen
In der "Dashboard" Tabelle:

```
B2: =SUMIF(Umsatz!N:N,">="&TODAY(),Umsatz!C:C)
B3: =COUNTIF(Aufträge!H:H,">="&TODAY())
B4: =AVERAGE(Umsatz!C:C)
B5: =COUNTIF(Monteure!J:J,"aktiv")
```

### 3.4 Google Sheets API einrichten
1. Google Cloud Console → Projekt erstellen
2. Google Sheets API aktivieren
3. Service Account erstellen
4. JSON-Schlüssel herunterladen
5. Tabelle für Service Account freigeben

---

## 📱 **Schritt 4: Telegram Bot konfigurieren**

### 4.1 Bot erstellen
1. @BotFather kontaktieren
2. `/newbot` → Bot-Name eingeben
3. Token kopieren und in n8n einfügen

### 4.2 Kanäle erstellen
- **Admin-Kanal**: Für wichtige Benachrichtigungen
- **Umsatz-Kanal**: Für Umsatzmeldungen
- **Branchen-Kanäle**: Für spezifische Branchen

### 4.3 Bot zu Kanälen hinzufügen
1. Bot als Admin zu jedem Kanal hinzufügen
2. Kanal-IDs in n8n Umgebungsvariablen eintragen

---

## 🌐 **Schritt 5: Google Maps API einrichten**

### 5.1 API Key erstellen
1. Google Cloud Console → APIs & Services
2. Google Maps Platform APIs aktivieren:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API
   - Maps Static API

### 5.2 API Key beschränken
```
Anwendungseinschränkungen: HTTP-Referrer
Website-Einschränkungen: ihre-domain.com/*
API-Einschränkungen: Ausgewählte APIs
```

### 5.3 API Key in Config eintragen
```javascript
// js/config.js
apiKey: 'IHRE_GOOGLE_MAPS_API_KEY'
```

---

## 🔄 **Schritt 6: Bestehende Funktionen migrieren**

### 6.1 Event-Listener aktualisieren
Ersetzen Sie in Ihrem bestehenden Code:

```javascript
// ALT:
document.getElementById('auftragButton')?.addEventListener('click', () => {
  // ... alter Code
});

// NEU:
document.getElementById('auftragButton')?.addEventListener('click', async () => {
  const orderData = {
    name: document.getElementById('name').value,
    address: document.getElementById('address').value,
    // ... weitere Felder
  };
  
  try {
    await window.ampEnhanced.processOrder(orderData);
  } catch (error) {
    console.error('Order processing failed:', error);
  }
});
```

### 6.2 Umsatz-Meldung aktualisieren
```javascript
// ALT:
document.getElementById('umsatzButton')?.addEventListener('click', () => {
  // ... alter Code
});

// NEU:
document.getElementById('umsatzButton')?.addEventListener('click', async () => {
  const revenueData = {
    auftragsnummer: document.getElementById('umsatz_auftragsnummer').value,
    betrag: document.getElementById('betrag').value,
    // ... weitere Felder
  };
  
  try {
    await window.ampEnhanced.processRevenue(revenueData);
  } catch (error) {
    console.error('Revenue processing failed:', error);
  }
});
```

---

## 🧪 **Schritt 7: Testen der Integration**

### 7.1 Lokaler Test
1. Telegram Web App in Development Mode öffnen
2. Neuen Auftrag erstellen
3. Prüfen:
   - ✅ n8n Workflow ausgeführt
   - ✅ Google Sheets Eintrag erstellt
   - ✅ Telegram Benachrichtigung erhalten
   - ✅ Google Maps Link funktioniert

### 7.2 Offline-Test
1. Netzwerk deaktivieren
2. Auftrag erstellen
3. Netzwerk aktivieren
4. Prüfen: Automatische Synchronisation

### 7.3 Error-Handling Test
1. Ungültige Daten eingeben
2. Prüfen: Benutzerfreundliche Fehlermeldungen
3. n8n Server temporär stoppen
4. Prüfen: Offline-Queue funktioniert

---

## 📈 **Schritt 8: Monitoring & Wartung**

### 8.1 n8n Monitoring
- **Workflow-Ausführungen** überwachen
- **Fehlerlog** regelmäßig prüfen
- **Performance-Metriken** beobachten

### 8.2 Google Sheets Monitoring
- **API-Limits** überwachen
- **Daten-Konsistenz** prüfen
- **Backup-Strategie** implementieren

### 8.3 Telegram Bot Monitoring
- **Message-Delivery** überwachen
- **Bot-Uptime** prüfen
- **Spam-Schutz** aktivieren

---

## 🚀 **Schritt 9: Erweiterte Features (optional)**

### 9.1 Real-time Updates
```javascript
// WebSocket für Live-Updates
const ws = new WebSocket('wss://ihr-server.com/live-updates');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // UI aktualisieren
};
```

### 9.2 Push Notifications
```javascript
// Service Worker für Push Notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 9.3 Analytics Integration
```javascript
// Google Analytics 4
gtag('config', 'GA_MEASUREMENT_ID');
gtag('event', 'order_created', {
  order_id: orderData.id,
  revenue: orderData.amount
});
```

---

## 🔒 **Schritt 10: Sicherheit & Best Practices**

### 10.1 API-Schlüssel sichern
- **Umgebungsvariablen** verwenden
- **IP-Beschränkungen** aktivieren
- **Regelmäßige Rotation** der Schlüssel

### 10.2 Daten-Validierung
```javascript
// Input-Validierung
function validateOrderData(data) {
  if (!data.name || data.name.length < 2) {
    throw new Error('Name ist erforderlich');
  }
  // ... weitere Validierungen
}
```

### 10.3 Rate Limiting
```javascript
// Client-seitige Rate Limiting
const rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
```

---

## 🎯 **Zusammenfassung**

Nach der Implementierung haben Sie:

### ✅ **Verbesserte Funktionalität:**
- Stabile n8n Integration mit Retry-Mechanismus
- Erweiterte Google Maps Features
- Offline-Support mit automatischer Sync
- Persistente Datenspeicherung in Google Sheets
- Verbesserte Telegram-Integration

### ✅ **Bessere Benutzerfreundlichkeit:**
- Haptic Feedback in Telegram
- Informative Fehlermeldungen
- Automatische Berechnungen
- Real-time Status Updates

### ✅ **Höhere Zuverlässigkeit:**
- Offline-Queue für ausfallsichere Übertragung
- Automatische Backups
- Monitoring und Logging
- Error Recovery

---

## 📞 **Support & Hilfe**

### Häufige Probleme:
1. **n8n Webhook funktioniert nicht** → URL und Authentifizierung prüfen
2. **Google Maps keine Koordinaten** → API Key und Limits prüfen
3. **Telegram Bot antwortet nicht** → Bot-Token und Berechtigungen prüfen
4. **Offline-Sync funktioniert nicht** → Browser-Storage und Netzwerk prüfen

### Debug-Tipps:
```javascript
// Debug-Modus aktivieren
window.AMP_CONFIG.debug = true;

// Console-Logs aktivieren
localStorage.setItem('amp_debug', 'true');
```

**Viel Erfolg bei der Implementierung! 🚀**