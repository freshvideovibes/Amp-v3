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
  sendToWebhook('amp-miniapp', data, '✅ Auftrag gesendet!', '❌ Fehler beim Auftrag: ');
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
  sendToWebhook('amp-umsatz', data, '✅ Umsatz gemeldet!', '❌ Fehler bei Umsatzmeldung: ');
});

// Monteur zuweisen
document.getElementById('monteurZuweisenButton')?.addEventListener('click', () => {
  const data = {
    auftragsnummer: document.getElementById('zuweisung_auftragsnummer').value,
    monteur: document.getElementById('zuweisung_monteur').value,
    land: document.getElementById('zuweisung_land').value
  };
  sendToWebhook('amp-monteur', data, '✅ Monteur zugewiesen!', '❌ Fehler bei Zuweisung: ');
});

// Status ändern
document.getElementById('statusAendernButton')?.addEventListener('click', () => {
  const data = {
    auftragsnummer: document.getElementById('status_auftragsnummer').value,
    neuer_status: document.getElementById('neuer_status').value,
    land: document.getElementById('status_land').value
  };
  sendToWebhook('amp-status', data, '✅ Status geändert!', '❌ Fehler bei Statusänderung: ');
});

// Report abrufen
document.getElementById('reportButton')?.addEventListener('click', () => {
  fetch('https://DEIN-N8N-SERVER/webhook/report')
    .then(r => r.ok
      ? Telegram.WebApp.showAlert('📊 Report wird gesendet!')
      : Telegram.WebApp.showAlert('❌ Fehler beim Reportabruf.'));
});
