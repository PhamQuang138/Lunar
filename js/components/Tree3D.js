// File: js/components/Tree3D.js

export class Tree3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modelUrl = './assets/3dmodel/3d-model.3ds'; 

        this.state = 'TREE'; 
        this.isReady = false;
        this.controls = null;
        this.decorations = []; 
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObj = null; 
        
        // Cờ hiệu: Đang bắn pháo hoa hay không?
        this.isFireworkMode = false; 

        this.colors = {
            flower: new THREE.Color(0xff69b4), 
            petal: new THREE.Color(0xffb7c5),  
            gold: new THREE.Color(0xffcc00),   
            trunk: new THREE.Color(0x4a3728)   
        };

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.set(0, 40, 380); 
        this.camera.lookAt(0, 80, 0); 

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.pointerEvents = 'auto'; 
        this.container.appendChild(this.renderer.domElement);

        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.autoRotate = false;
            this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
        }

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambient);

        this.loadModel();
        
        window.addEventListener('click', (e) => this.onMouseClick(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.animate();
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onMouseClick(event) {
        if (this.state !== 'TREE') return; 

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.decorations);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            // Chỉ click được khi vật thể đang hiện rõ
            if (object.material.opacity > 0.5 && object.userData.type === 'lixi') {
                if (window.openLixi) window.openLixi(); 
                
                const originalS = object.userData.originalScale || 15;
                let scaleUp = 1.0;
                object.scale.set(originalS * 1.2, originalS * 1.3 * 1.2, 1);

                const bounce = setInterval(() => {
                    scaleUp += 0.15;
                    object.scale.set(originalS * scaleUp, originalS * 1.3 * scaleUp, 1);
                    if (scaleUp >= 1.5) { 
                        clearInterval(bounce);
                        object.scale.set(originalS, originalS * 1.33, 1);
                    }
                }, 16);
            }
        }
    }

    updateHoverEffects() {
        if (this.state !== 'TREE') {
            this.container.style.cursor = 'default';
            if (this.hoveredObj) {
                const s = this.hoveredObj.userData.originalScale;
                this.hoveredObj.scale.set(s, s * 1.33, 1);
                this.hoveredObj.material.color.setHex(0xffffff); 
                this.hoveredObj = null;
            }
            return;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.decorations);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.material.opacity > 0.5) {
                if (this.hoveredObj !== object) {
                    if (this.hoveredObj) {
                        const s = this.hoveredObj.userData.originalScale;
                        this.hoveredObj.scale.set(s, s * 1.33, 1);
                        this.hoveredObj.material.color.setHex(0xffffff);
                    }
                    this.hoveredObj = object;
                    this.container.style.cursor = 'pointer';
                    const s = object.userData.originalScale;
                    object.scale.set(s * 1.2, s * 1.33 * 1.2, 1);
                    object.material.color.setHex(0xffffee); 
                }
            }
        } else {
            if (this.hoveredObj) {
                const s = this.hoveredObj.userData.originalScale;
                this.hoveredObj.scale.set(s, s * 1.33, 1);
                this.hoveredObj.material.color.setHex(0xffffff);
                this.hoveredObj = null;
                this.container.style.cursor = 'default';
            }
        }
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
        if (!THREE.TDSLoader) return;
        const loader = new THREE.TDSLoader();
        loader.setResourcePath('./assets/3dmodel/');
        loader.load(this.modelUrl, (object) => {
            object.rotation.x = -Math.PI / 2;
            object.updateMatrixWorld(true);
            this.processParticles(object);
        });
    }

    processParticles(object) {
        const positions = [];
        const colors = [];
        const sizes = [];
        
        const targetTreeArr = [];
        const targetExplodeArr = [];

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

        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        const stepSample = Math.max(1, Math.floor(allTriangles.length / 2000));
        for(let i = 0; i < allTriangles.length; i += stepSample) {
            const t = allTriangles[i];
            min.min(t.a).min(t.b).min(t.c);
            max.max(t.a).max(t.b).max(t.c);
        }

        const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
        const DESIRED_HEIGHT = 360; 
        const maxDim = Math.max(max.x - min.x, max.y - min.y, max.z - min.z) || 1;
        const scale = DESIRED_HEIGHT / maxDim;
        const scaledHeight = (max.y - min.y) * scale;
        const bottomY = -100; 
        const yOffset = bottomY - (min.y - center.y) * scale;

        const possibleHangingPoints = [];
        const MAX_PARTICLES = 90000; 
        let density = Math.floor(MAX_PARTICLES / allTriangles.length / 3); 
        if (density < 2) density = 2; if (density > 20) density = 20;

        const addParticle = (p, angleOffset) => {
            if (positions.length / 3 >= MAX_PARTICLES) return;
            let tx = (p.x - center.x) * scale;
            let ty = (p.y - center.y) * scale + yOffset;
            let tz = (p.z - center.z) * scale;
            const relativeY = ty - bottomY;
            const heightRatio = relativeY / scaledHeight;
            const flareFactor = 1.0 + (heightRatio * 1.0); 
            tx *= flareFactor; tz *= flareFactor;
            const cosA = Math.cos(angleOffset);
            const sinA = Math.sin(angleOffset);
            let rotatedX = tx * cosA - tz * sinA;
            let rotatedZ = tx * sinA + tz * cosA;
            const FUSION_THRESHOLD = 0.30; 
            if (heightRatio < FUSION_THRESHOLD) {
                const fusionStrength = Math.pow(1.0 - (heightRatio / FUSION_THRESHOLD), 2);
                const compression = (1.0 - fusionStrength) + 0.2 * fusionStrength;
                rotatedX *= compression; rotatedZ *= compression;
            }
            tx = rotatedX; tz = rotatedZ;
            const distCenter = Math.sqrt(tx * tx + tz * tz); 
            let r, g, b, s;
            let isTrunk = false;
            const coreRadius = (35 * flareFactor) * (1 - heightRatio * 0.9); 
            if (heightRatio < 0.2 || distCenter < coreRadius) isTrunk = true;
            if (isTrunk) {
                r = this.colors.trunk.r; g = this.colors.trunk.g; b = this.colors.trunk.b;
                s = 3.0; 
                const j = heightRatio < 0.1 ? 0.2 : 0.5;
                tx += (Math.random() - 0.5) * j; ty += (Math.random() - 0.5) * j; tz += (Math.random() - 0.5) * j;
            } else {
                const j = 2.5;
                tx += (Math.random() - 0.5) * j; ty += (Math.random() - 0.5) * j; tz += (Math.random() - 0.5) * j;
                if (Math.random() > 0.97) { 
                    r = this.colors.gold.r; g = this.colors.gold.g; b = this.colors.gold.b; s = 6.0; 
                } else { 
                    const c = Math.random() > 0.5 ? this.colors.flower : this.colors.petal;
                    r = c.r; g = c.g; b = c.b; s = 5.0 + Math.random(); 
                }
                if (heightRatio > 0.3 && distCenter > 40) {
                    possibleHangingPoints.push(new THREE.Vector3(tx, ty, tz));
                }
            }
            positions.push(tx, ty, tz);
            targetTreeArr.push(tx, ty, tz);
            colors.push(r, g, b);
            sizes.push(s);
        };

        const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]; 
        allTriangles.forEach(t => {
            angles.forEach(angle => { addParticle(t.a, angle); addParticle(t.b, angle); addParticle(t.c, angle); });
            for(let k = 0; k < density; k++) {
                const r1 = Math.random(); const r2 = Math.random(); const sqrtR1 = Math.sqrt(r1);
                const randomPoint = new THREE.Vector3().copy(t.a).multiplyScalar(1 - sqrtR1).addScaledVector(t.b, sqrtR1 * (1 - r2)).addScaledVector(t.c, sqrtR1 * r2);
                angles.forEach(angle => { addParticle(randomPoint, angle); });
            }
        });

        // --- CẬP NHẬT: TÍNH ĐIỂM NỔ "LOẠN XẠ" (CHAOS) ---
        for(let i=0; i < positions.length; i+=3) {
            // Logic Nổ Tung: Dùng tọa độ cầu ngẫu nhiên
            // Hạt sẽ bay theo hướng bất kỳ tạo thành quả cầu bụi khổng lồ
            const exR = 1000 * Math.cbrt(Math.random()); // Bán kính nổ ~1000
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            targetExplodeArr.push(
                exR * Math.sin(phi) * Math.cos(theta),
                exR * Math.sin(phi) * Math.sin(theta),
                exR * Math.cos(phi)
            );
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        geometry.userData = { targetTree: targetTreeArr, targetExplode: targetExplodeArr };

        const material = new THREE.PointsMaterial({
            size: 3, vertexColors: true, map: this.createSoftTexture(),
            blending: THREE.NormalBlending, depthWrite: false, transparent: true, 
            opacity: 1.0, 
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        this.isReady = true;

        this.addDecorations(possibleHangingPoints);
    }

    addDecorations(validPoints) {
        if (validPoints.length === 0) return;
        const textureLoader = new THREE.TextureLoader();
        const lixiTex = textureLoader.load('./assets/images/lixi.png');
        const lanternTex = textureLoader.load('./assets/images/lantern.png');
        const lixiMat = new THREE.SpriteMaterial({ map: lixiTex, transparent: true, depthTest: false });
        const lanternMat = new THREE.SpriteMaterial({ map: lanternTex, transparent: true, depthTest: false });
        const zones = { left: [], right: [], center: [], top: [] };
        validPoints.forEach(p => {
            if (p.y > 80) zones.top.push(p);
            else if (p.x < -60) zones.left.push(p);
            else if (p.x > 60) zones.right.push(p);
            else zones.center.push(p);
        });
        const getPointInZone = (zoneName) => {
            const zone = zones[zoneName];
            return (zone && zone.length > 0) ? zone[Math.floor(Math.random() * zone.length)] : validPoints[Math.floor(Math.random() * validPoints.length)];
        };
        const createItem = (type, position, scale) => {
            const mat = type === 'lixi' ? lixiMat.clone() : lanternMat.clone(); 
            const sprite = new THREE.Sprite(mat);
            const treePos = new THREE.Vector3(position.x, position.y - 5, position.z);
            
            // --- CẬP NHẬT DECOR: NỔ LOẠN XẠ LUÔN ---
            // Không nhân tọa độ nữa mà random vị trí luôn để khớp với độ "li ti" của cây
            const explodePos = new THREE.Vector3(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800
            );

            sprite.position.copy(treePos);
            sprite.scale.set(scale.x, scale.y, 1);
            sprite.userData = { type: type, originalScale: scale.x, targetTree: treePos, targetExplode: explodePos };
            this.scene.add(sprite);
            this.decorations.push(sprite);
        };
        for(let i=0; i<2; i++) createItem('lantern', getPointInZone('left'), {x:35, y:35});
        for(let i=0; i<2; i++) createItem('lantern', getPointInZone('right'), {x:35, y:35});
        createItem('lantern', getPointInZone('top'), {x:40, y:40});
        for(let i=0; i<5; i++) createItem('lixi', getPointInZone('left'), {x:20, y:28});
        for(let i=0; i<5; i++) createItem('lixi', getPointInZone('right'), {x:20, y:28});
        for(let i=0; i<6; i++) createItem('lixi', getPointInZone('center'), {x:22, y:30});
    }

    toggle() {
        this.state = (this.state === 'TREE') ? 'EXPLODED' : 'TREE';
        this.container.style.cursor = 'default';
        this.hoveredObj = null;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls) this.controls.update();
        this.updateHoverEffects();
        const time = Date.now() * 0.002;
        
        let targetOpacity = 1.0; 
        
        if (this.state === 'EXPLODED') {
            if (this.isFireworkMode) targetOpacity = 0.0; // Pháo hoa -> Biến mất
            else targetOpacity = 1.0; // Space -> Hiện rõ (nổ li ti)
        } else {
            targetOpacity = 1.0;
        }
        
        if (this.particleSystem) {
             const currentOp = this.particleSystem.material.opacity;
             this.particleSystem.material.opacity += (targetOpacity - currentOp) * 0.05;
        }

        const decorSpeed = 0.08; 
        this.decorations.forEach((d, i) => {
            const target = (this.state === 'TREE') ? d.userData.targetTree : d.userData.targetExplode;
            
            d.position.x += (target.x - d.position.x) * decorSpeed;
            d.position.y += (target.y - d.position.y) * decorSpeed;
            d.position.z += (target.z - d.position.z) * decorSpeed;

            if (this.state === 'TREE' && d.position.distanceTo(target) < 10) {
                d.position.y += Math.sin(time + i) * 0.05;
            }
            
            if (this.particleSystem) {
                d.material.opacity = this.particleSystem.material.opacity;
            }
        });

        if (!this.isReady || !this.particleSystem) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const targets = this.state === 'TREE' 
            ? this.particleSystem.geometry.userData.targetTree 
            : this.particleSystem.geometry.userData.targetExplode;

        const speed = 0.1;

        for (let i = 0; i < positions.length; i++) {
            positions[i] += (targets[i] - positions[i]) * speed;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }
}