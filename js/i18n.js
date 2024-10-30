class I18nHandler {
    constructor() {
        this.translations = {};
        this.currentLang = 'uk'; // Default language
    
    // Wait for jQuery to be ready
        $(document).ready(() => {
            this.init();
        });
    }

    async init() {
        // Try to get language from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        
        // Try to get language from localStorage
        const storedLang = localStorage.getItem('selectedLanguage');
        
        // Set initial language
        const initialLang = langParam || storedLang || this.currentLang;
        await this.loadTranslations(initialLang);
        this.setLanguage(initialLang);
        
        // Initialize language switcher
        this.initLanguageSwitcher();
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
        }
    }

    async setLanguage(lang) {
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('selectedLanguage', lang);

        // Update URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);

        // Update active state in language switcher
        document.querySelectorAll('.lang-link').forEach(link => {
            link.classList.toggle('active', link.dataset.lang === lang);
        });

        this.updatePageContent();
    }

    updatePageContent() {
        const translations = this.translations[this.currentLang];
        if (!translations) return;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const keys = element.dataset.i18n.split('.');
            let value = translations;
            
            // Navigate through nested keys
            for (const key of keys) {
                if (value) value = value[key];
            }

            if (value) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
    }

    initLanguageSwitcher() {
        document.querySelectorAll('.lang-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const newLang = link.dataset.lang;
                await this.setLanguage(newLang);
            });
        });
    }
}