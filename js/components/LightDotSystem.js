export class LightDotSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dots = [];
        this.colors = ['#FFD700', '#FF5E5E', '#FFB7C5', '#FFFACD']; // Vàng gold, đỏ, hồng, vàng nhạt
    }

    // Tạo một đốm sáng mới
    createDot() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: Math.random() * 3 + 1, // Bán kính từ 1 đến 4
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speedX: (Math.random() - 0.5) * 0.5, // Bay ngang nhẹ
            speedY: (Math.random() - 0.5) * 0.3, // Bay dọc nhẹ
            opacity: Math.random() * 0.5 + 0.2, // Độ trong suốt
            blinkSpeed: Math.random() * 0.02 + 0.01 // Tốc độ nhấp nháy
        };
    }

    update() {
        // Luôn duy trì khoảng 40-50 đốm sáng để không bị rối mắt
        if (this.dots.length < 50) {
            this.dots.push(this.createDot());
        }

        this.dots.forEach((dot, index) => {
            dot.x += dot.speedX;
            dot.y += dot.speedY;

            // Hiệu ứng nhấp nháy (lúc rõ lúc mờ)
            dot.opacity += dot.blinkSpeed;
            if (dot.opacity > 0.8 || dot.opacity < 0.2) {
                dot.blinkSpeed = -dot.blinkSpeed;
            }

            // Nếu đốm sáng bay ra khỏi màn hình thì xóa đi để tạo cái mới
            if (dot.x < 0 || dot.x > this.canvas.width || dot.y < 0 || dot.y > this.canvas.height) {
                this.dots.splice(index, 1);
            }
        });
    }

    draw() {
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = dot.color;
            this.ctx.globalAlpha = dot.opacity;
            
            // Tạo hiệu ứng tỏa sáng (glow) xung quanh đốm
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = dot.color;
            
            this.ctx.fill();
            this.ctx.closePath();
        });
        
        // Reset lại globalAlpha và shadow để không ảnh hưởng đến các thành phần khác
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
}