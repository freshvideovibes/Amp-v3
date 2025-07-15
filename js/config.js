// AMP Configuration - Zentrale Konfiguration für alle Services
const AMP_CONFIG = {
    // n8n Server Configuration
    n8n: {
        baseUrl: 'https://amp-telegram.app.n8n.cloud', // TODO: Update this to your actual n8n server URL
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
            apiKey: '', // TODO: Add your Google Maps API key here
            geocodingUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
            directionsUrl: 'https://maps.googleapis.com/maps/api/directions/json',
            distanceMatrixUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json',
            staticMapUrl: 'https://maps.googleapis.com/maps/api/staticmap'
        },
        sheets: {
            spreadsheetId: '', // TODO: Add your Google Sheets ID here
            apiKey: '', // TODO: Add your Google Sheets API key here
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
        botToken: '', // TODO: Add your Telegram Bot Token here
        webhookUrl: '', // TODO: Add your Telegram Webhook URL here
        adminChatId: '', // TODO: Add your Telegram Admin Chat ID here
        notificationChannels: {
            orders: '', // TODO: Add your Telegram Orders Channel here
            revenue: '', // TODO: Add your Telegram Revenue Channel here
            alerts: '' // TODO: Add your Telegram Alerts Channel here
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
