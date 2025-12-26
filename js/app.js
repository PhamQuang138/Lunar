// File: js/app.js

import { PetalSystem } from './components/PetalSystem.js';
import { LightDotSystem } from './components/LightDotSystem.js';
import { FireworkSystem } from './components/FireworkSystem.js';
import { wishes } from './data/wishes.js';
import { Tree3D } from './components/Tree3D.js';

// --- KHỞI TẠO CÁC HỆ THỐNG ---
const petalCanvasId = 'petal-canvas';
const petals = new PetalSystem(petalCanvasId);
const lightDots = new LightDotSystem(petalCanvasId);
const fireworks = new FireworkSystem('firework-canvas');
const fireworkSound = new Audio('./assets/audio/firework.mp3');
const openLixiSound = new Audio('./assets/audio/paper-rip.mp3');

// KHỞI TẠO CÂY 3D
const tree3D = new Tree3D('tree-container-3d');

// Cấu hình âm lượng
fireworkSound.volume = 0.6;
openLixiSound.volume = 0.8;

// --- LOOP ANIMATION (CHO HOA RƠI & ĐỐM SÁNG) ---
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

// --- LOGIC MỞ LÌ XÌ ---
let autoCloseTimer = null;

window.openLixi = () => {
    // 1. Phát âm thanh
    openLixiSound.play().catch(() => {});

    // 2. Hiện Modal & Random lời chúc
    const modal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    
    wishText.innerText = randomWish;
    modal.classList.add('active');

    // 3. Tự động đóng sau 10 giây
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
        window.closeWish();
    }, 10000); 
};

window.closeWish = () => {
    document.getElementById('wish-modal').classList.remove('active');
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
};

window.triggerFireworks = () => {
    const jarContainer = document.querySelector('.firework-jars'); 
    const fireworkBtn = document.getElementById('firework-trigger-btn');
    if (jarContainer) jarContainer.classList.add('jar-hidden');
    if (fireworkBtn) fireworkBtn.classList.add('ui-hidden');

    // 1. BẬT CHẾ ĐỘ PHÁO HOA & NỔ CÂY
    tree3D.isFireworkMode = true; // <--- QUAN TRỌNG
    
    if (tree3D.state === 'TREE') {
        tree3D.toggle(); // Cây sẽ nổ và mờ dần do isFireworkMode = true
    }

    const sound = new Audio('./assets/audio/firework.mp3');
    sound.play().catch(e => console.log("User interaction needed"));

    setTimeout(() => {
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        fireworks.explode(randomWish, 'text'); 
    }, 1000);
    
    setTimeout(() => {
        fireworks.stop(); 
        
        // 2. TẮT CHẾ ĐỘ PHÁO HOA & GỌI CÂY VỀ
        tree3D.isFireworkMode = false; // <--- QUAN TRỌNG
        
        if (tree3D.state === 'EXPLODED') {
            tree3D.toggle(); // Cây sẽ bay về và hiện rõ dần
        }
        
        if (jarContainer) jarContainer.classList.remove('jar-hidden');
        if (fireworkBtn) fireworkBtn.classList.remove('ui-hidden');
    }, 10000);
};

// --- SỰ KIỆN PHÍM TẮT ---
document.addEventListener('keydown', (event) => {
    // Phím SPACE: Test nổ cây thủ công
    if (event.code === 'Space') {
        tree3D.toggle();
    }
    // Phím ENTER: Test bắn pháo hoa
    if (event.code === 'Enter') {
        window.triggerFireworks();
    }
});