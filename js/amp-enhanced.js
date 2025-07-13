// AMP Enhanced - Erweiterte Integration für n8n, Google Maps und Telegram
class AMPEnhanced {
    constructor() {
        this.config = window.AMP_CONFIG;
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.initializeApp();
    }

    initializeApp() {
        // Initialize Telegram Web App
        if (window.Telegram?.WebApp) {
            Telegram.WebApp.ready();
            this.setupTelegramHandlers();
        }

        // Setup offline/online handlers
        this.setupOfflineHandlers();
        
        // Load offline queue
        this.loadOfflineQueue();
        
        // Setup auto-sync
        this.setupAutoSync();
    }

    setupTelegramHandlers() {
        const tg = window.Telegram.WebApp;
        
        // Haptic feedback for better UX
        tg.HapticFeedback.impactOccurred('light');
        
        // Theme integration
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
    }

    setupOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('🌐 Verbindung wiederhergestellt', 'success');
            this.processPendingQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('📱 Offline-Modus aktiviert', 'warning');
        });
    }

    setupAutoSync() {
        setInterval(() => {
            if (this.isOnline && !this.syncInProgress) {
                this.syncWithServer();
            }
        }, this.config.app.syncInterval);
    }

    // Enhanced n8n Integration with retry mechanism
    async sendToN8N(endpoint, data, options = {}) {
        const url = `${this.config.n8n.baseUrl}${this.config.n8n.webhooks[endpoint]}`;
        
        // Add timestamp and user context
        const enrichedData = {
            ...data,
            timestamp: new Date().toISOString(),
            userContext: this.getUserContext(),
            appVersion: this.config.app.version
        };

        if (!this.isOnline) {
            return this.addToOfflineQueue(endpoint, enrichedData, options);
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': `AMP-App/${this.config.app.version}`,
                ...options.headers
            },
            body: JSON.stringify(enrichedData),
            signal: AbortSignal.timeout(this.config.n8n.timeout)
        };

        let lastError;
        for (let attempt = 0; attempt < this.config.n8n.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                
                // Success feedback
                if (options.successMessage) {
                    this.showNotification(options.successMessage, 'success');
                }

                return result;
            } catch (error) {
                lastError = error;
                
                if (attempt < this.config.n8n.retryAttempts - 1) {
                    await this.delay(this.config.n8n.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        // All retries failed
        this.addToOfflineQueue(endpoint, enrichedData, options);
        
        const errorMessage = options.errorMessage || 'Verbindungsfehler';
        this.showNotification(`❌ ${errorMessage}: ${lastError.message}`, 'error');
        
        throw lastError;
    }

    // Enhanced Google Maps Integration
    async geocodeAddress(address) {
        if (!this.config.google.maps.apiKey) {
            console.warn('Google Maps API Key nicht konfiguriert');
            return this.generateSimpleMapsLink(address);
        }

        try {
            const url = `${this.config.google.maps.geocodingUrl}?address=${encodeURIComponent(address)}&key=${this.config.google.maps.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                return {
                    formatted_address: result.formatted_address,
                    coordinates: result.geometry.location,
                    place_id: result.place_id,
                    maps_link: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
                    components: result.address_components
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }

        // Fallback to simple maps link
        return this.generateSimpleMapsLink(address);
    }

    async calculateRoute(origin, destination) {
        if (!this.config.google.maps.apiKey) {
            return null;
        }

        try {
            const url = `${this.config.google.maps.directionsUrl}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.config.google.maps.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    duration: route.legs[0].duration,
                    distance: route.legs[0].distance,
                    start_address: route.legs[0].start_address,
                    end_address: route.legs[0].end_address,
                    steps: route.legs[0].steps
                };
            }
        } catch (error) {
            console.error('Route calculation error:', error);
        }

        return null;
    }

    generateStaticMap(address, width = 400, height = 300, zoom = 15) {
        if (!this.config.google.maps.apiKey) {
            return null;
        }

        const params = new URLSearchParams({
            center: address,
            zoom: zoom,
            size: `${width}x${height}`,
            maptype: 'roadmap',
            markers: `color:red|${address}`,
            key: this.config.google.maps.apiKey
        });

        return `${this.config.google.maps.staticMapUrl}?${params}`;
    }

    generateSimpleMapsLink(address) {
        return {
            formatted_address: address,
            maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
            coordinates: null,
            place_id: null
        };
    }

    // Enhanced Order Processing
    async processOrder(orderData) {
        // Enrich order with geocoding
        const locationData = await this.geocodeAddress(orderData.address);
        
        const enrichedOrder = {
            ...orderData,
            id: this.generateOrderId(),
            created_at: new Date().toISOString(),
            location: locationData,
            static_map: this.generateStaticMap(orderData.address),
            estimated_duration: null // Will be filled by route calculation
        };

        // Calculate route if monteur is assigned
        if (orderData.monteur_id) {
            const monteur = await this.getMonteurById(orderData.monteur_id);
            if (monteur && monteur.current_location) {
                const route = await this.calculateRoute(monteur.current_location, orderData.address);
                enrichedOrder.estimated_duration = route?.duration?.text || null;
            }
        }

        // Send to n8n
        await this.sendToN8N('orders', enrichedOrder, {
            successMessage: '✅ Auftrag erfolgreich übertragen',
            errorMessage: 'Fehler beim Übertragen des Auftrags'
        });

        return enrichedOrder;
    }

    // Revenue Processing with Enhanced Analytics
    async processRevenue(revenueData) {
        const enrichedRevenue = {
            ...revenueData,
            id: this.generateRevenueId(),
            processed_at: new Date().toISOString(),
            calculated_metrics: this.calculateRevenueMetrics(revenueData)
        };

        await this.sendToN8N('revenue', enrichedRevenue, {
            successMessage: '✅ Umsatz erfolgreich gemeldet',
            errorMessage: 'Fehler bei der Umsatzmeldung'
        });

        return enrichedRevenue;
    }

    // Offline Queue Management
    addToOfflineQueue(endpoint, data, options) {
        const queueItem = {
            id: this.generateQueueId(),
            endpoint,
            data,
            options,
            timestamp: new Date().toISOString(),
            attempts: 0
        };

        this.offlineQueue.push(queueItem);
        this.saveOfflineQueue();

        this.showNotification('📝 Daten für Offline-Verarbeitung gespeichert', 'info');
        return queueItem;
    }

    async processPendingQueue() {
        if (this.syncInProgress || this.offlineQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        this.showNotification('🔄 Synchronisierung läuft...', 'info');

        const processed = [];
        const failed = [];

        for (const item of this.offlineQueue) {
            try {
                await this.sendToN8N(item.endpoint, item.data, {
                    ...item.options,
                    suppressNotifications: true
                });
                processed.push(item.id);
            } catch (error) {
                item.attempts++;
                if (item.attempts >= this.config.n8n.retryAttempts) {
                    failed.push(item);
                }
            }
        }

        // Remove processed items
        this.offlineQueue = this.offlineQueue.filter(item => !processed.includes(item.id));
        this.saveOfflineQueue();

        this.syncInProgress = false;

        if (processed.length > 0) {
            this.showNotification(`✅ ${processed.length} Elemente synchronisiert`, 'success');
        }

        if (failed.length > 0) {
            this.showNotification(`❌ ${failed.length} Elemente konnten nicht synchronisiert werden`, 'error');
        }
    }

    // Utility Methods
    getUserContext() {
        const tg = window.Telegram?.WebApp;
        return {
            telegram_id: tg?.initDataUnsafe?.user?.id || null,
            username: tg?.initDataUnsafe?.user?.username || null,
            language: tg?.initDataUnsafe?.user?.language_code || 'de',
            platform: tg?.platform || 'unknown'
        };
    }

    generateOrderId() {
        return 'AMP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateRevenueId() {
        return 'REV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateQueueId() {
        return 'QUE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    calculateRevenueMetrics(data) {
        return {
            net_amount: parseFloat(data.betrag) * 0.81, // Assuming 19% VAT
            commission: parseFloat(data.betrag) * 0.15, // 15% commission
            category: this.categorizeBranch(data.branche),
            priority_score: this.calculatePriorityScore(data)
        };
    }

    categorizeBranch(branch) {
        const categories = {
            'rohrreinigung': 'Sanitär',
            'heizung': 'Heizung',
            'elektrik': 'Elektrik',
            'dachreparatur': 'Dach',
            'malerarbeiten': 'Malerei'
        };
        return categories[branch] || 'Sonstiges';
    }

    calculatePriorityScore(data) {
        let score = 0;
        if (parseFloat(data.betrag) > 500) score += 2;
        if (data.zahlungsart === 'bar') score += 1;
        if (data.land === 'AT') score += 1;
        return score;
    }

    loadOfflineQueue() {
        try {
            const stored = localStorage.getItem(this.config.storage.offlineQueue);
            this.offlineQueue = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading offline queue:', error);
            this.offlineQueue = [];
        }
    }

    saveOfflineQueue() {
        try {
            localStorage.setItem(this.config.storage.offlineQueue, JSON.stringify(this.offlineQueue));
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }

    showNotification(message, type = 'info') {
        const tg = window.Telegram?.WebApp;
        
        if (tg) {
            tg.showAlert(message);
            
            // Add haptic feedback
            switch (type) {
                case 'success':
                    tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'error':
                    tg.HapticFeedback.notificationOccurred('error');
                    break;
                case 'warning':
                    tg.HapticFeedback.notificationOccurred('warning');
                    break;
            }
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async syncWithServer() {
        // Implement background sync logic
        console.log('Background sync initiated');
    }

    async getMonteurById(id) {
        // Implement monteur lookup
        return null;
    }
}

// Initialize enhanced AMP
document.addEventListener('DOMContentLoaded', () => {
    window.ampEnhanced = new AMPEnhanced();
});