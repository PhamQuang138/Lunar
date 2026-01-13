import { PetalSystem } from './components/PetalSystem.js';
import { LightDotSystem } from './components/LightDotSystem.js';
import { FireworkSystem } from './components/FireworkSystem.js';
import { wishes } from './data/wishes.js';
import { Tree3D } from './components/Tree3D.js';

// --- 1. KHỞI TẠO CÁC HỆ THỐNG ---
const petalCanvasId = 'petal-canvas';
const petals = new PetalSystem(petalCanvasId);
const lightDots = new LightDotSystem(petalCanvasId);
const fireworks = new FireworkSystem('firework-canvas');

const fireworkSound = new Audio('./assets/audio/firework.mp3');
const openLixiSound = new Audio('./assets/audio/paper-rip.mp3');
fireworkSound.volume = 0.6;
openLixiSound.volume = 0.8;

// Khởi tạo cây đào (Né hoàn toàn logic bên trong để anh xoay cây đào thoải mái)
const tree3D = new Tree3D('tree-container-3d');

// Trạng thái giao diện
let isFireworkSpace = false; 
let hasStartedShow = false;
let flareInterval = null; 
let userPhotos = [];

// --- 2. QUẢN LÝ ẢNH KỶ NIỆM ---
const photoInput = document.getElementById('photo-upload');
if (photoInput) {
    photoInput.addEventListener('change', function (e) {
        const files = Array.from(e.target.files).slice(0, 10 - userPhotos.length);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => userPhotos.push(event.target.result);
            reader.readAsDataURL(file);
        });
        if (files.length > 0) alert(`Đã thêm ${files.length} ảnh kỷ niệm!`);
    });
}

// --- 3. LOOP ANIMATION (Hoa rơi & Đốm sáng) ---
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

// --- 4. GIAO DIỆN 1: TƯƠNG TÁC LÌ XÌ ---
window.openLixi = () => {
    if (isFireworkSpace) return; 
    openLixiSound.play().catch(() => { });
    const modal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    const lixiImg = document.getElementById('lixi-display-img');

    // Đổ lời chúc vào Modal (Font Dancing Script đã cài ở CSS)
    wishText.innerText = wishes[Math.floor(Math.random() * wishes.length)];
    
    if (userPhotos.length > 0) {
        lixiImg.src = userPhotos[Math.floor(Math.random() * userPhotos.length)];
        lixiImg.style.borderRadius = "15px";
        lixiImg.style.objectFit = "cover";
    } else {
        lixiImg.src = 'assets/images/lixi-open.png';
        lixiImg.style.borderRadius = "0";
    }
    modal.classList.add('active');
};

window.closeWish = () => {
    document.getElementById('wish-modal').classList.remove('active');
};

// --- 5. GIAO DIỆN 2: PHÁO HOA & CHUYỂN CẢNH (PC OPTIMIZED) ---

/**
 * BƯỚC 1: TRƯỢT SANG PHẢI
 * Lướt sang bầu trời, hạ camera xuống -40vh để nhìn thấy chú ngựa đầu tiên.
 */
window.triggerFireworks = () => {
    isFireworkSpace = false; 
    hasStartedShow = false;

    const scene = document.getElementById('scene');
    const fireworkBtn = document.getElementById('firework-trigger-btn');
    const uploadBtn = document.getElementById('upload-container');

    // Chuyển động lia cam chéo: Sang phải 100vw và hạ thấp cam xuống 40vh
    scene.style.transform = 'translate(-100vw, -40vh)';
    
    // Bật tương tác chuột cho scene để chuẩn bị bắn pháo
    scene.style.pointerEvents = 'auto';

    if (fireworkBtn) fireworkBtn.classList.add('ui-hidden');
    if (uploadBtn) uploadBtn.classList.add('ui-hidden');

    setTimeout(() => {
        isFireworkSpace = true;
        const hint = document.getElementById('firework-hint');
        if (hint) hint.classList.remove('hidden');
    }, 1200);

    // Chuyển cây 3D sang chế độ nổ (Chỉ gọi lệnh toggle bên ngoài)
    if (tree3D && tree3D.state === 'TREE') tree3D.toggle();
};

/**
 * LẮNG NGHE CLICK CHUỘT ĐỂ BẮN PHÁO
 */
document.addEventListener('mousedown', (e) => {
    // Chỉ kích hoạt khi đã ở không gian pháo hoa và chưa nổ chữ
    if (!isFireworkSpace || hasStartedShow) return;
    
    // Né click vào Modal hoặc nút đóng
    if (e.target.closest('#wish-modal') || e.target.closest('.close-btn')) return;

    startFireworkShow();
});

/**
 * BƯỚC 2: BẮN PHÁO & NGƯỚC NHÌN
 * Đưa tọa độ Y về 0 để camera lia vút từ con ngựa lên đỉnh bầu trời.
 */
function startFireworkShow() {
    hasStartedShow = true;
    const scene = document.getElementById('scene');
    const hint = document.getElementById('firework-hint');
    const horse = document.getElementById('horse-image');

    if (hint) hint.classList.add('hidden');
    fireworkSound.play().catch(() => {});

    // HIỆU ỨNG NGƯỚC NHÌN: Camera lia lên đỉnh bầu trời cao 140vh
    scene.style.transform = 'translate(-100vw, 0)';

    // Nổ dòng chữ chính uốn cong
    fireworks.explodeLunar2026();

    // Hiện ngựa rõ nét
    setTimeout(() => {
        if (horse) horse.classList.add('visible');
    }, 1500);

    // VÒNG LẶP PHÁO PHỤ: Mix giữa pháo rơi và pháo đa sắc không rơi
    flareInterval = setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.4;

        if (Math.random() > 0.5) {
            // Loại 2: Pháo cầu đa sắc, đứng yên mờ dần (MỚI)
            fireworks.launchNoGravitySphere(x, y);
        } else {
            // Loại 1: Pháo sáng vàng, có rơi nhẹ
            fireworks.launchSphericalFlare(x, y);
        }
    }, 1200);

    // Xem show trong 18 giây trước khi tự động quay về
    setTimeout(backToMainInterface, 18000);
}

/**
 * BƯỚC 3: QUAY VỀ CÂY ĐÀO
 */
function backToMainInterface() {
    isFireworkSpace = false;
    hasStartedShow = false;
    const scene = document.getElementById('scene');
    const horse = document.getElementById('horse-image');

    if (flareInterval) clearInterval(flareInterval);
    fireworks.stop();
    if (horse) horse.classList.remove('visible');

    // Trả về vị trí gốc (0, 0)
    scene.style.transform = 'translate(0, 0)';
    
    // QUAN TRỌNG: Tắt pointer-events của scene để giải phóng chuột cho cây đào 3D xoay
    scene.style.pointerEvents = 'none';

    document.getElementById('firework-trigger-btn').classList.remove('ui-hidden');
    document.getElementById('upload-container').classList.remove('ui-hidden');

    if (tree3D && tree3D.state === 'EXPLODED') tree3D.toggle();
}

// --- 6. PHÍM TẮT (KEYBOARD CONTROL) ---
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') tree3D.toggle();
    if (event.code === 'Enter' && !isFireworkSpace) window.triggerFireworks();
});