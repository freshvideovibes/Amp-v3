/**
 * n8n Communication Manager for AMP
 */

class N8nManager {
    constructor() {
        this.baseUrl = 'https://your-n8n-instance.com/webhook'; // Configure your n8n webhook URL
        this.endpoints = {
            agent: '/amp-agent',
            monteur: '/amp-monteur',
            admin: '/amp-admin'
        };
    }

    /**
     * Send data to n8n webhook
     * @param {string} endpoint - The endpoint identifier (agent, monteur, admin)
     * @param {string} action - The action type (create_order, update_order, etc.)
     * @param {object} data - The data to send
     * @param {object} options - Additional options
     */
    async sendToN8n(endpoint, action, data, options = {}) {
        try {
            const user = window.authManager?.getCurrentUser();
            const role = window.authManager?.getCurrentRole();

            const payload = {
                context: {
                    userID: user?.id || null,
                    role: role || null,
                    userName: user?.first_name || null,
                    timestamp: new Date().toISOString(),
                    endpoint: endpoint,
                    action: action
                },
                data: data,
                ...options
            };

            const url = `${this.baseUrl}${this.endpoints[endpoint] || ''}`;
            
            this.showLoading();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            this.hideLoading();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('n8n response:', result);
            this.showSuccess('Daten erfolgreich übertragen');
            
            return result;

        } catch (error) {
            this.hideLoading();
            console.error('n8n communication error:', error);
            this.showError('Fehler beim Übertragen der Daten: ' + error.message);
            throw error;
        }
    }

    /**
     * Agent-specific actions
     */
    async createOrder(orderData) {
        return this.sendToN8n('agent', 'create_order', orderData);
    }

    async searchOrder(searchData) {
        return this.sendToN8n('agent', 'search_order', searchData);
    }

    async reportComplaint(complaintData) {
        return this.sendToN8n('agent', 'report_complaint', complaintData);
    }

    /**
     * Monteur-specific actions
     */
    async getAssignedOrders() {
        return this.sendToN8n('monteur', 'get_assigned_orders', {});
    }

    async reportRevenue(revenueData) {
        return this.sendToN8n('monteur', 'report_revenue', revenueData);
    }

    async updateOrderStatus(orderData) {
        return this.sendToN8n('monteur', 'update_order_status', orderData);
    }

    /**
     * Admin-specific actions
     */
    async getAllOrders() {
        return this.sendToN8n('admin', 'get_all_orders', {});
    }

    async acceptOrder(orderData) {
        return this.sendToN8n('admin', 'accept_order', orderData);
    }

    async cancelOrder(orderData) {
        return this.sendToN8n('admin', 'cancel_order', orderData);
    }

    async assignMonteur(assignmentData) {
        return this.sendToN8n('admin', 'assign_monteur', assignmentData);
    }

    async getDailyReport() {
        return this.sendToN8n('admin', 'get_daily_report', {});
    }

    async confirmRevenue(revenueData) {
        return this.sendToN8n('admin', 'confirm_revenue', revenueData);
    }

    /**
     * UI feedback methods
     */
    showLoading() {
        const existingLoader = document.querySelector('.n8n-loader');
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.className = 'n8n-loader';
        loader.innerHTML = `
            <div class="loader-overlay">
                <div class="loader-spinner"></div>
                <p>Übertrage Daten...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.n8n-loader');
        if (loader) {
            loader.remove();
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Global n8n instance
window.n8nManager = new N8nManager();