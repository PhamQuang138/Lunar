// File: js/components/Tree3D.js

export class Tree3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modelUrl = './assets/3dmodel/3d-model.3ds'; 

        this.state = 'TREE'; 
        this.isReady = false;
        
        // Bảng màu Hài Hòa & Nghệ Thuật
        this.colors = {
            flower: new THREE.Color(0xff69b4), // Hồng đào
            petal: new THREE.Color(0xffb7c5),  // Hồng phấn
            gold: new THREE.Color(0xffcc00),   // Vàng nghệ
            trunk: new THREE.Color(0x4a3728)   // Nâu cà phê
        };

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.set(0, 40, 380); 
        this.camera.lookAt(0, 90, 0); // Nhìn cao lên một chút

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambient);

        this.loadModel();
        this.animate();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createSoftTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255, 255, 255, 1)');     
        grd.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)'); 
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');     
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    loadModel() {
        if (typeof THREE.TDSLoader === 'undefined') return;
        const loader = new THREE.TDSLoader();
        loader.setResourcePath('./assets/3dmodel/');

        loader.load(this.modelUrl, (object) => {
            console.log("Creating Fused Root Giant Tree...");
            object.rotation.x = -Math.PI / 2;
            object.updateMatrixWorld(true);
            this.processParticles(object);
        });
    }

    processParticles(object) {
        const positions = [];
        const targetTree = [];
        const targetExplode = [];
        const colors = [];
        const sizes = [];

        // 1. Quét tam giác
        let allTriangles = [];
        object.traverse((child) => {
            if (child.isMesh) {
                child.updateMatrixWorld(true);
                const geo = child.geometry;
                const pos = geo.attributes.position;
                const idx = geo.index; 
                const getVertex = (index) => {
                    const v = new THREE.Vector3();
                    v.fromBufferAttribute(pos, index);
                    v.applyMatrix4(child.matrixWorld);
                    return v;
                };
                if (idx) {
                    for (let i = 0; i < idx.count; i += 3) allTriangles.push({ a: getVertex(idx.getX(i)), b: getVertex(idx.getX(i+1)), c: getVertex(idx.getX(i+2)) });
                } else {
                    for (let i = 0; i < pos.count; i += 3) allTriangles.push({ a: getVertex(i), b: getVertex(i+1), c: getVertex(i+2) });
                }
            }
        });

        if (allTriangles.length === 0) return;

        // 2. Tính toán
        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        const stepSample = Math.max(1, Math.floor(allTriangles.length / 2000));
        for(let i = 0; i < allTriangles.length; i += stepSample) {
            const t = allTriangles[i];
            min.min(t.a).min(t.b).min(t.c);
            max.max(t.a).max(t.b).max(t.c);
        }

        const size = new THREE.Vector3().subVectors(max, min);
        const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
        
        const DESIRED_HEIGHT = 320; 
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = DESIRED_HEIGHT / maxDim;
        const scaledHeight = size.y * scale;
        
        const bottomY = -70; 
        const yOffset = bottomY - (min.y - center.y) * scale;

        // Số lượng hạt lớn cho 3 cây
        const MAX_PARTICLES = 90000; 
        let density = Math.floor(MAX_PARTICLES / allTriangles.length / 3); 
        if (density < 2) density = 2;
        if (density > 20) density = 20;

        // --- HÀM THÊM HẠT (CÓ HÀN GỐC) ---
        const addParticle = (p, angleOffset) => {
            if (positions.length / 3 >= MAX_PARTICLES) return;

            // 1. Tọa độ gốc
            let tx = (p.x - center.x) * scale;
            let ty = (p.y - center.y) * scale + yOffset;
            let tz = (p.z - center.z) * scale;

            const relativeY = ty - bottomY;
            const heightRatio = relativeY / scaledHeight; // 0 ở gốc, 1 ở ngọn

            // 2. HIỆU ỨNG PHÌNH TO (Flare) - Cho phần tán
            const flareFactor = 1.0 + (heightRatio * 1.0); 
            tx *= flareFactor;
            tz *= flareFactor;

            // 3. XOAY QUANH TRỤC
            const cosA = Math.cos(angleOffset);
            const sinA = Math.sin(angleOffset);
            let rotatedX = tx * cosA - tz * sinA;
            let rotatedZ = tx * sinA + tz * cosA;

            // === 4. THUẬT TOÁN HÀN GỐC (ROOT FUSION) ===
            // Vùng hàn: 20% dưới cùng của cây
            const FUSION_THRESHOLD = 0.30; 
            
            if (heightRatio < FUSION_THRESHOLD) {
                // Tính lực hút: 1.0 ở đáy, 0.0 ở ngưỡng 20%
                // Dùng bình phương để lực hút mạnh hơn ở sát đáy
                const fusionStrength = Math.pow(1.0 - (heightRatio / FUSION_THRESHOLD), 2);
                
                // Ép tọa độ X và Z về gần 0 dựa trên lực hút
                // Giữ lại một phần nhỏ (0.2) để gốc vẫn có độ dày, không bị bóp dẹt thành 1 đường thẳng
                const compression = (1.0 - fusionStrength) + 0.2 * fusionStrength;
                
                rotatedX *= compression;
                rotatedZ *= compression;
            }
            // ============================================

            tx = rotatedX;
            tz = rotatedZ;

            // 5. MÀU SẮC & SIZE
            const distCenter = Math.sqrt(tx * tx + tz * tz); 
            let r, g, b, s;
            let isTrunk = false;

            // Định nghĩa lõi thân cây
            const coreRadius = (35 * flareFactor) * (1 - heightRatio * 0.9); 
            
            // Ở đáy (dưới 10%) thì chắc chắn là thân để đảm bảo gốc đặc
            if (heightRatio < 0.1 || distCenter < coreRadius) {
                isTrunk = true;
            }

            if (isTrunk) {
                // Thân nâu
                r = this.colors.trunk.r; g = this.colors.trunk.g; b = this.colors.trunk.b;
                s = 3.0; 
                // Jitter cực thấp cho gốc để tạo khối đặc
                const j = heightRatio < 0.1 ? 0.2 : 0.5;
                tx += (Math.random() - 0.5) * j;
                ty += (Math.random() - 0.5) * j;
                tz += (Math.random() - 0.5) * j;
            } else {
                // Tán lá
                const j = 2.5;
                tx += (Math.random() - 0.5) * j;
                ty += (Math.random() - 0.5) * j;
                tz += (Math.random() - 0.5) * j;

                if (Math.random() > 0.97) { 
                    r = this.colors.gold.r; g = this.colors.gold.g; b = this.colors.gold.b;
                    s = 6.0; 
                } else { 
                    const c = Math.random() > 0.5 ? this.colors.flower : this.colors.petal;
                    r = c.r; g = c.g; b = c.b;
                    s = 5.0 + Math.random(); 
                }
            }

            targetTree.push(tx, ty, tz);
            positions.push(tx, ty, tz);

            const exR = 1200 * Math.cbrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            targetExplode.push(
                exR * Math.sin(phi) * Math.cos(theta),
                exR * Math.sin(phi) * Math.sin(theta),
                exR * Math.cos(phi)
            );

            colors.push(r, g, b);
            sizes.push(s);
        };

        // --- TẠO 3 BẢN SAO XOAY VÒNG ---
        const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]; // 0, 120, 240 độ

        allTriangles.forEach(t => {
            angles.forEach(angle => {
                addParticle(t.a, angle); addParticle(t.b, angle); addParticle(t.c, angle);
            });
            for(let k = 0; k < density; k++) {
                const r1 = Math.random(); const r2 = Math.random(); const sqrtR1 = Math.sqrt(r1);
                const randomPoint = new THREE.Vector3()
                    .copy(t.a).multiplyScalar(1 - sqrtR1)
                    .addScaledVector(t.b, sqrtR1 * (1 - r2))
                    .addScaledVector(t.c, sqrtR1 * r2);
                angles.forEach(angle => { addParticle(randomPoint, angle); });
            }
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.userData = { targetTree, targetExplode };

        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            map: this.createSoftTexture(),
            blending: THREE.NormalBlending, 
            depthWrite: false, 
            transparent: true,
            opacity: 0.75, // Tăng nhẹ độ đậm
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        this.isReady = true;
    }

    toggle() {
        this.state = (this.state === 'TREE') ? 'EXPLODED' : 'TREE';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.isReady || !this.particleSystem) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const targets = this.state === 'TREE' 
            ? this.particleSystem.geometry.userData.targetTree 
            : this.particleSystem.geometry.userData.targetExplode;

        const speed = 0.05;

        if (this.state === 'TREE') this.particleSystem.rotation.y += 0.002;
        else this.particleSystem.rotation.y += 0.0005;

        for (let i = 0; i < positions.length; i++) {
            positions[i] += (targets[i] - positions[i]) * speed;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }
}