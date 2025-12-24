export class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.textParticles = [];
        this.hue = 0;
    }

    // Bước 1: Lấy tọa độ các hạt từ chữ
    createTextParticles(text) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const fontSize = Math.min(window.innerWidth / 12, 70);
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${fontSize}px "Segoe UI", Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        this.textParticles = [];

        for (let y = 0; y < this.canvas.height; y += 4) {
            for (let x = 0; x < this.canvas.width; x += 4) {
                const index = (y * this.canvas.width + x) * 4;
                if (imageData[index + 3] > 128) {
                    
                    // Logic tạo độ cong: y_cong = y_gốc - k * (khoảng cách tới tâm x)^2
                    const centerX = this.canvas.width / 2;
                    const distFromCenter = x - centerX;
                    const curveAmount = 0.0002; // Chỉnh số này để tăng/giảm độ cong
                    const curvedY = y - (curveAmount * Math.pow(distFromCenter, 2));

                    this.textParticles.push({
                        x: centerX + (Math.random() - 0.5) * 100,
                        y: curvedY + 500, // Bay từ dưới lên
                        targetX: x,
                        targetY: curvedY,
                        // Màu vàng lấp lánh: trộn giữa vàng ròng và trắng sáng
                        color: Math.random() > 0.8 ? '#FFFFFF' : '#FFD700', 
                        size: Math.random() * 2 + 0.5,
                        alpha: 1,
                        sparkle: Math.random() * 0.1, // Độ nhấp nháy
                        ease: 0.04 + Math.random() * 0.03
                    });
                }
            }
        }
    }

    // Bước 2: Hiệu ứng nổ và hội tụ thành chữ
    update() {
        this.textParticles.forEach(p => {
            // Di chuyển hạt về phía vị trí chữ
            p.x += (p.targetX - p.x) * p.ease;
            p.y += (p.targetY - p.y) * p.ease;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.textParticles.forEach(p => {
            // Tạo hiệu ứng lấp lánh bằng cách thay đổi độ sáng liên tục
            const currentAlpha = p.alpha * (0.7 + Math.sin(Date.now() * 0.01) * 0.3);
            
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = currentAlpha;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#FFD700';
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    // Hàm gọi nổ
    explode(text) {
        this.createTextParticles(text);
        this.animate();
    }

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    stop() {
        cancelAnimationFrame(this.animationId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}