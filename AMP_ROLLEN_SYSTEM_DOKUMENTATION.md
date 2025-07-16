# AMP Rollen-System Dokumentation

## 🎯 Überblick

Das AMP Rollen-System implementiert eine vollständige benutzerbasierte Zugriffskontrolle für die AuftragsManager Pro WebApp. Das System ist clientseitig implementiert und basiert auf Telegram-IDs zur Benutzerauthentifizierung.

## 👥 Benutzerrollen

### 1. **Admin** 
- **Farbe**: Rot (`#ff453a`)
- **Berechtigungen**: Vollzugriff auf alle Funktionen
- **Zugriff auf**:
  - ✅ Aufträge erstellen
  - ✅ Umsätze melden
  - ✅ Monteure zuweisen
  - ✅ Status ändern
  - ✅ Auftragssuche
  - ✅ Berichte abrufen
  - ✅ Terminierung
  - ✅ Wartezeit verwalten
  - ✅ Beschwerden bearbeiten
  - ✅ Kommentare hinzufügen

### 2. **Vergabe**
- **Farbe**: Orange (`#ff9f0a`)
- **Berechtigungen**: Vollzugriff (wie Admin)
- **Zugriff auf**: Alle Funktionen wie Admin

### 3. **Agent**
- **Farbe**: Blau (`#007aff`)
- **Berechtigungen**: Kundenorientierte Funktionen
- **Zugriff auf**:
  - ✅ Aufträge erstellen
  - ✅ Auftragssuche
  - ✅ Terminierung
  - ✅ Wartezeit verwalten
  - ✅ Beschwerden bearbeiten
  - ❌ Keine Umsatzmeldung
  - ❌ Keine Monteurzuweisung
  - ❌ Keine Statusänderung

### 4. **Monteur**
- **Farbe**: Grün (`#30d158`)
- **Berechtigungen**: Begrenzt auf eigene Aufträge
- **Zugriff auf**:
  - ✅ Umsätze melden
  - ✅ Kommentare hinzufügen
  - ✅ Nur eigene Aufträge einsehen
  - ❌ Keine Auftragserstellung
  - ❌ Keine Suche in allen Aufträgen

### 5. **Gast**
- **Farbe**: Grau (`#8e8e93`)
- **Berechtigungen**: Keine
- **Zugriff auf**: Fehlermeldung mit Telegram-ID

## 🔧 Konfiguration

### Rollen-Mapping in `config.js`

```javascript
const USER_ROLES = {
  "123456789": "admin",
  "987654321": "agent", 
  "555666777": "monteur",
  "111222333": "vergabe"
};
```

### Berechtigungen definieren

```javascript
roles: {
  definitions: {
    admin: {
      name: 'Administrator',
      permissions: ['all'],
      color: '#ff453a'
    },
    agent: {
      name: 'Agent',
      permissions: [
        'create_order', 
        'search_orders', 
        'schedule_appointment', 
        'manage_wait_time', 
        'handle_complaints'
      ],
      color: '#007aff'
    }
    // ... weitere Rollen
  }
}
```

## 📱 UI-Anpassungen

### Rollenindikator
- Wird automatisch oben rechts angezeigt
- Zeigt Rollenname und Rollenfarbe
- Beispiel: "👤 Administrator" (rot)

### Sektionen-Sichtbarkeit
- `section-auftrag`: Admin, Vergabe, Agent
- `section-umsatz`: Admin, Vergabe, Monteur
- `section-suche`: Admin, Vergabe, Agent
- `section-monteur`: Admin, Vergabe
- `section-status`: Admin, Vergabe
- `section-report`: Admin, Vergabe

### Responsive Design
- **Desktop (≥768px)**: Optimierte Layouts, breitere Formulare
- **Mobile (≤480px)**: Stapelbare Formulare, Vollbreite-Buttons
- **Tablet (768px-1024px)**: Hybrid-Layout

## 🔒 Sicherheitsfeatures

### Clientseitige Berechtigungsprüfung
```javascript
// Beispiel aus amp-enhanced.js
checkEndpointPermission(endpoint) {
  switch (endpoint) {
    case 'orders':
      return this.hasPermission('create_order');
    case 'revenue':
      return this.hasPermission('report_revenue');
    // ...
  }
}
```

### Serverseitige Validierung
- Alle N8N-Workflows prüfen `userContext.role`
- Zusätzliche Validierung der Telegram-ID
- Logging aller Aktionen mit Rollenbezug

## 📊 Neue Funktionen

### Erweiterte Auftragssuche
- **Suchkriterien**: PLZ, Name, Datum, Telefon, Auftragsnummer
- **Rollenfilter**: Monteure sehen nur eigene Aufträge
- **Ergebnisformat**: Strukturierte Telegram-Nachrichten

### Terminfeld (optional)
- `preferred_time` ist nicht mehr required
- Flexible Terminplanung
- Bessere Benutzerfreundlichkeit

### Täglicher Report (6:00 Uhr)
- Automatische Berichte für Admin/Vergabe
- Übersicht über heutige Termine
- Neue und terminierte Aufträge

## 🚀 N8N-Workflows

### 1. **amp-search-workflow.json**
- Rollenbasierte Auftragssuche
- Filtering nach Berechtigungen
- Structured results

### 2. **amp-daily-report-workflow.json**
- Automatischer 6:00 Uhr Report
- Terminübersicht
- Admin-Benachrichtigungen

### 3. **amp-role-based-order-workflow.json**
- Erweiterte Auftragserstellung
- Berechtigungsprüfung
- Monteur-Vorschläge

## 🎨 Design-Verbesserungen

### Dark Theme Integration
- iOS-ähnliche Farbpalette
- Konsistente Schatten und Rundungen
- Optimierte Kontraste

### Mobile Navigation
- Sticky Bottom Navigation
- Touch-optimierte Buttons
- Haptic Feedback Integration

### Loading States
- Spinner für Netzwerk-Requests
- Status-Indikatoren
- Offline-Anzeige

## 📦 Installation & Setup

### 1. Konfiguration anpassen
```javascript
// In config.js
roles: {
  users: {
    "DEINE_TELEGRAM_ID": "admin",
    "AGENT_TELEGRAM_ID": "agent",
    "MONTEUR_TELEGRAM_ID": "monteur"
  }
}
```

### 2. N8N-Workflows importieren
- `amp-search-workflow.json`
- `amp-daily-report-workflow.json`
- `amp-role-based-order-workflow.json`

### 3. Datenbank-Erweiterungen
```sql
-- Benutzertabelle
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telegram_id VARCHAR(50) UNIQUE,
  role ENUM('admin', 'agent', 'monteur', 'vergabe', 'guest'),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erweiterte Auftrags-Tabelle
ALTER TABLE orders ADD COLUMN created_by_role VARCHAR(20);
ALTER TABLE orders ADD COLUMN assigned_monteur VARCHAR(50);
```

## 🔄 Workflow-Beschreibungen

### Auftragssuche
1. **Input**: Suchkriterium + Wert + Rolle
2. **Verarbeitung**: Rollenbasierte Datenbankabfrage
3. **Output**: Gefilterte Ergebnisse + Telegram-Benachrichtigung

### Täglicher Report
1. **Trigger**: Cron-Job (6:00 Uhr) oder manuell
2. **Verarbeitung**: Heutige Termine + neue Aufträge
3. **Output**: Formatierter Bericht an alle Admins

### Rollenbasierte Aufträge
1. **Input**: Auftragsdaten + Benutzerkontext
2. **Validierung**: Berechtigungsprüfung
3. **Verarbeitung**: Speicherung + Monteur-Vorschläge
4. **Output**: Bestätigung + Admin-Benachrichtigung

## 📝 Troubleshooting

### Häufige Probleme

1. **"Nicht registriert" Fehler**
   - Telegram-ID in `config.js` hinzufügen
   - Cache leeren und neu laden

2. **UI-Elemente nicht sichtbar**
   - `updateUIForRole()` prüfen
   - Browser-Konsole auf Fehler überprüfen

3. **N8N-Workflow Fehler**
   - Datenbankverbindung prüfen
   - Webhook-URLs validieren
   - Telegram-Bot-Token konfigurieren

### Debug-Modus
```javascript
// In Browser-Konsole
console.log('Current role:', window.ampEnhanced.userRole);
console.log('Permissions:', window.ampEnhanced.getUserPermissions());
```

## 🔮 Zukünftige Erweiterungen

### Geplante Features
- **Mehrstufige Berechtigungen**: Granularere Kontrolle
- **Zeitbasierte Rollen**: Schichtsystem
- **Approval-Workflows**: Mehrstufige Genehmigungen
- **Audit-Logging**: Detaillierte Aktivitätsprotokolle
- **Role-Management UI**: Grafische Rollenverwaltung

### Performance-Optimierungen
- **Caching**: Rollen-basierte Daten-Caches
- **Lazy Loading**: Bedarfsgerechtes Laden von Sektionen
- **Offline-Sync**: Erweiterte Offline-Funktionalität

---

**Version**: 3.0.0  
**Letzte Aktualisierung**: $(date)  
**Autor**: Goldfinger Solutions  
**Lizenz**: Proprietär