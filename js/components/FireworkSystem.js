export class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.textParticles = [];
        this.animationId = null;
        this.mainColor = '#FFD700'; // Vàng Gold
        this.colors = ['#FF3131', '#FF5E13', '#00F5FF', '#39FF14', '#EA00FF', '#FFFFFF'];
    }

    explodeText2026() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // 1. Chữ to rõ và sang trọng
        const fontSize = Math.min(window.innerWidth / 9, 100); 
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${fontSize}px "Dancing Script", cursive`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText("Chúc mừng năm mới - 2026", this.canvas.width / 2, this.canvas.height / 3);

        this.processCanvasToParticlesWithCurve();
        this.animate();
    }

    processCanvasToParticlesWithCurve() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        this.textParticles = [];
        const gap = 3;

        for (let y = 0; y < this.canvas.height; y += gap) {
            for (let x = 0; x < this.canvas.width; x += gap) {
                const index = (y * this.canvas.width + x) * 4;
                if (imageData[index + 3] > 128) {
                    const centerX = this.canvas.width / 2;
                    const dx = x - centerX;
                    
                    // --- ĐẢO NGƯỢC HƯỚNG CONG (Cầu vồng) ---
                    const curveOffset = (dx * dx) / 1800; 
                    const curvedY = y + curveOffset; 

                    this.textParticles.push({
                        x: centerX, y: window.innerHeight, 
                        targetX: x, targetY: curvedY,
                        color: Math.random() > 0.8 ? '#FFFFFF' : this.mainColor,
                        size: Math.random() * 2.5 + 0.8,
                        alpha: 1, friction: 0.92, gravity: 0, ease: 0.05 + Math.random() * 0.05,
                        isFlare: false
                    });
                }
            }
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    launchFlare() {
        // Tọa độ nổ ngẫu nhiên quanh tâm
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 250;
        const startX = this.canvas.width / 2 + Math.cos(angle) * dist;
        const startY = this.canvas.height / 2 + Math.sin(angle) * dist;

        for (let i = 0; i < 25; i++) {
            const particleAngle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.textParticles.push({
                x: startX, y: startY,
                vx: Math.cos(particleAngle) * speed, vy: Math.sin(particleAngle) * speed,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 3 + 1, alpha: 1, friction: 0.95, gravity: 0.08,
                isFlare: true
            });
        }
    }

    draw() {
        // --- GIẢI PHÁP PHÔNG NỀN KHÔNG ĐỔI MÀU ---
        // Sử dụng 'destination-out' để làm mờ các hạt cũ thay vì vẽ đè màu tối
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';

        this.textParticles.forEach(p => {
            const sparkle = Math.sin(Date.now() * 0.02 + p.x) * 0.3 + 0.7;
            this.ctx.globalAlpha = p.alpha * sparkle;
            this.ctx.fillStyle = p.color;
            if (p.isFlare) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = p.color;
            }
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    update() {
        this.textParticles.forEach(p => {
            if (p.isFlare) {
                p.vx *= p.friction; p.vy *= p.friction; p.vy += p.gravity;
                p.x += p.vx; p.y += p.vy;
                p.alpha -= 0.01;
            } else {
                p.x += (p.targetX - p.x) * p.ease;
                p.y += (p.targetY - p.y) * p.ease;
            }
        });
        this.textParticles = this.textParticles.filter(p => p.alpha > 0.01);
    }

    animate() {
        this.update(); this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.textParticles = [];
    }
}