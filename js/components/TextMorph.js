export class TextMorphManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.targets = [];
    }

    processText(text) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
        const tCtx = tempCanvas.getContext('2d');

        tCtx.font = 'bold 60px "Segoe UI", sans-serif';
        tCtx.fillStyle = 'white';
        tCtx.textAlign = 'center';
        tCtx.fillText(text, this.width / 2, this.height / 3);

        const imageData = tCtx.getImageData(0, 0, this.width, this.height);
        this.targets = [];

        for (let y = 0; y < this.height; y += 4) {
            for (let x = 0; x < this.width; x += 4) {
                const alpha = imageData.data;
                if (alpha > 128) {
                    this.targets.push({ x, y });
                }
            }
        }
        return this.targets;
    }
}