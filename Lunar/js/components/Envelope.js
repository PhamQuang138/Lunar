export class Envelope {
    constructor(containerId, onClick) {
        this.container = document.getElementById(containerId);
        this.onClick = onClick;
        // Tọa độ và kích thước mới cho bao lì xì
        this.positions = [
            // Bao bên trái
            { top: '50%', left: '39%', width: '65px' },
            // Bao ở giữa
            { top: '55%', left: '53%', width: '60px' },
            // Bao bên phải
            { top: '50%', left: '62%', width: '70px' },
            // Bao cao ở giữa
            { top: '35%', left: '46%', width: '60px' },
            // Bao thấp bên phải
            { top: '40%', left: '58%', width: '65px' }
        ];
    }

    render() {
        this.positions.forEach((pos, index) => {
            const img = document.createElement('img');
            img.src = 'assets/images/lixi.png';
            img.className = 'decoration-item swinging';
            img.style.top = pos.top;
            img.style.left = pos.left;
            img.style.width = pos.width;
            img.style.animationDelay = `${index * 0.4}s`;
            
            img.onclick = (e) => {
                e.stopPropagation();
                this.onClick();
            };
            this.container.appendChild(img);
        });
    }
}