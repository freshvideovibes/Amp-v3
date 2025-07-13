// AMP Configuration - Zentrale Konfiguration für alle Services
const AMP_CONFIG = {
    // n8n Server Configuration
    n8n: {
        baseUrl: process.env.N8N_SERVER_URL || 'https://amp-telegram.app.n8n.cloud/webhook-test/amp-orders',
        webhooks: {
            orders: '/webhook/amp-orders',
            revenue: '/webhook/amp-revenue',
            monteur: '/webhook/amp-monteur',
            status: '/webhook/amp-status',
            sheets: '/webhook/amp-sheets-sync',
            maps: '/webhook/amp-maps-geocode',
            report: '/webhook/amp-report',
            notifications: '/webhook/amp-notifications'
        },
        retryAttempts: 3,
        retryDelay: 1000,
        timeout: 10000
    },

    // Google Services Configuration
    google: {
        maps: {
            apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
            geocodingUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
            directionsUrl: 'https://maps.googleapis.com/maps/api/directions/json',
            distanceMatrixUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json',
            staticMapUrl: 'https://maps.googleapis.com/maps/api/staticmap'
        },
        sheets: {
            spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
            apiKey: process.env.GOOGLE_SHEETS_API_KEY || '',
            ranges: {
                orders: 'Aufträge!A:Z',
                monteurs: 'Monteure!A:Z',
                revenue: 'Umsatz!A:Z',
                reports: 'Berichte!A:Z'
            }
        }
    },

    // Telegram Configuration
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
        adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
        notificationChannels: {
            orders: process.env.TELEGRAM_ORDERS_CHANNEL || '',
            revenue: process.env.TELEGRAM_REVENUE_CHANNEL || '',
            alerts: process.env.TELEGRAM_ALERTS_CHANNEL || ''
        }
    },

    // App Configuration
    app: {
        version: '3.0.0',
        offlineMode: true,
        maxOfflineQueue: 100,
        syncInterval: 30000, // 30 seconds
        autoSaveInterval: 10000, // 10 seconds
        enableNotifications: true,
        enableGeolocation: true,
        enableFileUploads: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt']
    },

    // Local Storage Keys
    storage: {
        user: 'amp_user_data',
        orders: 'amp_orders',
        monteurs: 'amp_monteurs',
        settings: 'amp_settings',
        offlineQueue: 'amp_offline_queue',
        syncTimestamp: 'amp_sync_timestamp'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AMP_CONFIG;
} else {
    window.AMP_CONFIG = AMP_CONFIG;
}
