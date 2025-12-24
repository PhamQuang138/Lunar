import { PetalSystem } from './components/PetalSystem.js';
import { LightDotSystem } from './components/LightDotSystem.js';
import { FireworkSystem } from './components/FireworkSystem.js';
import { Envelope } from './components/Envelope.js';
import { wishes } from './data/wishes.js';
import { LanternSystem } from './components/LanternSystem.js';

// Khởi tạo
const petalCanvasId = 'petal-canvas';
const petals = new PetalSystem(petalCanvasId);
const lightDots = new LightDotSystem(petalCanvasId);
const fireworks = new FireworkSystem('firework-canvas');
const fireworkSound = new Audio('./assets/audio/firework.mp3');
const openLixiSound = new Audio('./assets/audio/paper-rip.mp3');
const lanternSystem = new LanternSystem('lanterns-wrapper');
lanternSystem.render();

fireworkSound.volume = 0.6;
openLixiSound.volume = 0.8;

// Khởi tạo lì xì
const envelopeSystem = new Envelope('envelopes-wrapper', () => window.openLixi());
envelopeSystem.render();

// Vòng lặp animation chính
function animate() {
    const canvas = document.getElementById(petalCanvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.update();
        petals.draw();
        lightDots.update();
        lightDots.draw();
    }
    requestAnimationFrame(animate);
}
animate();

// Tương tác Lì xì
window.openLixi = () => {
    // Phát âm thanh xé giấy
    openLixiSound.play().catch(e => console.log("Chờ tương tác để phát nhạc"));
    
    const modal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    wishText.innerText = randomWish;
    modal.classList.add('active');
};

window.closeWish = () => {
    document.getElementById('wish-modal').classList.remove('active');
};

// Tương tác Pháo hoa
window.triggerFireworks = () => {
    const fireworkSound = new Audio('./assets/audio/firework.mp3');
    fireworkSound.play();

    const scene = document.getElementById('scene');
    scene.style.transform = 'translateY(-100vh)'; // Cuộn lên trời để xem pháo
    
    setTimeout(() => {
        fireworks.explode("CHÚC MỪNG NĂM MỚI");
    }, 1000);
    
    setTimeout(() => {
        fireworks.stop();
        scene.style.transform = 'translateY(0)';
    }, 9000);
};