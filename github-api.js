// GitHub API интеграция
class GitHubAPI {
    constructor() {
        this.username = 'wenlixxq1'; // Ваш GitHub username
        this.apiBase = 'https://api.github.com';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 минут
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadUserData();
            await this.loadRepositories();
            await this.loadLanguageStats();
        } catch (error) {
            console.error('Ошибка загрузки данных GitHub:', error);
            this.showError();
        }
    }
    
    async fetchWithCache(url) {
        const cacheKey = url;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        try {
            const response = await fetch(url);
            if (response.status === 403) {
                // Проверка на превышение лимита GitHub API
                const msg = 'GitHub API rate limit exceeded. Попробуйте позже или используйте OAuth.';
                this.showError(msg);
                throw new Error(msg);
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Ошибка запроса к ${url}:`, error);
            this.showError(error.message);
            throw error;
        }
    }
    
    async loadUserData() {
        try {
            const userData = await this.fetchWithCache(`${this.apiBase}/users/${this.username}`);
            this.displayUserProfile(userData);
        } catch (error) {
            console.error('Ошибка загрузки профиля пользователя:', error);
        }
    }
    
    async loadRepositories() {
        try {
            const repos = await this.fetchWithCache(
                `${this.apiBase}/users/${this.username}/repos?sort=updated&per_page=6`
            );
            this.displayRepositories(repos);
        } catch (error) {
            console.error('Ошибка загрузки репозиториев:', error);
        }
    }
    
    async loadLanguageStats() {
        try {
            const repos = await this.fetchWithCache(
                `${this.apiBase}/users/${this.username}/repos?per_page=100`
            );
            
            const languageStats = {};
            let totalBytes = 0;
            
            // Получаем статистику языков для каждого репозитория
            const languagePromises = repos
                .filter(repo => !repo.fork) // Исключаем форки
                .slice(0, 20) // Ограничиваем количество для производительности
                .map(async (repo) => {
                    try {
                        const languages = await this.fetchWithCache(`${this.apiBase}/repos/${this.username}/${repo.name}/languages`);
                        return languages;
                    } catch (error) {
                        console.warn(`Не удалось загрузить языки для ${repo.name}:`, error);
                        return {};
                    }
                });
            
            const languageResults = await Promise.all(languagePromises);
            
            // Суммируем статистику
            languageResults.forEach(languages => {
                Object.entries(languages).forEach(([lang, bytes]) => {
                    languageStats[lang] = (languageStats[lang] || 0) + bytes;
                    totalBytes += bytes;
                });
            });
            
            this.displayLanguageStats(languageStats, totalBytes);
        } catch (error) {
            console.error('Ошибка загрузки статистики языков:', error);
        }
    }
    
    displayUserProfile(userData) {
        const avatar = document.getElementById('githubAvatar');
        const name = document.getElementById('githubName');
        const bio = document.getElementById('githubBio');
        const repos = document.getElementById('githubRepos');
        const followers = document.getElementById('githubFollowers');
        const following = document.getElementById('githubFollowing');
        
        if (avatar) {
            avatar.src = userData.avatar_url;
            avatar.alt = `${userData.name || userData.login} Avatar`;
        }
        if (name) name.textContent = userData.name || userData.login;
        if (bio) {
            const bioText = userData.bio || (window.i18n?.getCurrentLang() === 'en' 
                ? 'No bio available' 
                : 'Описание отсутствует');
            bio.textContent = bioText;
        }
        if (repos) repos.textContent = this.formatNumber(userData.public_repos);
        if (followers) followers.textContent = this.formatNumber(userData.followers);
        if (following) following.textContent = this.formatNumber(userData.following);
    }
    
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
    
    displayRepositories(repos) {
        const container = document.getElementById('githubReposList');
        if (!container) return;
        
        // Сохраняем данные для обновления при смене языка
        this.lastReposData = repos;
        
        container.innerHTML = '';
        
        if (!repos || !repos.length) {
            container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>Нет публичных репозиториев или превышен лимит GitHub API.</p></div>`;
            return;
        }
        
        repos.forEach(repo => {
            const repoElement = this.createRepositoryElement(repo);
            container.appendChild(repoElement);
        });
    }
    
    createRepositoryElement(repo) {
        const repoDiv = document.createElement('div');
        repoDiv.className = 'repo-item';
        
        const updatedDate = new Date(repo.updated_at).toLocaleDateString(
            window.i18n?.getCurrentLang() === 'ru' ? 'ru-RU' : 'en-US'
        );
        
        const starsText = window.i18n ? window.i18n.t('github.stars') : 'stars';
        const forksText = window.i18n ? window.i18n.t('github.forks') : 'forks';
        const updatedText = window.i18n ? window.i18n.t('github.updated') : 'Updated';
        const viewText = window.i18n ? window.i18n.t('github.viewRepo') : 'View';
        
        repoDiv.innerHTML = `
            <div class="repo-header">
                <h4 class="repo-name">${repo.name}</h4>
                <div class="repo-stats">
                    <span class="repo-stat">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="repo-stat">
                        <i class="fas fa-code-branch"></i> ${repo.forks_count}
                    </span>
                </div>
            </div>
            <p class="repo-description">${repo.description || 'No description'}</p>
            <div class="repo-footer">
                ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ''}
                <span class="repo-updated">${updatedText}: ${updatedDate}</span>
                <a href="${repo.html_url}" target="_blank" class="repo-link">
                    ${viewText} <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
        
        return repoDiv;
    }
    
    displayLanguageStats(languageStats, totalBytes) {
        const container = document.getElementById('languagesChart');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Сортируем языки по количеству байт
        const sortedLanguages = Object.entries(languageStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8); // Показываем топ 8 языков
        
        // Цвета для языков программирования
        const languageColors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'TypeScript': '#2b7489',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'C#': '#239120',
            'Vue': '#4FC08D',
            'React': '#61DAFB'
        };
        
        sortedLanguages.forEach(([language, bytes], index) => {
            const percentage = ((bytes / totalBytes) * 100).toFixed(1);
            const color = languageColors[language] || this.generateColor(index);
            
            const languageElement = document.createElement('div');
            languageElement.className = 'language-item';
            languageElement.innerHTML = `
                <div class="language-info">
                    <span class="language-name">${language}</span>
                    <span class="language-percentage">${percentage}%</span>
                </div>
                <div class="language-bar">
                    <div class="language-progress" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
            `;
            
            container.appendChild(languageElement);
        });
    }
    
    generateColor(index) {
        const colors = [
            '#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', 
            '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'
        ];
        return colors[index % colors.length];
    }
    
    showError(msg) {
        const containers = [
            'githubReposList',
            'languagesChart'
        ];
        
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${msg || 'Ошибка загрузки данных GitHub'}</p>
                    </div>
                `;
            }
        });
        
        // Скрываем статистику профиля
        const profileElements = [
            'githubRepos', 'githubFollowers', 'githubFollowing'
        ];
        
        profileElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });
    }
    
    // Метод для обновления данных
    async refresh() {
        this.cache.clear();
        await this.init();
    }
}

// Инициализация GitHub API после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка для загрузки i18n
    setTimeout(() => {
        window.githubAPI = new GitHubAPI();
    }, 100);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}