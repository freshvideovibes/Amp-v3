// AMP Enhanced - Erweiterte Integration für n8n, Google Maps und Telegram
class AMPEnhanced {
    constructor() {
        this.config = window.AMP_CONFIG;
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.cache = new Map();
        this.performance = {
            requests: 0,
            errors: 0,
            cacheHits: 0,
            startTime: Date.now()
        };
        this.initializeApp();
    }

    initializeApp() {
        // Initialize performance monitoring
        this.setupPerformanceMonitoring();

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
        
        // Setup cache cleanup
        this.setupCacheCleanup();
    }

    setupPerformanceMonitoring() {
        // Monitor performance metrics
        setInterval(() => {
            const metrics = {
                ...this.performance,
                uptime: Date.now() - this.performance.startTime,
                cacheSize: this.cache.size,
                queueSize: this.offlineQueue.length,
                memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
            };
            
            // Send metrics to n8n for monitoring
            if (this.performance.requests > 0) {
                this.sendToN8N('report', { type: 'performance', metrics }, { silent: true });
            }
        }, 300000); // Every 5 minutes
    }

    setupTelegramHandlers() {
        const tg = window.Telegram.WebApp;
        
        // Enhanced haptic feedback
        tg.HapticFeedback.impactOccurred('light');
        
        // Theme integration with CSS variables
        const theme = tg.themeParams;
        const root = document.documentElement;
        
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(`--tg-${key.replace(/_/g, '-')}`, value);
        });
        
        // Setup viewport
        tg.expand();
        tg.MainButton.hide();
        tg.BackButton.hide();
        
        // Listen for theme changes
        tg.onEvent('themeChanged', () => {
            this.setupTelegramHandlers();
        });
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

    setupCacheCleanup() {
        setInterval(() => {
            this.cleanupCache();
        }, 600000); // Every 10 minutes
    }

    cleanupCache() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.cache.delete(key);
            }
        }
    }

    // Enhanced caching system
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < 300000) {
            this.performance.cacheHits++;
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Enhanced n8n Integration with retry mechanism and caching
    async sendToN8N(endpoint, data, options = {}) {
        const url = `${this.config.n8n.baseUrl}${this.config.n8n.webhooks[endpoint]}`;
        
        // Check cache for idempotent operations
        const cacheKey = `${endpoint}:${JSON.stringify(data)}`;
        if (options.cacheable) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }
        
        // Add timestamp and user context
        const enrichedData = {
            ...data,
            timestamp: new Date().toISOString(),
            userContext: this.getUserContext(),
            appVersion: this.config.app.version,
            sessionId: this.getSessionId(),
            performance: this.getPerformanceSnapshot()
        };

        if (!this.isOnline) {
            return this.addToOfflineQueue(endpoint, enrichedData, options);
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': `AMP-App/${this.config.app.version}`,
                'X-Request-ID': this.generateRequestId(),
                ...options.headers
            },
            body: JSON.stringify(enrichedData),
            signal: AbortSignal.timeout(this.config.n8n.timeout)
        };

        this.performance.requests++;
        let lastError;
        
        for (let attempt = 0; attempt < this.config.n8n.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                
                // Cache successful responses
                if (options.cacheable) {
                    this.setCachedData(cacheKey, result);
                }
                
                // Success feedback
                if (options.successMessage && !options.silent) {
                    this.showNotification(options.successMessage, 'success');
                }

                return result;
                
            } catch (error) {
                lastError = error;
                this.performance.errors++;
                
                if (attempt < this.config.n8n.retryAttempts - 1) {
                    await this.delay(this.config.n8n.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        // All retries failed
        this.addToOfflineQueue(endpoint, enrichedData, options);
        
        const errorMessage = options.errorMessage || 'Verbindungsfehler';
        if (!options.silent) {
            this.showNotification(`❌ ${errorMessage}: ${lastError.message}`, 'error');
        }
        
        throw lastError;
    }

    // Enhanced Google Maps Integration with caching
    async geocodeAddress(address) {
        const cacheKey = `geocode:${address}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

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
                const geocoded = {
                    formatted_address: result.formatted_address,
                    coordinates: result.geometry.location,
                    place_id: result.place_id,
                    maps_link: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
                    components: result.address_components,
                    viewport: result.geometry.viewport
                };
                
                this.setCachedData(cacheKey, geocoded);
                return geocoded;
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        
        // Fallback to simple link
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
        try {
            // Validate data
            this.validateOrderData(orderData);
            
            // Enrich with location data
            const location = await this.geocodeAddress(`${orderData.address}, ${orderData.zip} ${orderData.city}, ${orderData.country}`);
            
            // Calculate priority score
            const priorityScore = this.calculatePriorityScore(orderData);
            
            const enrichedOrderData = {
                ...orderData,
                id: this.generateId(),
                location,
                priorityScore,
                processed_at: new Date().toISOString()
            };
            
            // Send to n8n
            const result = await this.sendToN8N('orders', enrichedOrderData, {
                successMessage: '✅ Auftrag erfolgreich übermittelt',
                errorMessage: 'Fehler beim Übermitteln des Auftrags'
            });
            
            // Store locally
            this.storeOrder(enrichedOrderData);
            
            return result;
            
        } catch (error) {
            console.error('Order processing error:', error);
            throw error;
        }
    }

    validateOrderData(data) {
        const requiredFields = ['name', 'phone', 'address', 'branch', 'description'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                throw new Error(`${field} ist erforderlich`);
            }
        }
        
        // Phone validation
        if (!/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
            throw new Error('Ungültige Telefonnummer');
        }
        
        // Address validation
        if (data.address.length < 5) {
            throw new Error('Adresse zu kurz');
        }
    }

    calculatePriorityScore(orderData) {
        let score = 0;
        
        // Branch priority
        const branchPriority = {
            'rohrreinigung': 10,
            'heizung': 8,
            'sanitär': 6,
            'elektrik': 4
        };
        
        score += branchPriority[orderData.branch] || 3;
        
        // Time priority
        if (orderData.preferred_time && orderData.preferred_time.includes('dringend')) {
            score += 5;
        }
        
        // Description keywords
        const urgentKeywords = ['notfall', 'dringend', 'sofort', 'wasser', 'heizung kaputt'];
        if (urgentKeywords.some(keyword => orderData.description.toLowerCase().includes(keyword))) {
            score += 3;
        }
        
        return score;
    }

    // Enhanced revenue processing
    async processRevenue(revenueData) {
        try {
            // Validate revenue data
            this.validateRevenueData(revenueData);
            
            // Calculate metrics
            const calculatedMetrics = this.calculateRevenueMetrics(revenueData);
            
            const enrichedRevenueData = {
                ...revenueData,
                id: this.generateId(),
                calculated_metrics: calculatedMetrics,
                processed_at: new Date().toISOString()
            };
            
            // Send to n8n
            const result = await this.sendToN8N('revenue', enrichedRevenueData, {
                successMessage: '💰 Umsatz erfolgreich gemeldet',
                errorMessage: 'Fehler beim Melden des Umsatzes'
            });
            
            // Store locally
            this.storeRevenue(enrichedRevenueData);
            
            return result;
            
        } catch (error) {
            console.error('Revenue processing error:', error);
            throw error;
        }
    }

    validateRevenueData(data) {
        if (!data.auftragsnummer || !data.betrag || !data.zahlungsart) {
            throw new Error('Auftragsnummer, Betrag und Zahlungsart sind erforderlich');
        }
        
        if (isNaN(parseFloat(data.betrag)) || parseFloat(data.betrag) <= 0) {
            throw new Error('Ungültiger Betrag');
        }
    }

    calculateRevenueMetrics(data) {
        const grossAmount = parseFloat(data.betrag);
        const taxRate = 0.19; // 19% VAT
        const netAmount = grossAmount / (1 + taxRate);
        
        // Commission calculation based on branch
        const commissionRates = {
            'rohrreinigung': 0.15,
            'heizung': 0.12,
            'sanitär': 0.10,
            'elektrik': 0.08
        };
        
        const commissionRate = commissionRates[data.branche] || 0.10;
        const commission = netAmount * commissionRate;
        
        // Category based on amount
        let category = 'klein';
        if (grossAmount > 1000) category = 'groß';
        else if (grossAmount > 500) category = 'mittel';
        
        return {
            net_amount: netAmount.toFixed(2),
            commission: commission.toFixed(2),
            tax_amount: (grossAmount - netAmount).toFixed(2),
            category,
            commission_rate: commissionRate,
            priority_score: this.calculateRevenuePriority(data, grossAmount)
        };
    }

    calculateRevenuePriority(data, amount) {
        let score = Math.min(amount / 100, 20); // Max 20 points from amount
        
        // Payment method priority
        const paymentPriority = {
            'bar': 10,
            'überweisung': 8,
            'karte': 6,
            'rechnung': 4
        };
        
        score += paymentPriority[data.zahlungsart] || 2;
        
        return Math.round(score);
    }

    // Offline Queue Management
    addToOfflineQueue(endpoint, data, options) {
        const queueItem = {
            id: this.generateId(),
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

    generateId() {
        return 'AMP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getPerformanceSnapshot() {
        return {
            requests: this.performance.requests,
            errors: this.performance.errors,
            cacheHits: this.performance.cacheHits,
            uptime: Date.now() - this.performance.startTime
        };
    }

    // Enhanced utility functions
    getSessionId() {
        let sessionId = sessionStorage.getItem('amp_session_id');
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('amp_session_id', sessionId);
        }
        return sessionId;
    }

    storeOrder(order) {
        // Implement local storage for orders
        const orders = JSON.parse(localStorage.getItem('amp_orders') || '[]');
        orders.push(order);
        localStorage.setItem('amp_orders', JSON.stringify(orders));
    }

    storeRevenue(revenue) {
        // Implement local storage for revenues
        const revenues = JSON.parse(localStorage.getItem('amp_revenues') || '[]');
        revenues.push(revenue);
        localStorage.setItem('amp_revenues', JSON.stringify(revenues));
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