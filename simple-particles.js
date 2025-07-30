// Функция для создания круглой текстуры частиц
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    
    const context = canvas.getContext('2d');
    const centerX = 64;
    const centerY = 64;
    const radius = 60;
    
    // Создаем радиальный градиент для идеально круглых частиц
    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.1, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    // Очищаем canvas
    context.clearRect(0, 0, 128, 128);
    
    // Рисуем круг
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Простая и надежная система 3D частиц
function initSimpleParticles() {
    console.log('Инициализация простых частиц...');
    
    // Проверяем наличие Three.js
    if (typeof THREE === 'undefined') {
        console.error('Three.js не найден!');
        return;
    }
    
    const canvas = document.getElementById('webgl-bg');
    if (!canvas) {
        console.error('Canvas webgl-bg не найден!');
        return;
    }
    
    // Создаем сцену
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Определяем мобильное устройство
    const isMobile = window.innerWidth <= 768;
    
    // Создаем несколько слоев частиц для глубины
    const particleSystems = [];
    const colorPalette = [
        new THREE.Color(0x667eea),
        new THREE.Color(0x764ba2),
        new THREE.Color(0x4ecdc4),
        new THREE.Color(0xff6b6b),
        new THREE.Color(0x45b7d1)
    ];
    
    // Создаем слои частиц (меньше на мобильных)
    const layerCount = isMobile ? 2 : 3;
    for (let layer = 0; layer < layerCount; layer++) {
        const particleCount = isMobile ? 500 + layer * 200 : 1500 + layer * 500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const layerDepth = 10 + layer * 5;
        
        for (let i = 0; i < particleCount; i++) {
            // Позиции с разной глубиной для каждого слоя
            positions[i * 3] = (Math.random() - 0.5) * layerDepth;
            positions[i * 3 + 1] = (Math.random() - 0.5) * layerDepth;
            positions[i * 3 + 2] = (Math.random() - 0.5) * layerDepth;
            
            // Цвета
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Размеры - делаем частицы более заметными
            sizes[i] = Math.random() * 0.05 + 0.03;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.08 + layer * 0.02, // Увеличиваем размер
            transparent: true,
            opacity: 0.8 - layer * 0.1, // Увеличиваем непрозрачность
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: createCircleTexture(), // Добавляем круглую текстуру
            alphaTest: 0.1
        });
        
        const particleSystem = new THREE.Points(particles, material);
        particleSystem.userData = {
            layer: layer,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.001
            },
            originalPosition: particleSystem.position.clone()
        };
        
        scene.add(particleSystem);
        particleSystems.push(particleSystem);
    }
    
    camera.position.z = 8;
    
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;
    
    // Отслеживание мыши (только на десктопе)
    if (!isMobile) {
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }
    
    // Делаем системы частиц доступными глобально
    window.particleSystems = particleSystems;
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        
        // Анимация каждого слоя частиц
        particleSystems.forEach((system, index) => {
            const userData = system.userData;
            
            // Вращение с разными скоростями для каждого слоя
            system.rotation.x += userData.rotationSpeed.x;
            system.rotation.y += userData.rotationSpeed.y;
            system.rotation.z += userData.rotationSpeed.z;
            
            // Реакция на мышь с учетом слоя (только на десктопе)
            if (!isMobile) {
                const mouseInfluence = 0.0005 / (userData.layer + 1);
                system.rotation.x += mouseY * mouseInfluence;
                system.rotation.y += mouseX * mouseInfluence;
            }
            
            // Осцилляция по Y оси
            const oscillation = Math.sin(time * (0.5 + userData.layer * 0.2)) * (0.5 + userData.layer * 0.3);
            system.position.y = userData.originalPosition.y + oscillation;
            
            // Пульсация масштаба
            const scaleOscillation = 1 + Math.sin(time * 0.3 + userData.layer) * 0.1;
            system.scale.setScalar(scaleOscillation);
            
            // Реакция на скролл (если есть)
            if (userData.scrollInfluence) {
                system.rotation.z += userData.scrollInfluence;
                userData.scrollInfluence *= 0.95;
            }
        });
        
        // Плавное движение камеры (только на десктопе)
        if (!isMobile) {
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.02;
        }
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    console.log('Простые частицы инициализированы успешно!');
    return { scene, camera, renderer, particleSystems };
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка для загрузки Three.js
    setTimeout(initSimpleParticles, 100);
});