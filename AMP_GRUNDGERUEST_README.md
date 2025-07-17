# 🎯 Auftragsmanager Pro (AMP) - Grundgerüst

## 📦 Projektstruktur

Das AMP-Projekt besteht aus drei separaten Mini-WebApps mit gemeinsamen Komponenten:

```
/
├── amp-agent/           # 🧾 Agenten-UI
│   ├── index.html
│   ├── app.js
│   └── style.css
├── amp-monteur/         # 🔧 Monteur-UI
│   ├── index.html
│   ├── app.js
│   └── style.css
├── amp-admin/           # 🛡️ Admin-UI (noch zu erstellen)
│   ├── index.html
│   ├── app.js
│   └── style.css
└── shared/              # 📚 Gemeinsame Komponenten
    ├── config/
    │   └── roles.json   # Rollenverwaltung
    ├── components/
    │   └── ui.js        # UI-Komponenten
    ├── styles/
    │   ├── base.css     # Basis-Styles
    │   └── components.css # Komponenten-Styles
    └── utils/
        ├── auth.js      # Authentifizierung
        └── n8n.js       # n8n-Kommunikation
```

## 🔐 Rollensystem

### Rollen-Konfiguration (`shared/config/roles.json`)
```json
{
  "123456789": "admin",
  "987654321": "agent", 
  "555666777": "monteur"
}
```

### Authentifizierung
- Basiert auf `Telegram.WebApp.initDataUnsafe.user.id`
- Lokale Validierung über `roles.json`
- Automatische Umleitung bei unbekannten IDs
- Rollenbasierte UI-Steuerung

## 🧾 AMP Agent - Funktionen

### ✅ Implementierte Features:
- **Auftrag erfassen**: Vollständiges Formular mit Kundendaten
- **Auftrag suchen**: Suche nach ID, Name, Telefon, PLZ, Datum
- **Beschwerden melden**: Meldung von Problemen und Wartezeiten
- **Benutzer-Profil**: Anzeige der Benutzerinformationen

### 🎨 UI-Features:
- Mobile-first Design
- Responsive Navigation
- Formvalidierung
- Erfolgsmeldungen
- Fehlerbehandlung
- Suchfilter und -ergebnisse

## 🔧 AMP Monteur - Funktionen

### ✅ Implementierte Features:
- **Zugewiesene Aufträge**: Übersicht mit Filterung
- **Umsatz melden**: Detaillierte Umsatzmeldung mit Foto-Upload
- **Status aktualisieren**: Auftragsstatus ändern
- **Statistiken**: Persönliche Leistungsübersicht

### 🎨 UI-Features:
- Card-basierte Auftragsansicht
- Status-Filter (Alle, Ausstehend, In Bearbeitung, Abgeschlossen)
- Foto-Upload mit Vorschau
- Modal für Auftragsdetails
- Responsive Design

## 🛡️ AMP Admin - Geplante Funktionen

### 📋 Zu implementieren:
- **Alle Aufträge**: Vollständige Auftragsübersicht
- **Auftragsverwaltung**: Annehmen, Stornieren, Korrigieren
- **Monteur-Zuweisung**: Aufträge an Monteure zuweisen
- **Tagesreport**: Übersicht über Tagesgeschäft
- **Umsatzbestätigung**: Gemeldete Umsätze prüfen
- **Nutzerverwaltung**: Rollen verwalten

## 🔗 n8n-Integration

### Webhook-Struktur:
```javascript
// Basis-URL: https://your-n8n-instance.com/webhook
{
  agent: '/amp-agent',
  monteur: '/amp-monteur', 
  admin: '/amp-admin'
}
```

### Datenformat:
```javascript
{
  context: {
    userID: "123456789",
    role: "agent",
    userName: "Max Mustermann",
    timestamp: "2024-01-01T12:00:00.000Z",
    endpoint: "agent",
    action: "create_order"
  },
  data: {
    // Spezifische Daten je nach Aktion
  }
}
```

### Verfügbare Aktionen:

#### Agent:
- `create_order` - Auftrag erstellen
- `search_order` - Auftrag suchen
- `report_complaint` - Beschwerde melden

#### Monteur:
- `get_assigned_orders` - Zugewiesene Aufträge abrufen
- `report_revenue` - Umsatz melden
- `update_order_status` - Status aktualisieren

#### Admin:
- `get_all_orders` - Alle Aufträge abrufen
- `accept_order` - Auftrag annehmen
- `cancel_order` - Auftrag stornieren
- `assign_monteur` - Monteur zuweisen
- `get_daily_report` - Tagesreport
- `confirm_revenue` - Umsatz bestätigen

## 🎨 Design-System

### Farbpalette:
- **Primary**: `#2563eb` (Blau)
- **Success**: `#10b981` (Grün)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Rot)
- **Secondary**: `#64748b` (Grau)

### Komponenten:
- **Buttons**: Primary, Secondary, Success, Warning, Error
- **Cards**: Header, Body, Footer
- **Forms**: Validation, Error States
- **Modals**: Responsive, Keyboard Navigation
- **Navigation**: Mobile Toggle, Active States
- **Notifications**: Success, Error, Warning, Info

### Responsive Breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🚀 Setup & Installation

### 1. Dateien bereitstellen:
```bash
# Alle Dateien in Web-Server-Verzeichnis kopieren
# Struktur wie oben beschrieben beibehalten
```

### 2. n8n-Konfiguration:
```javascript
// In shared/utils/n8n.js anpassen:
this.baseUrl = 'https://your-n8n-instance.com/webhook';
```

### 3. Rollen konfigurieren:
```json
// shared/config/roles.json bearbeiten
{
  "TELEGRAM_USER_ID": "rolle"
}
```

### 4. Telegram WebApp:
- Apps als Telegram WebApp einrichten
- URLs zu den jeweiligen index.html-Dateien

## 📱 Telegram WebApp Integration

### Features:
- **Auto-Expand**: Apps füllen vollständigen Bildschirm
- **Main Button**: Kontextuelle Aktionen
- **Theme Colors**: Anpassung an Telegram-Theme
- **Haptic Feedback**: Vibration bei Aktionen
- **User Data**: Automatische Benutzer-Identifikation

### Beispiel-Integration:
```javascript
// Telegram WebApp initialisieren
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Main Button konfigurieren
Telegram.WebApp.MainButton.setText('Auftrag erstellen');
Telegram.WebApp.MainButton.show();
```

## 🔧 Entwicklung

### Nächste Schritte:
1. **Admin-App erstellen** (ähnlich wie Agent/Monteur)
2. **n8n-Workflows** für alle Aktionen implementieren
3. **Datenbank-Schema** für Aufträge definieren
4. **Testing** mit echten Telegram-Bots
5. **Deployment** auf Produktions-Server

### Erweiterungsmöglichkeiten:
- **Push-Notifications** über Telegram
- **Offline-Funktionalität** mit Service Workers
- **Foto-Komprimierung** für bessere Performance
- **Daten-Synchronisation** zwischen Apps
- **Reporting-Dashboard** für Admins

## 🛠️ Technische Details

### Browser-Kompatibilität:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Dependencies:
- Telegram WebApp SDK
- Moderne Browser-APIs (Fetch, File API)
- CSS Grid & Flexbox
- ES6+ JavaScript

### Performance:
- Lazy Loading für Bilder
- Optimierte CSS-Animationen
- Minimale JavaScript-Bundles
- Responsive Images

## 📞 Support

Bei Fragen oder Problemen:
1. Konsole auf Fehler prüfen
2. Netzwerk-Tab für n8n-Kommunikation
3. Telegram WebApp Debug-Modus
4. Rollen-Konfiguration validieren

---

**Status**: Grundgerüst für Agent und Monteur ✅ | Admin-App ausstehend ⏳
**Version**: 1.0.0-beta
**Letzte Aktualisierung**: Januar 2024