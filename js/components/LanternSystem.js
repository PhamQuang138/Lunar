export class LanternSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // Tọa độ và kích thước lồng đèn
        this.positions = [
            // Lồng đèn bên trái
            { top: '40%', left: '41%', width: '90px' },
            // Lồng đèn ở giữa, treo thấp
            { top: '55%', left: '45%', width: '100px' },
            // Lồng đèn bên phải
            { top: '30%', left: '58%', width: '95px' },
            // Lồng đèn thấp bên phải
            { top: '50%', left: '56%', width: '90px' },
            // Lồng đèn cao bên trái
            { top: '25%', left: '47%', width: '90px' }
        ];
    }

    render() {
        this.positions.forEach((pos, index) => {
            const img = document.createElement('img');
            img.src = 'assets/images/lantern.png';
            // Thêm class 'swinging' để kích hoạt hiệu ứng đung đưa
            img.className = 'decoration-item swinging';
            img.style.top = pos.top;
            img.style.left = pos.left;
            img.style.width = pos.width;
            // Delay để các lồng đèn đung đưa không đồng bộ, nhìn tự nhiên hơn
            img.style.animationDelay = `${index * 0.6}s`;
            this.container.appendChild(img);
        });
    }
}