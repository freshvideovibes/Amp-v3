Telegram.WebApp.ready();

// Role-based UI Management
let currentUserRole = 'guest';
let currentUserPermissions = [];

// Global function to update UI based on user role
window.updateUIForRole = function(role, permissions) {
    currentUserRole = role;
    currentUserPermissions = permissions;
    
    console.log(`Updating UI for role: ${role}`, permissions);
    
    // Update role indicator
    updateRoleIndicator(role);
    
    // Show/hide sections based on role
    updateSectionVisibility(role, permissions);
    
    // Update form fields
    updateFormFields(role, permissions);
    
    // Update buttons
    updateButtonsVisibility(role, permissions);
};

function updateRoleIndicator(role) {
    const roleConfig = window.AMP_CONFIG?.roles?.definitions?.[role];
    if (!roleConfig) return;
    
    // Create or update role indicator
    let indicator = document.getElementById('roleIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'roleIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${roleConfig.color};
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = `👤 ${roleConfig.name}`;
    indicator.style.background = roleConfig.color;
}

function updateSectionVisibility(role, permissions) {
    // Agent permissions
    const agentSections = ['section-auftrag', 'section-suche', 'section-terminierung', 'section-wartezeit', 'section-beschwerden'];
    
    // Monteur permissions
    const monteurSections = ['section-umsatz', 'section-kommentare'];
    
    // Admin/Vergabe permissions
    const adminSections = ['section-auftrag', 'section-umsatz', 'section-monteur', 'section-status', 'section-suche', 'section-report'];
    
    // Hide all sections first
    document.querySelectorAll('[id^="section-"]').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show sections based on role
    let allowedSections = [];
    
    switch (role) {
        case 'agent':
            allowedSections = agentSections;
            break;
        case 'monteur':
            allowedSections = monteurSections;
            break;
        case 'admin':
        case 'vergabe':
            allowedSections = adminSections;
            break;
        case 'guest':
            // Show unauthorized message
            showUnauthorizedUI();
            return;
    }
    
    // Show allowed sections
    allowedSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    });
}

function updateFormFields(role, permissions) {
    // Make appointment field optional (not required)
    const appointmentField = document.getElementById('preferred_time');
    if (appointmentField) {
        appointmentField.removeAttribute('required');
    }
    
    // Add search functionality for different criteria
    addSearchCapabilities(role, permissions);
}

function updateButtonsVisibility(role, permissions) {
    // Update existing buttons
    const buttons = {
        'auftragButton': permissions.includes('create_order') || role === 'admin' || role === 'vergabe',
        'umsatzButton': permissions.includes('report_revenue') || role === 'admin' || role === 'vergabe',
        'monteurZuweisenButton': role === 'admin' || role === 'vergabe',
        'statusAendernButton': role === 'admin' || role === 'vergabe',
        'reportButton': role === 'admin' || role === 'vergabe'
    };
    
    Object.entries(buttons).forEach(([buttonId, shouldShow]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

function addSearchCapabilities(role, permissions) {
    if (permissions.includes('search_orders') || role === 'admin' || role === 'vergabe') {
        // Add search functionality
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            searchContainer.innerHTML = `
                <div class="search-section">
                    <h3>🔍 Auftragssuche</h3>
                    <div class="form-group">
                        <label>Suchkriterium:</label>
                        <select id="searchCriteria">
                            <option value="plz">PLZ</option>
                            <option value="name">Name</option>
                            <option value="date">Datum</option>
                            <option value="phone">Telefonnummer</option>
                            <option value="order_number">Auftragsnummer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Suchwert:</label>
                        <input type="text" id="searchValue" placeholder="Suchwert eingeben...">
                    </div>
                    <button id="searchButton" class="btn btn-primary">🔍 Suchen</button>
                    <div id="searchResults"></div>
                </div>
            `;
            
            // Add search event listener
            document.getElementById('searchButton').addEventListener('click', performSearch);
        }
    }
}

function showUnauthorizedUI() {
    // Hide all sections
    document.querySelectorAll('[id^="section-"]').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show unauthorized message
    const unauthorizedDiv = document.createElement('div');
    unauthorizedDiv.id = 'unauthorized-message';
    unauthorizedDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--ios-bg-secondary); border-radius: 12px; margin: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="color: var(--ios-text-primary); margin-bottom: 16px;">Nicht autorisiert</h2>
            <p style="color: var(--ios-text-secondary); margin-bottom: 20px;">
                Du bist nicht berechtigt, diese Anwendung zu verwenden.
            </p>
            <p style="color: var(--ios-text-tertiary); font-size: 14px;">
                Wende dich an den Administrator, um Zugriff zu erhalten.
            </p>
        </div>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.appendChild(unauthorizedDiv);
}

async function performSearch() {
    const criteria = document.getElementById('searchCriteria').value;
    const value = document.getElementById('searchValue').value;
    
    if (!value.trim()) {
        alert('Bitte einen Suchwert eingeben');
        return;
    }
    
    try {
        const searchData = {
            criteria: criteria,
            value: value.trim(),
            role: currentUserRole
        };
        
        await sendToWebhook('search', searchData, '🔍 Suche wird durchgeführt...', '❌ Fehler bei der Suche: ');
    } catch (error) {
        console.error('Search failed:', error);
    }
}

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

// Enhanced form submissions with role checking
function setupFormSubmissions() {
    // Auftrag absenden
    document.getElementById('auftragButton')?.addEventListener('click', () => {
        if (!currentUserPermissions.includes('create_order') && currentUserRole !== 'admin' && currentUserRole !== 'vergabe') {
            Telegram.WebApp.showAlert('❌ Keine Berechtigung für diese Aktion!');
            return;
        }
        
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
        if (!currentUserPermissions.includes('report_revenue') && currentUserRole !== 'admin' && currentUserRole !== 'vergabe') {
            Telegram.WebApp.showAlert('❌ Keine Berechtigung für diese Aktion!');
            return;
        }
        
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
        if (currentUserRole !== 'admin' && currentUserRole !== 'vergabe') {
            Telegram.WebApp.showAlert('❌ Keine Berechtigung für diese Aktion!');
            return;
        }
        
        const data = {
            auftragsnummer: document.getElementById('zuweisung_auftragsnummer').value,
            monteur: document.getElementById('zuweisung_monteur').value,
            land: document.getElementById('zuweisung_land').value
        };
        sendToWebhook('monteur', data, '✅ Monteur zugewiesen!', '❌ Fehler bei Zuweisung: ');
    });

    // Status ändern
    document.getElementById('statusAendernButton')?.addEventListener('click', () => {
        if (currentUserRole !== 'admin' && currentUserRole !== 'vergabe') {
            Telegram.WebApp.showAlert('❌ Keine Berechtigung für diese Aktion!');
            return;
        }
        
        const data = {
            auftragsnummer: document.getElementById('status_auftragsnummer').value,
            neuer_status: document.getElementById('neuer_status').value,
            land: document.getElementById('status_land').value
        };
        sendToWebhook('status', data, '✅ Status geändert!', '❌ Fehler bei Statusänderung: ');
    });

    // Report abrufen
    document.getElementById('reportButton')?.addEventListener('click', () => {
        if (currentUserRole !== 'admin' && currentUserRole !== 'vergabe') {
            Telegram.WebApp.showAlert('❌ Keine Berechtigung für diese Aktion!');
            return;
        }
        
        const baseUrl = window.AMP_CONFIG?.n8n?.baseUrl || 'https://amp-telegram.app.n8n.cloud';
        const reportUrl = `${baseUrl}/webhook/amp-report`;
        
        fetch(reportUrl)
            .then(r => r.ok
                ? Telegram.WebApp.showAlert('📊 Report wird gesendet!')
                : Telegram.WebApp.showAlert('❌ Fehler beim Reportabruf.'));
    });
}

// Initialize Enhanced Features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize form submissions
    setupFormSubmissions();
    
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
