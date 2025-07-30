// Визуальные эффекты и 3D анимации
class VisualEffects {
    constructor() {
        this.init();
    }
   
    init() {
        this.setup3DTextEffects();
        this.setupScrollAnimations();
    }
    
    // Дополнительные эффекты для 3D текста
    setup3DTextEffects() {
        const text3D = document.querySelectorAll('.text-3d');
        
        text3D.forEach(text => {
            text.addEventListener('mouseenter', () => {
                this.create3DTextParticles(text);
            });
            
            // Добавляем эффект печатной машинки для некоторых заголовков
            if (text.dataset.typewriter !== 'false') {
                this.typewriterEffect(text);
            }
        });
    }
    
    // Эффект печатной машинки
    typewriterEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid #667eea';
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 500);
            }
        }, 100);
    }
    
    // Создание частиц для 3D текста
    create3DTextParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'text-particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation: particleFloat 2s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }
    
    // Анимации при скролле
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    // Анимация для 3D текста
                    if (element.classList.contains('text-3d')) {
                        this.animate3DText(element);
                    }
                }
            });
        }, { threshold: 0.3 });
        
        // Наблюдаем за всеми элементами с эффектами
        document.querySelectorAll('.section-divider, .text-3d').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Анимация 3D текста при появлении
    animate3DText(text) {
        text.style.transform = 'perspective(500px) rotateX(90deg) scale(0.5)';
        text.style.opacity = '0';
        text.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            text.style.transform = 'perspective(500px) rotateX(15deg) scale(1)';
            text.style.opacity = '1';
        }, 100);
    }
    
    // Звуковой эффект (если поддерживается)
    playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Звук не поддерживается, игнорируем
        }
    }
    
    // Метод для создания дополнительных эффектов
    createFloatingElements() {
        const floatingElements = [];
        const elementCount = 5;
        
        for (let i = 0; i < elementCount; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                animation: float ${5 + Math.random() * 5}s ease-in-out infinite;
            `;
            
            document.body.appendChild(element);
            floatingElements.push(element);
        }
        
        return floatingElements;
    }
}

// CSS анимации для частиц и плавающих элементов
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0);
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
        }
    }
    
    .floating-element {
        animation: float 6s ease-in-out infinite;
    }
    
    .text-particle {
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
    }
`;
document.head.appendChild(style);

// Инициализация визуальных эффектов
document.addEventListener('DOMContentLoaded', () => {
    const visualEffects = new VisualEffects();
    
    // Создаем плавающие элементы
    visualEffects.createFloatingElements();
    
    // Делаем доступным глобально
    window.visualEffects = visualEffects;
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffects;
}