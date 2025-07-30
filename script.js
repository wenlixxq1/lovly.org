// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Продвинутый параллакс с 3D эффектами и глубиной
let ticking = false;
let mouseX = 0;
let mouseY = 0;
let isMobile = window.innerWidth <= 768;

// Отслеживание мыши для дополнительных эффектов (только на десктопе)
if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
}

function updateParallax() {
    // Отключаем параллакс на мобильных устройствах
    if (isMobile) {
        return;
    }
    
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercent = scrollPosition / (documentHeight - windowHeight);
    
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    parallaxLayers.forEach((layer, index) => {
        const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
        const depth = parseFloat(layer.getAttribute('data-depth')) || 1;
        const rotate = parseFloat(layer.getAttribute('data-rotate')) || 0;
        
        // Основной параллакс эффект
        const yPos = -(scrollPosition * speed);
        
        // 3D трансформации
        const rotateX = mouseY * (5 / depth);
        const rotateY = mouseX * (5 / depth);
        const translateZ = depth * 10;
        
        // Дополнительные эффекты на основе прокрутки
        const scaleEffect = 1 + (scrollPercent * 0.1 / depth);
        const rotateZ = rotate ? scrollPercent * rotate : 0;
        
        // Применяем все трансформации
        layer.style.transform = `
            translateY(${yPos}px) 
            translateZ(${translateZ}px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            rotateZ(${rotateZ}deg) 
            scale(${scaleEffect})
        `;
        
        // Дополнительные эффекты прозрачности
        const rect = layer.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(elementCenter - windowHeight / 2);
        const maxDistance = windowHeight / 2;
        const opacity = Math.max(0.3, 1 - (distanceFromCenter / maxDistance) * 0.7);
        
        layer.style.opacity = opacity;
    });
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);
window.addEventListener('resize', () => {
    // Обновляем флаг мобильного устройства при изменении размера
    isMobile = window.innerWidth <= 768;
    requestTick();
});

// Инициализация 3D контекста для параллакс элементов
document.addEventListener('DOMContentLoaded', () => {
    const parallaxContainer = document.querySelector('.parallax-header');
    if (parallaxContainer) {
        parallaxContainer.style.transformStyle = 'preserve-3d';
        parallaxContainer.style.perspective = '1000px';
    }
    
    // Инициальный вызов параллакса
    requestTick();
});

// Дополнительные интерактивные эффекты для 3D частиц
let scrollDirection = 0;
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollDirection = scrollTop > lastScrollTop ? 1 : -1;
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    
    // Передаем информацию о скролле в WebGL сцену (если она существует)
    if (window.particleSystems) {
        window.particleSystems.forEach((system, index) => {
            if (system.userData) {
                system.userData.scrollInfluence = scrollDirection * 0.001;
            }
        });
    }
});

// Hover эффекты полностью убраны для чистого интерфейса

// Анимация прогресс-баров навыков
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, 200);
            });
        }
    });
}, observerOptions);

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// Модальные окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Активная ссылка в навигации
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Анимация появления элементов при скролле
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(card);
});

// Конфетти при клике на аватар
document.querySelector('.avatar-inner').addEventListener('click', function() {
    createConfetti();
    this.classList.add('avatar-morph');
    setTimeout(() => {
        this.classList.remove('avatar-morph');
    }, 600);
});

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
        confetti.style.animation = 'confettiFall ' + confetti.style.animationDuration + ' ease-out forwards';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Морфинг логотипа при скролле
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const avatar = document.querySelector('.avatar-inner::after');
    const scrollDiff = Math.abs(window.scrollY - lastScrollY);
    
    if (scrollDiff > 50) {
        document.querySelector('.avatar-inner').style.transform = `scale(${1 + scrollDiff / 1000}) rotate(${scrollDiff / 10}deg)`;
        setTimeout(() => {
            document.querySelector('.avatar-inner').style.transform = 'scale(1) rotate(0deg)';
        }, 200);
        lastScrollY = window.scrollY;
    }
});

// Генератор случайных фактов
let facts = [
    'Я могу писать код в 5 утра и чувствовать себя прекрасно',
    'Мой первый код был на Python, когда мне было 14',
    'Моя любимая ошибка - "undefined is not a function"',
    'Я вообще не пью чай',
    'У меня есть коллекция из 25+ клавиатур',
    'Я могу написать "Hello World" на 9 языках',
    'Мой любимый цвет - #4a055fff'
];

// Функция для обновления массива фактов (используется системой i18n)
window.updateFactsArray = function(newFacts) {
    facts = newFacts;
};

document.getElementById('factBtn').addEventListener('click', function() {
    const factText = document.getElementById('factText');
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    
    factText.classList.remove('show');
    setTimeout(() => {
        factText.textContent = randomFact;
        factText.classList.add('show');
    }, 150);
});

// Голосовое приветствие
document.getElementById('voiceBtn').addEventListener('click', function() {
    if ('speechSynthesis' in window) {
        const currentLang = window.i18n ? window.i18n.getCurrentLang() : 'ru';
        const utterance = new SpeechSynthesisUtterance();
        
        if (currentLang === 'en') {
            utterance.text = "Hello! My name is Artem Lovly. I'm a Full-Stack developer. Nice to see you on my website!";
            utterance.lang = 'en-US';
        } else {
            utterance.text = "Привет! Меня зовут Артём Ловли. Я Full-Stack разработчик. Рад видеть вас на моём сайте!";
            utterance.lang = 'ru-RU';
        }
        
        utterance.rate = 0.9;
        
        const voices = speechSynthesis.getVoices();
        const targetVoice = voices.find(voice => voice.lang.includes(currentLang === 'en' ? 'en' : 'ru'));
        if (targetVoice) {
            utterance.voice = targetVoice;
        }
        
        speechSynthesis.speak(utterance);
        
        this.classList.add('active');
        setTimeout(() => {
            this.classList.remove('active');
        }, 3000);
    } else {
        const errorMsg = window.i18n && window.i18n.getCurrentLang() === 'en' 
            ? 'Your browser does not support speech synthesis' 
            : 'Ваш браузер не поддерживает синтез речи';
        alert(errorMsg);
    }
});

// Матричный дождь
function createMatrixRain() {
    const matrix = document.querySelector('.matrix-rain');
    const chars = '01ЛОВЛИARTEM';
    
    for (let i = 0; i < 20; i++) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.left = Math.random() * 100 + '%';
        column.style.color = '#667eea';
        column.style.fontSize = '14px';
        column.style.fontFamily = 'monospace';
        column.style.animation = `matrixFall ${Math.random() * 2 + 2}s linear infinite`;
        column.style.animationDelay = Math.random() * 2 + 's';
        
        let text = '';
        for (let j = 0; j < 20; j++) {
            text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
        }
        column.innerHTML = text;
        matrix.appendChild(column);
    }
}

if (document.querySelector('.matrix-rain')) {
    createMatrixRain();
}

// Lazy loading изображений
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll('.lazy-image').forEach(img => {
    imageObserver.observe(img);
});

// Копирование адресов для донатов
document.addEventListener('DOMContentLoaded', () => {
    // Обработчик для адресов
    document.querySelectorAll('.donate-address').forEach(address => {
        address.addEventListener('click', (e) => {
            e.preventDefault();
            const fullAddress = address.parentElement.querySelector('.copy-donate-btn').getAttribute('data-address');
            copyToClipboard(fullAddress, address);
        });
    });
    
    // Обработчик для кнопок копирования
    document.querySelectorAll('.copy-donate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const address = btn.getAttribute('data-address');
            const addressElement = btn.parentElement.querySelector('.donate-address');
            copyToClipboard(address, addressElement);
        });
    });
});

function copyToClipboard(text, feedbackElement) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(feedbackElement);
        }).catch(() => {
            fallbackCopy(text, feedbackElement);
        });
    } else {
        fallbackCopy(text, feedbackElement);
    }
}

function showCopyFeedback(element) {
    element.style.background = 'rgba(102, 126, 234, 0.4)';
    element.textContent = 'Скопировано!';
    setTimeout(() => {
        element.style.background = 'rgba(102, 126, 234, 0.1)';
        element.textContent = element.dataset.original;
    }, 1000);
}

function fallbackCopy(text, element) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopyFeedback(element);
}

// Сохраняем оригинальные тексты
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.donate-address').forEach(address => {
        address.dataset.original = address.textContent.trim();
    });
});

// Пауза анимаций при неактивной вкладке
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});

ни// (Код для куба удалён)

// Улучшенные переходы между секциями
document.addEventListener('DOMContentLoaded', () => {
    const dividers = document.querySelectorAll('.section-divider');
    
    // Добавляем частицы к переходам при скролле
    const particleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createTransitionParticles(entry.target);
            }
        });
    }, { threshold: 0.5 });

    dividers.forEach(divider => {
        particleObserver.observe(divider);
    });
});

// Создание частиц для переходов
function createTransitionParticles(divider) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 6 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.pointerEvents = 'none';
        particle.style.opacity = '0.7';
        particle.style.animation = `particleFloat ${Math.random() * 3 + 2}s ease-out forwards`;
        
        divider.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 5000);
    }
}

// CSS анимация для частиц (добавляется динамически)
if (!document.querySelector('#particle-animation-style')) {
    const style = document.createElement('style');
    style.id = 'particle-animation-style';
    style.textContent = `
        @keyframes particleFloat {
            0% {
                transform: translateY(0) scale(0);
                opacity: 0;
            }
            20% {
                opacity: 0.7;
                transform: translateY(-20px) scale(1);
            }
            80% {
                opacity: 0.7;
                transform: translateY(-60px) scale(1);
            }
            100% {
                transform: translateY(-100px) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}