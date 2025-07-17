/**
 * AMP Monteur Application
 * Handles assigned orders, revenue reporting, and status updates
 */

class MonteurApp {
    constructor() {
        this.currentSection = 'assigned-orders';
        this.assignedOrders = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // Wait for authentication before initializing app
        document.addEventListener('userAuthenticated', (event) => {
            const { user, role } = event.detail;
            
            // Verify monteur role
            if (role !== 'monteur') {
                this.showUnauthorizedMessage();
                return;
            }
            
            this.currentUser = user;
            this.initializeApp();
        });
    }

    initializeApp() {
        console.log('Initializing Monteur App for user:', this.currentUser);
        
        // Initialize navigation
        this.initNavigation();
        
        // Initialize forms
        this.initForms();
        
        // Initialize filters
        this.initFilters();
        
        // Load assigned orders
        this.loadAssignedOrders();
        
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
                    <p>Diese Anwendung ist nur für Monteure verfügbar.</p>
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

        // Load data if needed
        if (sectionId === 'assigned-orders') {
            this.loadAssignedOrders();
        } else if (sectionId === 'revenue-report' || sectionId === 'status-update') {
            this.populateOrderSelects();
        }
    }

    initForms() {
        // Revenue form
        const revenueForm = document.getElementById('revenue-form');
        if (revenueForm) {
            revenueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRevenueSubmit(revenueForm);
            });

            // Photo upload preview
            const photoInput = revenueForm.querySelector('input[name="photo"]');
            if (photoInput) {
                photoInput.addEventListener('change', (e) => {
                    this.handlePhotoPreview(e.target);
                });
            }
        }

        // Status form
        const statusForm = document.getElementById('status-form');
        if (statusForm) {
            statusForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStatusSubmit(statusForm);
            });
        }

        // Refresh orders button
        const refreshBtn = document.getElementById('refresh-orders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAssignedOrders();
            });
        }
    }

    initFilters() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Filter orders
        this.displayOrders();
    }

    async loadAssignedOrders() {
        try {
            const ordersContainer = document.getElementById('orders-container');
            ordersContainer.innerHTML = `
                <div class="orders-loading">
                    <div class="spinner"></div>
                    <p>Lade zugewiesene Aufträge...</p>
                </div>
            `;

            // Get assigned orders from n8n
            const orders = await window.n8nManager.getAssignedOrders();
            this.assignedOrders = orders || [];
            
            // Display orders
            this.displayOrders();
            
            // Update counts
            this.updateOrderCounts();
            
        } catch (error) {
            console.error('Error loading assigned orders:', error);
            this.showErrorMessage('Fehler beim Laden der Aufträge. Bitte versuchen Sie es erneut.');
        }
    }

    displayOrders() {
        const ordersContainer = document.getElementById('orders-container');
        
        // Filter orders
        let filteredOrders = this.assignedOrders;
        if (this.currentFilter !== 'all') {
            filteredOrders = this.assignedOrders.filter(order => 
                order.status === this.currentFilter
            );
        }

        if (filteredOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-orders">
                    <div class="icon">📋</div>
                    <h3>Keine Aufträge gefunden</h3>
                    <p>Es sind keine Aufträge für den ausgewählten Filter vorhanden.</p>
                </div>
            `;
            return;
        }

        // Display orders
        ordersContainer.innerHTML = filteredOrders.map(order => `
            <div class="order-card animate-fadeIn" onclick="window.monteurApp.showOrderDetails('${order.id}')">
                <div class="order-card-header">
                    <div class="order-id">${order.id}</div>
                    <div class="order-status ${order.status || 'pending'}">${this.getStatusText(order.status)}</div>
                </div>
                <div class="order-card-body">
                    <div class="order-detail">
                        <span class="order-detail-label">Kunde:</span>
                        <span class="order-detail-value">${order.customerName}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Telefon:</span>
                        <span class="order-detail-value">${order.customerPhone}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Adresse:</span>
                        <span class="order-detail-value">${order.customerAddress}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">PLZ:</span>
                        <span class="order-detail-value">${order.customerZip}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Priorität:</span>
                        <span class="order-detail-value priority-${order.priority || 'normal'}">${this.getPriorityText(order.priority)}</span>
                    </div>
                    ${order.preferredDate ? `
                        <div class="order-detail">
                            <span class="order-detail-label">Terminwunsch:</span>
                            <span class="order-detail-value">${window.ui.formatDate(order.preferredDate)}</span>
                        </div>
                    ` : ''}
                    ${order.orderDescription ? `
                        <div class="order-description">
                            ${order.orderDescription.substring(0, 100)}${order.orderDescription.length > 100 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateOrderCounts() {
        const counts = {
            all: this.assignedOrders.length,
            pending: this.assignedOrders.filter(o => o.status === 'pending').length,
            in_progress: this.assignedOrders.filter(o => o.status === 'in_progress').length,
            completed: this.assignedOrders.filter(o => o.status === 'completed').length
        };

        document.getElementById('count-all').textContent = counts.all;
        document.getElementById('count-pending').textContent = counts.pending;
        document.getElementById('count-in-progress').textContent = counts.in_progress;
        document.getElementById('count-completed').textContent = counts.completed;
    }

    showOrderDetails(orderId) {
        const order = this.assignedOrders.find(o => o.id === orderId);
        if (!order) return;

        const content = `
            <div class="order-details">
                <div class="order-detail">
                    <span class="order-detail-label">Auftrags-ID:</span>
                    <span class="order-detail-value">${order.id}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Status:</span>
                    <span class="order-detail-value">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Kunde:</span>
                    <span class="order-detail-value">${order.customerName}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Telefon:</span>
                    <span class="order-detail-value">${order.customerPhone}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">E-Mail:</span>
                    <span class="order-detail-value">${order.customerEmail || 'N/A'}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Adresse:</span>
                    <span class="order-detail-value">${order.customerAddress}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">PLZ:</span>
                    <span class="order-detail-value">${order.customerZip}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Priorität:</span>
                    <span class="order-detail-value priority-${order.priority || 'normal'}">${this.getPriorityText(order.priority)}</span>
                </div>
                ${order.preferredDate ? `
                    <div class="order-detail">
                        <span class="order-detail-label">Terminwunsch:</span>
                        <span class="order-detail-value">${window.ui.formatDate(order.preferredDate)} ${order.preferredTime || ''}</span>
                    </div>
                ` : ''}
                ${order.orderDescription ? `
                    <div class="order-detail">
                        <span class="order-detail-label">Beschreibung:</span>
                        <span class="order-detail-value">${order.orderDescription}</span>
                    </div>
                ` : ''}
                ${order.notes ? `
                    <div class="order-detail">
                        <span class="order-detail-label">Notizen:</span>
                        <span class="order-detail-value">${order.notes}</span>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('order-detail-content').innerHTML = content;
        window.ui.openModal('order-detail-modal');
    }

    populateOrderSelects() {
        const revenueSelect = document.querySelector('#revenue-form select[name="orderId"]');
        const statusSelect = document.querySelector('#status-form select[name="orderId"]');

        const options = this.assignedOrders.map(order => 
            `<option value="${order.id}">${order.id} - ${order.customerName}</option>`
        ).join('');

        if (revenueSelect) {
            revenueSelect.innerHTML = '<option value="">Auftrag auswählen...</option>' + options;
        }

        if (statusSelect) {
            statusSelect.innerHTML = '<option value="">Auftrag auswählen...</option>' + options;
        }
    }

    async handleRevenueSubmit(form) {
        try {
            // Validate form
            const errors = window.ui.validateForm(form);
            if (errors.length > 0) {
                this.showErrors(errors);
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const revenueData = {
                orderId: formData.get('orderId'),
                revenue: parseFloat(formData.get('revenue')),
                paymentMethod: formData.get('paymentMethod'),
                workHours: formData.get('workHours') ? parseFloat(formData.get('workHours')) : null,
                materials: formData.get('materials'),
                comments: formData.get('comments'),
                reportedAt: new Date().toISOString(),
                monteurId: this.currentUser.id,
                monteurName: this.currentUser.first_name
            };

            // Handle photo upload
            const photoFile = formData.get('photo');
            if (photoFile && photoFile.size > 0) {
                // Convert to base64 for n8n
                const photoBase64 = await this.fileToBase64(photoFile);
                revenueData.photo = {
                    data: photoBase64,
                    filename: photoFile.name,
                    mimetype: photoFile.type
                };
            }

            // Send to n8n
            await window.n8nManager.reportRevenue(revenueData);
            
            // Show success message
            this.showSuccessMessage('Umsatz erfolgreich gemeldet!', 'Die Meldung wurde an das Team übermittelt.');
            
            // Reset form
            form.reset();
            this.clearPhotoPreview();
            
            // Refresh orders
            this.loadAssignedOrders();
            
        } catch (error) {
            console.error('Error reporting revenue:', error);
            this.showErrorMessage('Fehler beim Melden des Umsatzes. Bitte versuchen Sie es erneut.');
        }
    }

    async handleStatusSubmit(form) {
        try {
            // Validate form
            const errors = window.ui.validateForm(form);
            if (errors.length > 0) {
                this.showErrors(errors);
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const statusData = {
                orderId: formData.get('orderId'),
                status: formData.get('status'),
                scheduledDate: formData.get('scheduledDate'),
                scheduledTime: formData.get('scheduledTime'),
                comment: formData.get('comment'),
                updatedAt: new Date().toISOString(),
                monteurId: this.currentUser.id,
                monteurName: this.currentUser.first_name
            };

            // Send to n8n
            await window.n8nManager.updateOrderStatus(statusData);
            
            // Show success message
            this.showSuccessMessage('Status erfolgreich aktualisiert!', 'Die Änderung wurde gespeichert.');
            
            // Reset form
            form.reset();
            
            // Refresh orders
            this.loadAssignedOrders();
            
        } catch (error) {
            console.error('Error updating status:', error);
            this.showErrorMessage('Fehler beim Aktualisieren des Status. Bitte versuchen Sie es erneut.');
        }
    }

    handlePhotoPreview(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                let preview = input.parentElement.querySelector('.photo-preview');
                if (!preview) {
                    preview = document.createElement('div');
                    preview.className = 'photo-preview';
                    input.parentElement.appendChild(preview);
                }
                preview.innerHTML = `<img src="${e.target.result}" alt="Foto Vorschau">`;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    clearPhotoPreview() {
        const preview = document.querySelector('.photo-preview');
        if (preview) {
            preview.remove();
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'Ausstehend',
            accepted: 'Angenommen',
            in_progress: 'In Bearbeitung',
            on_hold: 'Pausiert',
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
                        <div class="user-detail-value">Monteur</div>
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

        // Load statistics
        this.loadUserStatistics();
    }

    loadUserStatistics() {
        const statsContainer = document.getElementById('user-stats');
        if (statsContainer) {
            const stats = this.calculateStatistics();
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-icon">📋</div>
                    <div class="stat-content">
                        <div class="stat-label">Zugewiesene Aufträge</div>
                        <div class="stat-value">${stats.totalOrders}</div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <div class="stat-label">Abgeschlossene Aufträge</div>
                        <div class="stat-value">${stats.completedOrders}</div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-content">
                        <div class="stat-label">In Bearbeitung</div>
                        <div class="stat-value">${stats.inProgressOrders}</div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-content">
                        <div class="stat-label">Ausstehend</div>
                        <div class="stat-value">${stats.pendingOrders}</div>
                    </div>
                </div>
            `;
        }
    }

    calculateStatistics() {
        return {
            totalOrders: this.assignedOrders.length,
            completedOrders: this.assignedOrders.filter(o => o.status === 'completed').length,
            inProgressOrders: this.assignedOrders.filter(o => o.status === 'in_progress').length,
            pendingOrders: this.assignedOrders.filter(o => o.status === 'pending').length
        };
    }

    showWelcomeMessage() {
        const userName = this.currentUser?.first_name || 'Monteur';
        window.ui.showNotification(
            `Willkommen, ${userName}! Sie sind als Monteur angemeldet.`,
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
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    showErrorMessage(message) {
        const container = document.querySelector(`#${this.currentSection} .card-body`) || 
                         document.querySelector(`#${this.currentSection}`);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="icon">❌</div>
            <div>${message}</div>
        `;
        
        container.insertBefore(errorDiv, container.firstChild);
        
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
    window.monteurApp = new MonteurApp();
});

// Handle Telegram WebApp events
if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    
    // Handle main button
    Telegram.WebApp.MainButton.setText('Aufträge anzeigen');
    Telegram.WebApp.MainButton.show();
    Telegram.WebApp.MainButton.onClick(() => {
        if (window.monteurApp) {
            window.monteurApp.showSection('assigned-orders');
        }
    });
}