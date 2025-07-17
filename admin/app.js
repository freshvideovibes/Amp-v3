// AMP Admin JavaScript

// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');

// Initialize the admin app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeEventHandlers();
    updateDashboardStats();
    console.log('AMP Admin Dashboard initialized');
});

// Navigation functionality
function initializeNavigation() {
    // Toggle mobile navigation
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Navigation tab switching
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.getAttribute('data-tab');
            if (targetTab) {
                showTab(targetTab);
                updateActiveNavLink(this);
            }
        });
    });
}

// Show specific tab
function showTab(tabName) {
    // Hide all content sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(tabName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Close mobile menu
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}

// Update active navigation link
function updateActiveNavLink(activeLink) {
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Initialize event handlers
function initializeEventHandlers() {
    // Filter functionality
    initializeFilters();
    
    // Monteur assignment functionality
    initializeMonteurAssignment();
    
    // Report generation
    initializeReports();
    
    // Order management
    initializeOrderManagement();
}

// Filter functionality for orders
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const cityFilter = document.getElementById('cityFilter');
    const searchInput = document.getElementById('searchInput');
    const filterButton = document.querySelector('.filters .btn-primary');

    if (filterButton) {
        filterButton.addEventListener('click', function() {
            applyFilters();
        });
    }

    // Real-time search
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            debounce(applyFilters, 300)();
        });
    }
}

// Apply filters to order list
function applyFilters() {
    const statusValue = document.getElementById('statusFilter')?.value || '';
    const cityValue = document.getElementById('cityFilter')?.value || '';
    const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';

    console.log('Applying filters:', { statusValue, cityValue, searchValue });
    
    // Here you would typically filter the actual data
    // For now, we'll just show a console message
    showNotification('Filter angewendet', 'success');
}

// Monteur assignment functionality
function initializeMonteurAssignment() {
    // Assignment buttons
    const assignButtons = document.querySelectorAll('.btn-success');
    assignButtons.forEach(button => {
        if (button.textContent.includes('Zuweisen')) {
            button.addEventListener('click', function() {
                const orderRow = this.closest('.table-row');
                if (orderRow) {
                    const orderNumber = orderRow.querySelector('strong')?.textContent || '';
                    assignMonteur(orderNumber);
                }
            });
        }
    });

    // Monteur assignment cards
    const monteurCards = document.querySelectorAll('.monteur-card');
    monteurCards.forEach(card => {
        const assignBtn = card.querySelector('.btn-primary');
        if (assignBtn && assignBtn.textContent.includes('Zuweisen')) {
            assignBtn.addEventListener('click', function() {
                const monteurName = card.querySelector('h4')?.textContent || '';
                openAssignmentModal(monteurName);
            });
        }
    });
}

// Assign monteur to order
function assignMonteur(orderNumber) {
    console.log(`Assigning monteur to order: ${orderNumber}`);
    showNotification(`Monteur wird zu Auftrag ${orderNumber} zugewiesen`, 'info');
    
    // Simulate API call
    setTimeout(() => {
        showNotification(`Auftrag ${orderNumber} erfolgreich zugewiesen`, 'success');
        updateDashboardStats();
    }, 1500);
}

// Open assignment modal (placeholder)
function openAssignmentModal(monteurName) {
    console.log(`Opening assignment modal for: ${monteurName}`);
    showNotification(`Auftragszuweisung für ${monteurName} wird geöffnet`, 'info');
}

// Report generation
function initializeReports() {
    const reportButton = document.querySelector('.report-filters .btn-primary');
    if (reportButton) {
        reportButton.addEventListener('click', function() {
            generateReport();
        });
    }
}

// Generate report
function generateReport() {
    const timeRange = document.querySelector('.report-filters select:first-child')?.value || '';
    const reportType = document.querySelector('.report-filters select:last-child')?.value || '';
    
    console.log('Generating report:', { timeRange, reportType });
    showNotification('Bericht wird erstellt...', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showNotification('Bericht erfolgreich erstellt', 'success');
    }, 2000);
}

// Order management
function initializeOrderManagement() {
    // View order buttons
    const viewButtons = document.querySelectorAll('.btn-primary');
    viewButtons.forEach(button => {
        if (button.textContent.includes('Anzeigen')) {
            button.addEventListener('click', function() {
                const orderRow = this.closest('.table-row');
                if (orderRow) {
                    const orderNumber = orderRow.querySelector('strong')?.textContent || '';
                    viewOrderDetails(orderNumber);
                }
            });
        }
    });

    // Contact buttons
    const contactButtons = document.querySelectorAll('.btn-warning');
    contactButtons.forEach(button => {
        if (button.textContent.includes('Kontakt')) {
            button.addEventListener('click', function() {
                const orderRow = this.closest('.table-row');
                if (orderRow) {
                    const customerName = orderRow.querySelector('.table-cell:nth-child(2) div')?.textContent || '';
                    contactCustomer(customerName);
                }
            });
        }
    });
}

// View order details
function viewOrderDetails(orderNumber) {
    console.log(`Viewing details for order: ${orderNumber}`);
    showNotification(`Details für Auftrag ${orderNumber} werden geladen`, 'info');
    
    // Here you would typically open a modal or navigate to a details page
    setTimeout(() => {
        showNotification(`Details für Auftrag ${orderNumber} geladen`, 'success');
    }, 1000);
}

// Contact customer
function contactCustomer(customerName) {
    console.log(`Contacting customer: ${customerName}`);
    showNotification(`Kontakt zu ${customerName} wird hergestellt`, 'info');
}

// Update dashboard statistics
function updateDashboardStats() {
    // Simulate fetching real-time data
    const stats = {
        openOrders: Math.floor(Math.random() * 50) + 10,
        todayRevenue: (Math.random() * 20000 + 5000).toFixed(0),
        activeMonteurs: Math.floor(Math.random() * 15) + 5,
        completedOrders: Math.floor(Math.random() * 30) + 5
    };

    // Update stat cards
    updateStatCard('📋', stats.openOrders, 'Offene Aufträge');
    updateStatCard('💰', `€ ${Number(stats.todayRevenue).toLocaleString()}`, 'Umsatz heute');
    updateStatCard('👨‍🔧', stats.activeMonteurs, 'Aktive Monteure');
    updateStatCard('✅', stats.completedOrders, 'Abgeschlossen');

    console.log('Dashboard stats updated:', stats);
}

// Update individual stat card
function updateStatCard(icon, number, label) {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const cardIcon = card.querySelector('.stat-icon');
        const cardNumber = card.querySelector('.stat-number');
        const cardLabel = card.querySelector('.stat-label');
        
        if (cardIcon && cardIcon.textContent.includes(icon)) {
            if (cardNumber) cardNumber.textContent = number;
            if (cardLabel) cardLabel.textContent = label;
        }
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.showTab = showTab;
window.assignMonteur = assignMonteur;
window.viewOrderDetails = viewOrderDetails;
window.contactCustomer = contactCustomer;
window.updateDashboardStats = updateDashboardStats;