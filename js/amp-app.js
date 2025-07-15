Telegram.WebApp.ready();

// Legacy function - wird durch amp-enhanced.js ersetzt
// Temporäre Kompatibilität für bestehende Buttons
async function sendToWebhook(endpoint, data, successMsg, errorMsg) {
  if (window.ampEnhanced) {
    // Neue Enhanced-Funktion verwenden
    try {
      await window.ampEnhanced.sendToN8N(endpoint, data, {
        successMessage: successMsg,
        errorMessage: errorMsg
      });
    } catch (error) {
      console.error('Enhanced webhook failed, falling back to legacy:', error);
      // Fallback zur alten Methode
      return legacySendToWebhook(endpoint, data, successMsg, errorMsg);
    }
  } else {
    return legacySendToWebhook(endpoint, data, successMsg, errorMsg);
  }
}

// Alte Funktion als Fallback
async function legacySendToWebhook(endpoint, data, successMsg, errorMsg) {
  try {
    const baseUrl = window.AMP_CONFIG?.n8n?.baseUrl || 'https://amp-telegram.app.n8n.cloud';
    const res = await fetch(`${baseUrl}/webhook/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
      Telegram.WebApp.showAlert(successMsg);
    } else {
      Telegram.WebApp.showAlert(errorMsg + (result.message || res.statusText));
    }
  } catch (err) {
    Telegram.WebApp.showAlert('❌ Verbindungsfehler: ' + err.message);
  }
}

// Auftrag absenden
document.getElementById('auftragButton')?.addEventListener('click', () => {
  const data = {
    name: document.getElementById('name').value,
    address: document.getElementById('address').value,
    zip: document.getElementById('zip').value,
    city: document.getElementById('city').value,
    country: document.getElementById('country').value,
    phone: document.getElementById('phone').value,
    branch: document.getElementById('branch').value,
    description: document.getElementById('description').value,
    preferred_time: document.getElementById('preferred_time').value,
    comments: document.getElementById('comments').value
  };
  sendToWebhook('orders', data, '✅ Auftrag gesendet!', '❌ Fehler beim Auftrag: ');
});

// Umsatz melden
document.getElementById('umsatzButton')?.addEventListener('click', () => {
  const data = {
    auftragsnummer: document.getElementById('umsatz_auftragsnummer').value,
    betrag: document.getElementById('betrag').value,
    zahlungsart: document.getElementById('zahlungsart').value,
    land: document.getElementById('umsatz_land').value,
    branche: document.getElementById('umsatz_branche').value,
    monteur: document.getElementById('monteur').value,
    file: document.getElementById('file').value,
    plz: document.getElementById('plz').value,
    kunde: document.getElementById('kunde').value,
    beschreibung: document.getElementById('beschreibung').value
  };
  sendToWebhook('revenue', data, '✅ Umsatz gemeldet!', '❌ Fehler bei Umsatzmeldung: ');
});

// Monteur zuweisen
document.getElementById('monteurZuweisenButton')?.addEventListener('click', () => {
  const data = {
    auftragsnummer: document.getElementById('zuweisung_auftragsnummer').value,
    monteur: document.getElementById('zuweisung_monteur').value,
    land: document.getElementById('zuweisung_land').value
  };
  sendToWebhook('monteur', data, '✅ Monteur zugewiesen!', '❌ Fehler bei Zuweisung: ');
});

// Status ändern
document.getElementById('statusAendernButton')?.addEventListener('click', () => {
  const data = {
    auftragsnummer: document.getElementById('status_auftragsnummer').value,
    neuer_status: document.getElementById('neuer_status').value,
    land: document.getElementById('status_land').value
  };
  sendToWebhook('status', data, '✅ Status geändert!', '❌ Fehler bei Statusänderung: ');
});

// Report abrufen
document.getElementById('reportButton')?.addEventListener('click', () => {
  const baseUrl = window.AMP_CONFIG?.n8n?.baseUrl || 'https://amp-telegram.app.n8n.cloud';
  const reportUrl = `${baseUrl}/webhook/amp-report`;
  
  fetch(reportUrl)
    .then(r => r.ok
      ? Telegram.WebApp.showAlert('📊 Report wird gesendet!')
      : Telegram.WebApp.showAlert('❌ Fehler beim Reportabruf.'));
});

// Initialize Enhanced Features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AMP Enhanced if available
    if (window.AMP_CONFIG && window.AMPEnhanced) {
        window.ampEnhanced = new AMPEnhanced();
        console.log('✅ AMP Enhanced initialized successfully');
    } else {
        console.warn('⚠️ AMP Enhanced not available, using legacy functions');
        
        // Check if config is loaded
        if (!window.AMP_CONFIG) {
            console.error('❌ AMP_CONFIG not found. Make sure config.js is loaded.');
        }
        
        // Check if enhanced script is loaded
        if (!window.AMPEnhanced) {
            console.error('❌ AMPEnhanced not found. Make sure amp-enhanced.js is loaded.');
        }
    }
});

// Fallback for Telegram Web App environment
if (window.Telegram?.WebApp) {
    // Initialize when Telegram Web App is ready
    Telegram.WebApp.ready();
    
    // Additional initialization after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.ampEnhanced) {
                    console.log('✅ AMP Enhanced ready in Telegram Web App');
                }
            }, 100);
        });
    }
}
