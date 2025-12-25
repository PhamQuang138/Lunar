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
window.openLixi = (element) => {
    openLixiSound.play().catch(() => {});
    
    const modal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    
    wishText.innerText = randomWish;
    modal.classList.add('active');
};

window.closeWish = () => {
    document.getElementById('wish-modal').classList.remove('active');
};

window.closeWish = () => {
    document.getElementById('wish-modal').classList.remove('active');
};

// js/app.js

window.triggerFireworks = () => {
    // 1. Lấy các phần tử cần ẩn để màn hình "sạch" khi xem pháo
    const jarContainer = document.querySelector('.firework-jars'); 
    const fireworkBtn = document.getElementById('firework-trigger-btn');
    const decorations = document.querySelector('#envelopes-wrapper'); // Ẩn lì xì trên cây 3D

    // 2. Thực hiện ẩn UI và phát âm thanh
    if (jarContainer) jarContainer.classList.add('jar-hidden');
    if (fireworkBtn) fireworkBtn.classList.add('ui-hidden');
    if (decorations) decorations.style.opacity = '0';

    const sound = new Audio('assets/audio/firework.mp3');
    sound.play().catch(e => console.log("Cần tương tác với trang để phát nhạc"));

    // 3. Dịch chuyển màn hình lên khu vực pháo hoa
    const scene = document.getElementById('scene');
    scene.style.transform = 'translateY(-100vh)'; 
    
    setTimeout(() => {
        // Lấy lời chúc ngẫu nhiên và kích hoạt hiệu ứng 'text'
        // Chữ sẽ tự động Cong và Lấp Lánh nhờ logic em đã viết trong FireworkSystem.js
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        fireworks.explode(randomWish, 'text'); 
    }, 1000);
    
    // 4. Kết thúc và trả về trạng thái cũ sau 10 giây
    setTimeout(() => {
        fireworks.stop(); 
        scene.style.transform = 'translateY(0)'; 
        
        // Hiện lại các phần tử UI
        if (jarContainer) jarContainer.classList.remove('jar-hidden');
        if (fireworkBtn) fireworkBtn.classList.remove('ui-hidden');
        if (decorations) decorations.style.opacity = '1';
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