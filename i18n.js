// Система интернационализации
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ru';
        this.translations = {
            ru: {
                nav: {
                    about: 'О себе',
                    skills: 'Навыки',
                    projects: 'Проекты',
                    github: 'GitHub',
                    donate: 'Поддержка',
                    contact: 'Контакты'
                },
                header: {
                    subtitle: 'Full-Stack Разработчик',
                    typing: 'Создаю современные веб-приложения',
                    voice: '🎤 Послушать приветствие'
                },
                about: {
                    title: 'О себе',
                    intro: 'Привет! Меня зовут Артём Ловли, мое прозвище Ловли, и мне 17 лет.',
                    description: 'В конце концов, я делаю разные вещи, но в основном это программирование или что-то о программировании',
                    conclusion: 'Честно говоря, мне нечего сказать о себе, так что...',
                    factBtn: 'Узнать случайный факт обо мне'
                },
                skills: {
                    title: 'Навыки'
                },
                projects: {
                    title: 'Проекты'
                },
                github: {
                    title: 'GitHub Статистика',
                    loading: 'Загрузка...',
                    repositories: 'Репозитории',
                    followers: 'Подписчики',
                    following: 'Подписки',
                    recentRepos: 'Последние репозитории',
                    languages: 'Языки программирования',
                    viewRepo: 'Посмотреть',
                    stars: 'звезд',
                    forks: 'форков',
                    updated: 'Обновлено'
                },
                donate: {
                    title: 'Поддержка',
                    intro: 'Я не буду осуждать тебя, если ты полностью пропустил этот раздел',
                    description: 'Если вы по какой-то причине хотите поддержать меня, я принимаю все, что указано ниже. Заранее огромное спасибо!'
                },
                contact: {
                    title: 'Контакты'
                },
                facts: [
                    'Я могу писать код в 5 утра и чувствовать себя прекрасно',
                    'Мой первый код был на Python, когда мне было 14',
                    'Моя любимая ошибка - "undefined is not a function"',
                    'Я вообще не пью чай',
                    'У меня есть коллекция из 25+ клавиатур',
                    'Я могу написать "Hello World" на 9 языках',
                    'Мой любимый цвет - #4a055fff'
                ]
            },
            en: {
                nav: {
                    about: 'About',
                    skills: 'Skills',
                    projects: 'Projects',
                    github: 'GitHub',
                    donate: 'Support',
                    contact: 'Contact'
                },
                header: {
                    subtitle: 'Full-Stack Developer',
                    typing: 'Creating modern web applications',
                    voice: '🎤 Listen to greeting'
                },
                about: {
                    title: 'About Me',
                    intro: 'Hi! My name is Artem Lovly, my nickname is Lovly, and I\'m 17 years old.',
                    description: 'In the end, I do different things, but mostly it\'s programming or something about programming',
                    conclusion: 'Honestly, I have nothing to say about myself, so...',
                    factBtn: 'Learn a random fact about me'
                },
                skills: {
                    title: 'Skills'
                },
                projects: {
                    title: 'Projects'
                },
                github: {
                    title: 'GitHub Statistics',
                    loading: 'Loading...',
                    repositories: 'Repositories',
                    followers: 'Followers',
                    following: 'Following',
                    recentRepos: 'Recent Repositories',
                    languages: 'Programming Languages',
                    viewRepo: 'View',
                    stars: 'stars',
                    forks: 'forks',
                    updated: 'Updated'
                },
                donate: {
                    title: 'Support',
                    intro: 'I won\'t judge you if you completely skipped this section',
                    description: 'If for some reason you want to support me, I accept everything listed below. Thank you very much in advance!'
                },
                contact: {
                    title: 'Contact'
                },
                facts: [
                    'I can write code at 5 AM and feel great',
                    'My first code was in Python when I was 14',
                    'My favorite error is "undefined is not a function"',
                    'I don\'t drink tea at all',
                    'I have a collection of 25+ keyboards',
                    'I can write "Hello World" in 9 languages',
                    'My favorite color is #4a055fff'
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.updateLanguage(this.currentLang);
        this.bindEvents();
    }
    
    bindEvents() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });
    }
    
    switchLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updateLanguage(lang);
            this.updateActiveButton(lang);
            
            // Обновляем случайные факты
            this.updateRandomFacts();
            
            // Обновляем голосовое приветствие
            this.updateVoiceGreeting();
        }
    }
    
    updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key, lang);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        // Обновляем title страницы
        document.title = lang === 'ru' ? 'Артем lovly' : 'Artem lovly';
        
        // Обновляем GitHub репозитории если они уже загружены
        this.updateGitHubContent();
    }
    
    updateGitHubContent() {
        // Обновляем репозитории с новыми переводами
        if (window.githubAPI && window.githubAPI.lastReposData) {
            window.githubAPI.displayRepositories(window.githubAPI.lastReposData);
        }
    }
    
    updateActiveButton(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
    }
    
    getTranslation(key, lang = this.currentLang) {
        const keys = key.split('.');
        let translation = this.translations[lang];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return translation;
    }
    
    updateRandomFacts() {
        // Обновляем массив фактов в script.js
        if (window.updateFactsArray) {
            const facts = this.getTranslation('facts');
            if (facts) {
                window.updateFactsArray(facts);
            }
        }
    }
    
    updateVoiceGreeting() {
        // Обновляем текст для голосового приветствия
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.setAttribute('data-lang', this.currentLang);
        }
    }
    
    // Метод для получения текущего языка
    getCurrentLang() {
        return this.currentLang;
    }
    
    // Метод для получения переводов (для использования в других скриптах)
    t(key) {
        return this.getTranslation(key);
    }
}

// Инициализация системы интернационализации
const i18n = new I18n();

// Делаем доступным глобально
window.i18n = i18n;

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}