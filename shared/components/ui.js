/**
 * AMP UI Components - Reusable UI Elements
 */

class UIComponents {
    constructor() {
        this.modals = new Map();
        this.tabs = new Map();
        this.init();
    }

    init() {
        // Initialize event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    }

    handleGlobalClick(event) {
        // Handle modal backdrop clicks
        if (event.target.classList.contains('modal')) {
            this.closeModal(event.target.id);
        }

        // Handle tab clicks
        if (event.target.classList.contains('tab-link')) {
            event.preventDefault();
            this.activateTab(event.target);
        }

        // Handle navigation toggle
        if (event.target.closest('.nav-toggle')) {
            this.toggleNavigation();
        }
    }

    handleGlobalKeydown(event) {
        // Handle escape key for modals
        if (event.key === 'Escape') {
            this.closeAllModals();
        }
    }

    /**
     * Modal Management
     */
    createModal(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="window.ui.closeModal('${id}')">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        this.modals.set(id, modal);
        return modal;
    }

    openModal(id) {
        const modal = this.modals.get(id) || document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeModal(id) {
        const modal = this.modals.get(id) || document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        this.modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    /**
     * Tab Management
     */
    initTabs(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tabLinks = container.querySelectorAll('.tab-link');
        const tabContents = container.querySelectorAll('.tab-content');

        // Activate first tab by default
        if (tabLinks.length > 0) {
            this.activateTab(tabLinks[0]);
        }

        this.tabs.set(containerId, { tabLinks, tabContents });
    }

    activateTab(tabLink) {
        const containerId = tabLink.closest('.tabs').id;
        const targetId = tabLink.getAttribute('data-tab');
        const tabData = this.tabs.get(containerId);

        if (!tabData) return;

        // Remove active class from all tabs and contents
        tabData.tabLinks.forEach(link => link.classList.remove('active'));
        tabData.tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tabLink.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    /**
     * Navigation Management
     */
    toggleNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    }

    /**
     * Form Helpers
     */
    createForm(config) {
        const form = document.createElement('form');
        form.className = 'form';
        
        config.fields.forEach(field => {
            const formGroup = this.createFormGroup(field);
            form.appendChild(formGroup);
        });

        if (config.submitButton) {
            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.className = `btn btn-primary ${config.submitButton.fullWidth ? 'btn-full' : ''}`;
            submitBtn.textContent = config.submitButton.text || 'Absenden';
            form.appendChild(submitBtn);
        }

        return form;
    }

    createFormGroup(field) {
        const group = document.createElement('div');
        group.className = 'form-group';

        // Label
        if (field.label) {
            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = field.label;
            if (field.required) {
                label.innerHTML += ' <span style="color: var(--error-color);">*</span>';
            }
            group.appendChild(label);
        }

        // Input
        let input;
        switch (field.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'form-control form-textarea';
                break;
            case 'select':
                input = document.createElement('select');
                input.className = 'form-control form-select';
                if (field.options) {
                    field.options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.value;
                        optionEl.textContent = option.text;
                        input.appendChild(optionEl);
                    });
                }
                break;
            case 'checkbox':
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.className = 'form-checkbox';
                input = document.createElement('input');
                input.type = 'checkbox';
                input.id = field.id;
                const checkboxLabel = document.createElement('label');
                checkboxLabel.htmlFor = field.id;
                checkboxLabel.textContent = field.label;
                checkboxWrapper.appendChild(input);
                checkboxWrapper.appendChild(checkboxLabel);
                group.appendChild(checkboxWrapper);
                return group;
            default:
                input = document.createElement('input');
                input.type = field.type || 'text';
                input.className = 'form-control';
        }

        if (field.id) input.id = field.id;
        if (field.name) input.name = field.name;
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.required) input.required = true;
        if (field.value) input.value = field.value;

        group.appendChild(input);

        // Help text
        if (field.help) {
            const help = document.createElement('div');
            help.className = 'form-help';
            help.textContent = field.help;
            group.appendChild(help);
        }

        return group;
    }

    /**
     * Card Components
     */
    createCard(title, content, options = {}) {
        const card = document.createElement('div');
        card.className = 'card';

        if (title) {
            const header = document.createElement('div');
            header.className = 'card-header';
            header.innerHTML = `<h3 class="card-title">${title}</h3>`;
            card.appendChild(header);
        }

        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = content;
        card.appendChild(body);

        if (options.footer) {
            const footer = document.createElement('div');
            footer.className = 'card-footer';
            footer.innerHTML = options.footer;
            card.appendChild(footer);
        }

        return card;
    }

    /**
     * Badge Components
     */
    createBadge(text, type = 'primary') {
        const badge = document.createElement('span');
        badge.className = `badge badge-${type}`;
        badge.textContent = text;
        return badge;
    }

    /**
     * Progress Bar
     */
    createProgressBar(value, max = 100, type = 'primary') {
        const progress = document.createElement('div');
        progress.className = 'progress';
        
        const bar = document.createElement('div');
        bar.className = `progress-bar progress-bar-${type}`;
        bar.style.width = `${(value / max) * 100}%`;
        
        progress.appendChild(bar);
        return progress;
    }

    /**
     * Avatar Component
     */
    createAvatar(text, size = 'default') {
        const avatar = document.createElement('div');
        avatar.className = `avatar ${size !== 'default' ? `avatar-${size}` : ''}`;
        avatar.textContent = text.charAt(0).toUpperCase();
        return avatar;
    }

    /**
     * Notification System
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Loading States
     */
    showLoading(element) {
        element.classList.add('loading');
        element.style.pointerEvents = 'none';
    }

    hideLoading(element) {
        element.classList.remove('loading');
        element.style.pointerEvents = '';
    }

    /**
     * Utility Methods
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    /**
     * Validation Helpers
     */
    validateForm(form) {
        const errors = [];
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                errors.push(`${input.previousElementSibling?.textContent || 'Feld'} ist erforderlich`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        // Email validation
        const emailInputs = form.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (input.value && !this.isValidEmail(input.value)) {
                errors.push('Ungültige E-Mail-Adresse');
                input.classList.add('error');
            }
        });

        // Phone validation
        const phoneInputs = form.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            if (input.value && !this.isValidPhone(input.value)) {
                errors.push('Ungültige Telefonnummer');
                input.classList.add('error');
            }
        });

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Data Table Helper
     */
    createDataTable(data, columns, options = {}) {
        const table = document.createElement('table');
        table.className = 'table';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.title;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                const value = row[column.key];
                
                if (column.render) {
                    td.innerHTML = column.render(value, row);
                } else {
                    td.textContent = value;
                }
                
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    }
}

// Global UI instance
window.ui = new UIComponents();