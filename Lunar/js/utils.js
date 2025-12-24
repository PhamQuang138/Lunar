export function random(min, max) {
    return Math.random() * (max - min) + min;
}

export function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Hàm linear interpolation để di chuyển mượt mà
export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}