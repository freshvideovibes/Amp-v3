/**
 * AMP Agent Application
 * Handles order creation, search, and complaint reporting
 */

class AgentApp {
    constructor() {
        this.currentSection = 'create-order';
        this.searchResults = [];
        this.init();
    }

    init() {
        // Wait for authentication before initializing app
        document.addEventListener('userAuthenticated', (event) => {
            const { user, role } = event.detail;
            
            // Verify agent role
            if (role !== 'agent') {
                this.showUnauthorizedMessage();
                return;
            }
            
            this.currentUser = user;
            this.initializeApp();
        });
    }

    initializeApp() {
        console.log('Initializing Agent App for user:', this.currentUser);
        
        // Initialize navigation
        this.initNavigation();
        
        // Initialize forms
        this.initForms();
        
        // Load user profile
        this.loadUserProfile();
        
        // Show welcome message
        this.showWelcomeMessage();
    }

    showUnauthorizedMessage() {
        document.body.innerHTML = `
            <div class="unauthorized-container">
                <div class="unauthorized-card">
                    <div class="warning-icon">⚠️</div>
                    <h2>Zugriff verweigert</h2>
                    <p>Diese Anwendung ist nur für Agenten verfügbar.</p>
                    <p>Bitte wende dich an den Administrator.</p>
                </div>
            </div>
        `;
    }

    initNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-tab');
                if (targetSection) {
                    this.showSection(targetSection);
                }
            });
        });

        // Handle mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const navMenu = document.querySelector('.nav-menu');
                navMenu.classList.toggle('active');
            });
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${sectionId}"]`).classList.add('active');

        // Close mobile menu
        document.querySelector('.nav-menu').classList.remove('active');
    }

    initForms() {
        // Order form
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmit(orderForm);
            });
        }

        // Search form
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearchSubmit(searchForm);
            });
        }

        // Clear search button
        const clearSearchBtn = document.getElementById('clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Complaint form
        const complaintForm = document.getElementById('complaint-form');
        if (complaintForm) {
            complaintForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleComplaintSubmit(complaintForm);
            });
        }
    }

    async handleOrderSubmit(form) {
        try {
            // Validate form
            const errors = window.ui.validateForm(form);
            if (errors.length > 0) {
                this.showErrors(errors);
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const orderData = {
                customerName: formData.get('customerName'),
                customerPhone: formData.get('customerPhone'),
                customerEmail: formData.get('customerEmail'),
                customerZip: formData.get('customerZip'),
                customerAddress: formData.get('customerAddress'),
                orderDescription: formData.get('orderDescription'),
                preferredDate: formData.get('preferredDate'),
                preferredTime: formData.get('preferredTime'),
                priority: formData.get('priority'),
                notes: formData.get('notes'),
                createdAt: new Date().toISOString(),
                agentId: this.currentUser.id,
                agentName: this.currentUser.first_name
            };

            // Send to n8n
            const result = await window.n8nManager.createOrder(orderData);
            
            // Show success message
            this.showSuccessMessage('Auftrag erfolgreich erstellt!', `Auftrags-ID: ${result.orderId || 'Wird generiert'}`);
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Error creating order:', error);
            this.showErrorMessage('Fehler beim Erstellen des Auftrags. Bitte versuchen Sie es erneut.');
        }
    }

    async handleSearchSubmit(form) {
        try {
            // Get search criteria
            const formData = new FormData(form);
            const searchData = {
                orderId: formData.get('orderId'),
                customerName: formData.get('customerName'),
                customerPhone: formData.get('customerPhone'),
                customerZip: formData.get('customerZip'),
                dateFrom: formData.get('dateFrom'),
                dateTo: formData.get('dateTo')
            };

            // Remove empty values
            Object.keys(searchData).forEach(key => {
                if (!searchData[key]) {
                    delete searchData[key];
                }
            });

            if (Object.keys(searchData).length === 0) {
                this.showErrorMessage('Bitte geben Sie mindestens ein Suchkriterium ein.');
                return;
            }

            // Send search request to n8n
            const results = await window.n8nManager.searchOrder(searchData);
            
            // Display results
            this.displaySearchResults(results);
            
        } catch (error) {
            console.error('Error searching orders:', error);
            this.showErrorMessage('Fehler beim Suchen der Aufträge. Bitte versuchen Sie es erneut.');
        }
    }

    async handleComplaintSubmit(form) {
        try {
            // Validate form
            const errors = window.ui.validateForm(form);
            if (errors.length > 0) {
                this.showErrors(errors);
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const complaintData = {
                complaintType: formData.get('complaintType'),
                orderId: formData.get('orderId'),
                customerName: formData.get('customerName'),
                description: formData.get('description'),
                urgency: formData.get('urgency'),
                reportedAt: new Date().toISOString(),
                agentId: this.currentUser.id,
                agentName: this.currentUser.first_name
            };

            // Send to n8n
            await window.n8nManager.reportComplaint(complaintData);
            
            // Show success message
            this.showSuccessMessage('Beschwerde erfolgreich gemeldet!', 'Das Team wird sich umgehend darum kümmern.');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Error reporting complaint:', error);
            this.showErrorMessage('Fehler beim Melden der Beschwerde. Bitte versuchen Sie es erneut.');
        }
    }

    displaySearchResults(results) {
        const searchResultsContainer = document.getElementById('search-results');
        const resultsContainer = document.getElementById('results-container');
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <h3>Keine Ergebnisse gefunden</h3>
                    <p>Versuchen Sie es mit anderen Suchkriterien.</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = results.map(order => `
                <div class="search-result-item animate-slide-up">
                    <div class="result-header">
                        <div class="result-id">${order.id || 'N/A'}</div>
                        <div class="result-status ${order.status || 'pending'}">${this.getStatusText(order.status)}</div>
                    </div>
                    <div class="result-details">
                        <div class="result-detail">
                            <div class="result-detail-label">Kunde</div>
                            <div class="result-detail-value">${order.customerName || 'N/A'}</div>
                        </div>
                        <div class="result-detail">
                            <div class="result-detail-label">Telefon</div>
                            <div class="result-detail-value">${order.customerPhone || 'N/A'}</div>
                        </div>
                        <div class="result-detail">
                            <div class="result-detail-label">PLZ</div>
                            <div class="result-detail-value">${order.customerZip || 'N/A'}</div>
                        </div>
                        <div class="result-detail">
                            <div class="result-detail-label">Datum</div>
                            <div class="result-detail-value">${order.createdAt ? window.ui.formatDate(order.createdAt) : 'N/A'}</div>
                        </div>
                        <div class="result-detail">
                            <div class="result-detail-label">Priorität</div>
                            <div class="result-detail-value priority-${order.priority || 'normal'}">${this.getPriorityText(order.priority)}</div>
                        </div>
                    </div>
                    ${order.orderDescription ? `
                        <div class="result-description">
                            <strong>Beschreibung:</strong> ${order.orderDescription}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
        
        searchResultsContainer.style.display = 'block';
        searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'Ausstehend',
            approved: 'Genehmigt',
            assigned: 'Zugewiesen',
            in_progress: 'In Bearbeitung',
            completed: 'Abgeschlossen',
            cancelled: 'Storniert'
        };
        return statusMap[status] || 'Unbekannt';
    }

    getPriorityText(priority) {
        const priorityMap = {
            normal: 'Normal',
            urgent: 'Dringend',
            emergency: 'Notfall'
        };
        return priorityMap[priority] || 'Normal';
    }

    clearSearch() {
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.reset();
        }
        
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    loadUserProfile() {
        const userInfoContainer = document.getElementById('user-info');
        if (userInfoContainer && this.currentUser) {
            userInfoContainer.innerHTML = `
                <div class="user-detail">
                    <div class="user-detail-icon">👤</div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Name</div>
                        <div class="user-detail-value">${this.currentUser.first_name} ${this.currentUser.last_name || ''}</div>
                    </div>
                </div>
                <div class="user-detail">
                    <div class="user-detail-icon">🆔</div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Benutzer-ID</div>
                        <div class="user-detail-value">${this.currentUser.id}</div>
                    </div>
                </div>
                <div class="user-detail">
                    <div class="user-detail-icon">👥</div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Rolle</div>
                        <div class="user-detail-value">Agent</div>
                    </div>
                </div>
                <div class="user-detail">
                    <div class="user-detail-icon">📱</div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Benutzername</div>
                        <div class="user-detail-value">@${this.currentUser.username || 'N/A'}</div>
                    </div>
                </div>
            `;
        }
    }

    showWelcomeMessage() {
        const userName = this.currentUser?.first_name || 'Agent';
        window.ui.showNotification(
            `Willkommen, ${userName}! Sie sind als Agent angemeldet.`,
            'success',
            3000
        );
    }

    showSuccessMessage(title, message) {
        const container = document.querySelector(`#${this.currentSection} .card-body`);
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="icon">✅</div>
            <div>
                <strong>${title}</strong><br>
                ${message}
            </div>
        `;
        
        container.insertBefore(successDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    showErrorMessage(message) {
        const container = document.querySelector(`#${this.currentSection} .card-body`);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="icon">❌</div>
            <div>${message}</div>
        `;
        
        container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showErrors(errors) {
        const errorMessage = errors.join('<br>');
        this.showErrorMessage(errorMessage);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agentApp = new AgentApp();
});

// Handle Telegram WebApp events
if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    
    // Handle main button
    Telegram.WebApp.MainButton.setText('Auftrag erstellen');
    Telegram.WebApp.MainButton.show();
    Telegram.WebApp.MainButton.onClick(() => {
        if (window.agentApp) {
            window.agentApp.showSection('create-order');
        }
    });
}