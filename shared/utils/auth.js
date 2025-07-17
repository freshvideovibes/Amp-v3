/**
 * Authentication and Role Management for AMP
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.roles = {};
        this.init();
    }

    async init() {
        try {
            // Load roles configuration
            await this.loadRoles();
            
            // Check Telegram WebApp data
            this.checkTelegramAuth();
        } catch (error) {
            console.error('Auth initialization failed:', error);
            this.showUnauthorized();
        }
    }

    async loadRoles() {
        try {
            const response = await fetch('/shared/config/roles.json');
            this.roles = await response.json();
        } catch (error) {
            console.error('Failed to load roles:', error);
            throw new Error('Roles configuration not available');
        }
    }

    checkTelegramAuth() {
        // Check if Telegram WebApp is available
        if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
            console.warn('Telegram WebApp not available');
            this.showUnauthorized();
            return;
        }

        // Get user data from Telegram WebApp
        const webApp = Telegram.WebApp;
        const initData = webApp.initDataUnsafe;
        
        if (!initData || !initData.user) {
            console.warn('No Telegram user data available');
            this.showUnauthorized();
            return;
        }

        const userId = initData.user.id.toString();
        const role = this.roles[userId];

        if (!role) {
            console.warn('User not registered:', userId);
            this.showUnauthorized();
            return;
        }

        this.currentUser = initData.user;
        this.currentRole = role;
        
        console.log('User authenticated:', {
            id: userId,
            role: role,
            name: initData.user.first_name
        });

        this.showAuthorized();
    }

    showUnauthorized() {
        document.body.innerHTML = `
            <div class="unauthorized-container">
                <div class="unauthorized-card">
                    <div class="warning-icon">⚠️</div>
                    <h2>Zugriff verweigert</h2>
                    <p>Du bist nicht registriert oder hast keine Berechtigung für diese Anwendung.</p>
                    <p>Bitte wende dich an den Administrator.</p>
                </div>
            </div>
        `;
    }

    showAuthorized() {
        // Remove unauthorized message if present
        const unauthorizedContainer = document.querySelector('.unauthorized-container');
        if (unauthorizedContainer) {
            unauthorizedContainer.remove();
        }

        // Trigger custom event for app initialization
        document.dispatchEvent(new CustomEvent('userAuthenticated', {
            detail: {
                user: this.currentUser,
                role: this.currentRole
            }
        }));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRole() {
        return this.currentRole;
    }

    hasRole(requiredRole) {
        return this.currentRole === requiredRole;
    }

    hasAnyRole(requiredRoles) {
        return requiredRoles.includes(this.currentRole);
    }

    isAdmin() {
        return this.currentRole === 'admin';
    }

    isAgent() {
        return this.currentRole === 'agent';
    }

    isMonteur() {
        return this.currentRole === 'monteur';
    }
}

// Global auth instance
window.authManager = new AuthManager();