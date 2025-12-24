export class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.textParticles = [];
        this.animationId = null;
    }

    // --- LOGIC 1: XỬ LÝ ẢNH (MỚI) ---
    createImageParticles(imageSrc) {
        const img = new Image();
        img.src = imageSrc;

        // Phải chờ ảnh tải xong mới xử lý được
        img.onload = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // 1. Tính toán tỷ lệ để ảnh vừa vặn màn hình (không quá to)
            const maxW = window.innerWidth * 0.5; // Ảnh chiếm tối đa 50% chiều rộng
            const maxH = window.innerHeight * 0.5;
            let drawW = img.width;
            let drawH = img.height;
            const ratio = Math.min(maxW / drawW, maxH / drawH);
            
            drawW *= ratio;
            drawH *= ratio;

            // 2. Vẽ ảnh vào giữa màn hình
            const startX = (this.canvas.width - drawW) / 2;
            const startY = (this.canvas.height - drawH) / 2;
            this.ctx.drawImage(img, startX, startY, drawW, drawH);

            // 3. Gọi hàm xử lý chung để biến pixel thành hạt (Giữ màu gốc của ảnh)
            this.processCanvasToParticles(true); 
            
            // 4. Bắt đầu chạy
            this.animate();
        };

        img.onerror = () => {
            console.error("Lỗi: Không tìm thấy ảnh tại đường dẫn " + imageSrc);
            // Fallback: Nếu lỗi ảnh thì hiện chữ báo lỗi
            this.explode("Lỗi Ảnh", "text");
        };
    }

    // --- LOGIC 2: XỬ LÝ CHỮ (CŨ - Đã tối ưu) ---
    createTextParticles(text) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const fontSize = Math.min(window.innerWidth / 12, 70);
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${fontSize}px "Segoe UI", Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle'; 
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

        // Gọi hàm xử lý chung (Không giữ màu gốc -> dùng màu Vàng/Trắng)
        this.processCanvasToParticles(false);
        this.animate();
    }

    // --- LOGIC CHUNG: QUÉT PIXEL & TẠO HẠT ---
    processCanvasToParticles(useOriginalColor) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        this.textParticles = [];
        
        // Gap: Độ thưa của hạt (tăng lên 4 hoặc 5 nếu máy lag)
        const gap = 4; 

        for (let y = 0; y < this.canvas.height; y += gap) {
            for (let x = 0; x < this.canvas.width; x += gap) {
                const index = (y * this.canvas.width + x) * 4;
                const alpha = imageData[index + 3];

                if (alpha > 128) {
                    // Lấy màu gốc từ ảnh (R, G, B)
                    const r = imageData[index];
                    const g = imageData[index + 1];
                    const b = imageData[index + 2];

                    // Logic độ cong cũ của bạn
                    const centerX = this.canvas.width / 2;
                    const distFromCenter = x - centerX;
                    const curveAmount = 0.0002;
                    const curvedY = y - (curveAmount * Math.pow(distFromCenter, 2));

                    // Quyết định màu sắc
                    let particleColor;
                    if (useOriginalColor) {
                        particleColor = `rgb(${r},${g},${b})`; // Màu của logo
                    } else {
                        particleColor = Math.random() > 0.8 ? '#FFFFFF' : '#FFD700'; // Màu chữ mặc định
                    }

                    this.textParticles.push({
                        x: centerX + (Math.random() - 0.5) * 50, // Xuất phát từ tâm
                        y: window.innerHeight + 100, // Bay từ dưới đáy lên
                        targetX: x,
                        targetY: curvedY,
                        color: particleColor,
                        size: Math.random() * 2 + 0.5,
                        alpha: 1,
                        baseAlpha: 1, // Lưu alpha gốc để làm hiệu ứng nhấp nháy
                        ease: 0.03 + Math.random() * 0.03
                    });
                }
            }
        }
        // Xóa canvas sau khi quét xong để chuẩn bị vẽ animation
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        this.textParticles.forEach(p => {
            p.x += (p.targetX - p.x) * p.ease;
            p.y += (p.targetY - p.y) * p.ease;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.textParticles.forEach(p => {
            // Hiệu ứng lấp lánh
            const currentAlpha = p.baseAlpha * (0.6 + Math.sin(Date.now() * 0.01) * 0.4);
            
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = currentAlpha;
            
            // Chỉ đổ bóng nhẹ để tăng hiệu suất
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    // --- HÀM GỌI CHÍNH (ĐÃ CẬP NHẬT) ---
    // type: 'text' hoặc 'image'
    explode(content, type = 'text') {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (type === 'image') {
            this.createImageParticles(content);
        } else {
            this.createTextParticles(content);
        }
    }

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}