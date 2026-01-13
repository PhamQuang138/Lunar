export class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.textParticles = [];
        this.animationId = null;
        this.mainColor = '#FFD700';
        this.colors = ['#FF3131', '#FFD700', '#00F5FF', '#EA00FF', '#39FF14', '#FFFFFF', '#FFBA00', '#FF4500'];
        
        // Thông số phối cảnh cho 3D
        this.focalLength = 400; 
    }

    // --- LOẠI 2: PHÁO CẦU 3D ĐA SẮC (KHÔNG TRỌNG LỰC) ---
    launchNoGravitySphere(centerX, centerY) {
        const particleCount = 250; // Tăng số lượng hạt để khối cầu dày đặc và đẹp mắt
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const explosionPower = Math.random() * 5 + 5;

        for (let i = 0; i < particleCount; i++) {
            // Sử dụng tọa độ cầu (Spherical Coordinates) để phân bổ hạt đều trong không gian 3D
            const theta = Math.random() * Math.PI * 2; // Góc quay quanh trục Y
            const phi = Math.acos((Math.random() * 2) - 1); // Góc nghiêng so với trục Z
            const speed = Math.random() * explosionPower;

            // Vectơ vận tốc trong không gian 3 chiều
            const vx = Math.sin(phi) * Math.cos(theta) * speed;
            const vy = Math.sin(phi) * Math.sin(theta) * speed;
            const vz = Math.cos(phi) * speed;

            this.textParticles.push({
                x3d: 0, y3d: 0, z3d: 0, // Tọa độ tương đối so với tâm nổ
                vx: vx, vy: vy, vz: vz,
                originX: centerX, originY: centerY,
                color: color,
                alpha: 1,
                friction: 0.95, 
                decay: Math.random() * 0.007 + 0.005, // Mờ dần cực kỳ chậm và nghệ thuật
                isFlare: true,
                is3D: true // Đánh dấu đây là loại pháo 3D
            });
        }
    }

    // --- LOẠI 1 & 3: Giữ nguyên logic anh đã ưng ý ---
    launchSphericalFlare(x, y) {
        const color = '#FFD700';
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.textParticles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                color: color, size: Math.random() * 2 + 1,
                alpha: 1, friction: 0.96, gravity: 0.06, decay: 0.012,
                isFlare: true, is3D: false
            });
        }
    }

    explodeLunar2026() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const centerY = this.canvas.height * 0.22;
        const font1 = Math.min(window.innerWidth / 10, 65);
        this.ctx.font = `bold ${font1}px "Dancing Script", cursive`;
        this.ctx.fillText("Chúc mừng năm mới", this.canvas.width / 2, centerY - 50);
        const font2 = Math.min(window.innerWidth / 5, 160);
        this.ctx.font = `bold ${font2}px "Dancing Script", cursive`;
        this.ctx.fillText("2026", this.canvas.width / 2, centerY + 60);
        this.processParticles();
        this.animate();
    }

    processParticles() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        this.textParticles = [];
        const gap = 2;
        for (let y = 0; y < this.canvas.height; y += gap) {
            for (let x = 0; x < this.canvas.width; x += gap) {
                const index = (y * this.canvas.width + x) * 4;
                if (imageData[index + 3] > 128) {
                    const centerX = this.canvas.width / 2;
                    const dx = x - centerX;
                    const curvedY = y + (dx * dx) / 2500;
                    this.textParticles.push({
                        x: centerX, y: window.innerHeight,
                        targetX: x, targetY: curvedY,
                        color: this.mainColor, size: Math.random() * 1.5 + 1.2,
                        alpha: 1, ease: 0.04 + Math.random() * 0.03, isFlare: false, is3D: false
                    });
                }
            }
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        this.textParticles.forEach(p => {
            if (p.isFlare) {
                p.vx *= p.friction; p.vy *= p.friction;
                if (p.is3D) {
                    p.vz *= p.friction;
                    p.x3d += p.vx; p.y3d += p.vy; p.z3d += p.vz;
                    
                    // Tính toán phối cảnh (Projection)
                    const scale = this.focalLength / (this.focalLength + p.z3d);
                    p.renderX = p.originX + p.x3d * scale;
                    p.renderY = p.originY + p.y3d * scale;
                    p.renderSize = Math.max(0.1, (Math.random() * 2 + 2) * scale);
                } else {
                    p.vy += p.gravity || 0;
                    p.x += p.vx; p.y += p.vy;
                }
                p.alpha -= p.decay || 0.012;
            } else {
                p.x += (p.targetX - p.x) * p.ease;
                p.y += (p.targetY - p.y) * p.ease;
            }
        });
        this.textParticles = this.textParticles.filter(p => p.alpha > 0.01);
    }

    draw() {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';

        // Sắp xếp hạt theo chiều sâu (Z-buffer) để hạt ở gần vẽ đè lên hạt ở xa
        this.textParticles.sort((a, b) => (b.z3d || 0) - (a.z3d || 0));

        this.textParticles.forEach(p => {
            const sparkle = Math.sin(Date.now() * 0.02 + p.x) * 0.2 + 0.8;
            this.ctx.globalAlpha = Math.max(0, p.alpha * sparkle);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            
            if (p.is3D) {
                this.ctx.arc(p.renderX, p.renderY, p.renderSize, 0, Math.PI * 2);
            } else {
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        });
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