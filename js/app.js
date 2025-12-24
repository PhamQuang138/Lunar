import { PetalSystem } from './components/PetalSystem.js';
import { LightDotSystem } from './components/LightDotSystem.js';
import { FireworkSystem } from './components/FireworkSystem.js';
import { Envelope } from './components/Envelope.js';
import { wishes } from './data/wishes.js';
import { LanternSystem } from './components/LanternSystem.js';
// IMPORT FILE 3D MỚI
import { Tree3D } from './components/Tree3D.js'; 

// --- KHỞI TẠO ---
const petalCanvasId = 'petal-canvas';
const petals = new PetalSystem(petalCanvasId);
const lightDots = new LightDotSystem(petalCanvasId);
const fireworks = new FireworkSystem('firework-canvas');
const fireworkSound = new Audio('./assets/audio/firework.mp3');
const openLixiSound = new Audio('./assets/audio/paper-rip.mp3');

// KHỞI TẠO CÂY 3D (Thay thế MagicTree cũ)
// Lưu ý: ID 'tree-container-3d' phải khớp với HTML
const tree3D = new Tree3D('tree-container-3d', './assets/images/peach-tree-blank.png');

const lanternSystem = new LanternSystem('lanterns-wrapper');
lanternSystem.render();

fireworkSound.volume = 0.6;
openLixiSound.volume = 0.8;

// Khởi tạo lì xì
const envelopeSystem = new Envelope('envelopes-wrapper', () => window.openLixi());
envelopeSystem.render();

// Animation chính (cho hoa rơi)
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
    openLixiSound.play().catch(e => console.log("Chờ tương tác"));
    const modal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    wishText.innerText = wishes[Math.floor(Math.random() * wishes.length)];
    modal.classList.add('active');
};

window.closeWish = () => {
    document.getElementById('wish-modal').classList.remove('active');
};

// Hàm xử lý pháo hoa
window.triggerFireworks = () => {
    const jarContainer = document.querySelector('.firework-jars'); 
    if (jarContainer) jarContainer.classList.add('jar-hidden');

    fireworkSound.play().catch(e => console.log("Chưa tương tác"));
    const scene = document.getElementById('scene');
    scene.style.transform = 'translateY(-100vh)'; 
    
    setTimeout(() => {
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        fireworks.explode(randomWish, 'text'); 
    }, 1000);
    
    setTimeout(() => {
        fireworks.stop(); 
        scene.style.transform = 'translateY(0)'; 
        if (jarContainer) jarContainer.classList.remove('jar-hidden');
    }, 10000);
};

// --- SỰ KIỆN PHÍM TẮT (NỔ CÂY & ẨN ICON) ---
document.addEventListener('keydown', (event) => {
    // Phím SPACE: Nổ cây + Ẩn icon
    if (event.code === 'Space') {
        tree3D.toggle();

        // Lấy tất cả icon (Lì xì, Đèn, Pháo, các đốm trang trí)
        const icons = document.querySelectorAll('.jar, .envelope, .lantern, .decoration-item');
        
        if (tree3D.state === 'EXPLODED') {
            // Nếu cây nổ -> Ẩn hết icon đi
            icons.forEach(el => {
                el.style.transition = "opacity 0.5s"; // Thêm hiệu ứng mờ dần
                el.style.opacity = "0";
                el.style.pointerEvents = "none"; // Không cho bấm nhầm
            });
        } else {
            // Nếu cây hợp lại -> Hiện icon sau 1 giây (đợi hạt bay về)
            setTimeout(() => {
                icons.forEach(el => {
                    el.style.opacity = "1";
                    el.style.pointerEvents = "auto";
                });
            }, 1000);
        }
    }

    if (event.code === 'Enter') {
        window.triggerFireworks();
    }
});