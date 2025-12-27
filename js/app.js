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

// Khởi tạo âm thanh
const fireworkSound = new Audio('./assets/audio/firework.mp3');
const openLixiSound = new Audio('./assets/audio/paper-rip.mp3');
fireworkSound.volume = 0.6;
openLixiSound.volume = 0.8;

// Khởi tạo cây 3D
const tree3D = new Tree3D('tree-container-3d');

// --- 2. QUẢN LÝ ẢNH KỶ NIỆM (USER PHOTOS) ---
let userPhotos = []; // Mảng lưu tối đa 10 ảnh

// Lắng nghe sự kiện upload ảnh
const photoInput = document.getElementById('photo-upload');
const uploadBtn = document.getElementById('upload-btn');

if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const remainingSlots = 10 - userPhotos.length;
        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                userPhotos.push(event.target.result);
                // Nếu đủ 10 ảnh thì ẩn nút upload
                if (userPhotos.length >= 10 && uploadBtn) {
                    uploadBtn.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        });

        if (filesToAdd.length > 0) {
            alert(`Đã thêm thành công ${filesToAdd.length} ảnh kỷ niệm!`);
        }
    });
}

// --- 3. LOOP ANIMATION CHÍNH ---
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

// --- 4. LOGIC TƯƠNG TÁC LÌ XÌ ---
let autoCloseTimer = null;

window.openLixi = () => {
    // Phát âm thanh xé giấy
    openLixiSound.play().catch(() => {});

    const modal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    const lixiImg = document.getElementById('lixi-display-img');
    
    // Chọn lời chúc ngẫu nhiên
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    wishText.innerText = randomWish;

    // Hiển thị ảnh kỷ niệm nếu có, nếu không thì dùng ảnh mặc định
    if (userPhotos.length > 0) {
        const randomPhoto = userPhotos[Math.floor(Math.random() * userPhotos.length)];
        lixiImg.src = randomPhoto;
        lixiImg.style.borderRadius = "15px"; // Bo góc ảnh kỷ niệm cho đẹp
        lixiImg.style.objectFit = "cover";
    } else {
        lixiImg.src = 'assets/images/lixi-open.png';
        lixiImg.style.borderRadius = "0";
    }

    modal.classList.add('active');

    // Tự động đóng sau 10 giây
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
        window.closeWish();
    }, 10000); 
};

window.closeWish = () => {
    const modal = document.getElementById('wish-modal');
    if (modal) modal.classList.remove('active');
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
};

let continuousFireworkInterval = null;
// --- 5. LOGIC BẮN PHÁO HOA 2026 ---
// --- SỬA LẠI HÀM TRIGGER ---
window.triggerFireworks = () => {
    // ... (Phần ẩn UI và phát nhạc giữ nguyên) ...
    const jarContainer = document.querySelector('.firework-jars'); 
    const fireworkBtn = document.getElementById('firework-trigger-btn');
    const uploadBtnContainer = document.getElementById('upload-container');
    const horseImage = document.getElementById('horse-image'); // Lấy ảnh ngựa

    if (jarContainer) jarContainer.classList.add('jar-hidden');
    if (fireworkBtn) fireworkBtn.classList.add('ui-hidden');
    if (uploadBtnContainer) uploadBtnContainer.classList.add('ui-hidden');

    tree3D.isFireworkMode = true; 
    if (tree3D.state === 'TREE') tree3D.toggle(); 
    fireworkSound.play().catch(() => {});

    // 1. Bắt đầu nổ chữ chính
    setTimeout(() => {
        fireworks.explodeText2026(); 
        if (horseImage) horseImage.classList.add('visible'); // Hiện ngựa mờ ảo sang rõ nét
    }, 800);

    // 2. Bắt đầu vòng lặp nổ pháo hoa phụ LIÊN TỤC
    if (continuousFireworkInterval) clearInterval(continuousFireworkInterval);
    continuousFireworkInterval = setInterval(() => {
        fireworks.launchFlare();
    }, 1200);
    
    // 3. Kết thúc sau 10 giây
    setTimeout(() => {
        if (continuousFireworkInterval) {
            clearInterval(continuousFireworkInterval);
            continuousFireworkInterval = null;
        }
        fireworks.stop(); 
        if (horseImage) horseImage.classList.remove('visible');
        
        tree3D.isFireworkMode = false;
        if (tree3D.state === 'EXPLODED') tree3D.toggle();
        if (jarContainer) jarContainer.classList.remove('jar-hidden');
        if (fireworkBtn) fireworkBtn.classList.remove('ui-hidden');
        if (uploadBtnContainer) uploadBtnContainer.classList.remove('ui-hidden');
    }, 10000);
};

// --- 6. PHÍM TẮT ĐIỀU KHIỂN ---
document.addEventListener('keydown', (event) => {
    // Phím SPACE: Đảo ngược trạng thái cây 3D
    if (event.code === 'Space') {
        tree3D.toggle();
    }
    // Phím ENTER: Bắn pháo hoa nhanh
    if (event.code === 'Enter') {
        window.triggerFireworks();
    }
});