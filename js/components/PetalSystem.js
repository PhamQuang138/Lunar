export class PetalSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.petals = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createPetal() {
        return {
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * 5 + 5,
            speed: Math.random() * 1 + 0.5,
            angle: Math.random() * Math.PI * 2,
            spin: Math.random() * 0.02
        };
    }

    update() {
        if (this.petals.length < 30) { // Giữ mật độ thưa như anh muốn
            this.petals.push(this.createPetal());
        }

        this.petals.forEach((p, i) => {
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 0.5;
            p.angle += p.spin;

            if (p.y > this.canvas.height) this.petals.splice(i, 1);
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffb7c5'; // Màu hoa đào
        this.petals.forEach(p => {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}