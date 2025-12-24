export class PeachTree {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.isRecoiling = false;
    }

    // Gọi hàm này khi pháo hoa bắn lên
    recoil() {
        if (this.isRecoiling) return;
        
        this.isRecoiling = true;
        this.container.classList.add('recoil-active');

        // Sau 1.5s thì trả cây về vị trí cũ
        setTimeout(() => {
            this.container.classList.remove('recoil-active');
            this.isRecoiling = false;
        }, 1500);
    }
}