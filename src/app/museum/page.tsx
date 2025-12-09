'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export default function MuseumPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  const blockerRef = useRef<HTMLDivElement>(null);
  const artifactTitleRef = useRef<HTMLHeadingElement>(null);
  const artifactDescriptionRef = useRef<HTMLParagraphElement>(null);
  const puzzleContentRef = useRef<HTMLDivElement>(null);
  const puzzleTextRef = useRef<HTMLParagraphElement>(null);
  const wordContentRef = useRef<HTMLDivElement>(null);
  const wordTextRef = useRef<HTMLParagraphElement>(null);
  const wordButtonContentRef = useRef<HTMLSpanElement>(null);
  const wordButtonRef = useRef<HTMLButtonElement>(null);

  const state = useRef({
    camera: null as THREE.PerspectiveCamera | null,
    scene: null as THREE.Scene | null,
    renderer: null as THREE.WebGLRenderer | null,
    raycaster: new THREE.Raycaster(),
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isMoving: false,
    isBlocked: true,
    isDragging: false,
    lon: 0,
    lat: 0,
    onMouseDownMouseX: 0,
    onMouseDownMouseY: 0,
    onMouseDownLon: 0,
    onMouseDownLat: 0,
    forwardVector: new THREE.Vector3(0, 0, -1),
    rightVector: new THREE.Vector3(1, 0, 0),
    cameraVector: new THREE.Vector3(),
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    intersectedObject: null as THREE.Object3D | null,
    currentArtifactName: null as string | null,
    lastTime: performance.now(),
  }).current;

  const ARTIFACT_DATA = {
    'mask': {
      title: 'قناع توت عنخ آمون الجنائزي',
      description: 'أشهر قطعة أثرية في العالم. مصنوع من الذهب الخالص ومطعم بالأحجار الكريمة. كان يغطي وجه مومياء الملك الشاب توت عنخ آمون.',
      puzzle: 'لغز: ما هي الألوان الرئيسية التي استخدمها المصريون القدماء لطلاء القناع الذهبي؟ (الأزرق الفاتح والغامق والأحمر)',
      word: 'نِفْر. تعني الجمال أو الكمال',
      color: 0xFFD700,
      emissiveColor: 0x995500
    },
    'rosetta': {
      title: 'حجر رشيد (Rosetta Stone)',
      description: 'لوحة حجرية حاسمة لفك رموز اللغة الهيروغليفية في القرن التاسع عشر، لاحتوائها على نفس النص بثلاثة خطوط مختلفة: الهيروغليفية، الديموطيقية، واليونانية القديمة.',
      puzzle: 'لغز: من هو العالم الفرنسي الذي فك شفرة الحجر في عام 1822؟ (جان فرانسوا شامبوليون)',
      word: 'مِدُو نِتْشِر. تعني كلمات الإله (الهيروغليفية)',
      color: 0x54473e,
      emissiveColor: 0x332a24
    },
    'canopic': {
      title: 'مجموعة الأواني الكانوبية',
      description: 'الأواني الأربعة المستخدمة لحفظ الأعضاء الداخلية للمتوفى (الكبد، الرئتين، المعدة، الأمعاء) أثناء عملية التحنيط، كل منها تحت حماية أحد أبناء حورس.',
      puzzle: 'لغز: من هو ابن حورس الذي كان يحمي الرئتين؟ (حعبي)',
      word: 'إِمْ تْ. تعني الحياة الآخرة أو الأبدية',
      color: 0x8d6e63,
      emissiveColor: 0x5d4e43
    }
  };

  const alertMessage = (message: string, type: 'error' | 'success' | 'info') => {
    const messageContainer = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-700' : (type === 'success' ? 'bg-green-700' : 'bg-blue-700');
    messageContainer.className = `alert-message text-white font-bold ${bgColor}`;
    messageContainer.textContent = message;

    document.querySelectorAll('.alert-message').forEach(el => el.remove());

    document.body.appendChild(messageContainer);
    setTimeout(() => {
      messageContainer.style.opacity = '0';
      setTimeout(() => messageContainer.remove(), 300);
    }, 4000);
  };

  const hideInfoPanel = useCallback(() => {
    const panel = infoPanelRef.current;
    if (panel) {
      panel.classList.remove('visible');
    }
    state.currentArtifactName = null;
    state.isBlocked = false;

    if (state.renderer) {
        state.renderer.domElement.focus();
    }
    state.isDragging = false;
  }, [state]);


  const showInfoPanel = useCallback((artifactName: string) => {
    state.currentArtifactName = artifactName;
    const data = ARTIFACT_DATA[artifactName as keyof typeof ARTIFACT_DATA];
    const panel = infoPanelRef.current;

    if (panel && artifactTitleRef.current && artifactDescriptionRef.current && puzzleTextRef.current && wordTextRef.current && puzzleContentRef.current && wordContentRef.current) {
        artifactTitleRef.current.textContent = data.title;
        artifactDescriptionRef.current.textContent = data.description;
        puzzleTextRef.current.textContent = data.puzzle;
        wordTextRef.current.innerHTML = `النص الصوتي: <strong>${data.word}</strong><br>انقر على زر التشغيل لسماع الكلمة.`;

        puzzleContentRef.current.classList.add('hidden');
        wordContentRef.current.classList.add('hidden');

        panel.classList.add('visible');
        state.isBlocked = true;
    }
  }, [state, ARTIFACT_DATA]);
  
  const togglePuzzle = () => {
    puzzleContentRef.current?.classList.toggle('hidden');
    wordContentRef.current?.classList.add('hidden');
  };

  const toggleWordAndPlayAudio = async () => {
    const wordContent = wordContentRef.current;
    wordContent?.classList.toggle('hidden');
    puzzleContentRef.current?.classList.add('hidden');

    if (wordContent?.classList.contains('hidden')) {
        return;
    }

    if (!state.currentArtifactName || !ARTIFACT_DATA[state.currentArtifactName as keyof typeof ARTIFACT_DATA]) {
        alertMessage('حدث خطأ: لا توجد تحفة محددة حالياً.', 'error');
        return;
    }

    const textToSpeak = ARTIFACT_DATA[state.currentArtifactName as keyof typeof ARTIFACT_DATA].word;
    if (!textToSpeak) {
        alertMessage('لا يوجد نص صوتي لهذه التحفة.', 'error');
        return;
    }

    if (wordButtonRef.current) wordButtonRef.current.disabled = true;
    if (wordButtonContentRef.current) wordButtonContentRef.current.innerHTML = '<span class="spinner"></span> جاري توليد الصوت...';
    
    // NOTE: The user's original code included an empty API key.
    // This functionality will not work without a valid Google AI API key.
    // The logic is preserved for when a key is added.
    alertMessage('ميزة الصوت غير مفعلة. يتطلب مفتاح API صالح.', 'info');
    
    if (wordButtonRef.current) wordButtonRef.current.disabled = false;
    if (wordButtonContentRef.current) wordButtonContentRef.current.innerHTML = '<i class="fas fa-volume-up ml-2"></i> كلمة فرعونية';
  };
  
  const handleInteraction = useCallback(() => {
    if(!state.camera || !state.scene) return;

    state.raycaster.set(state.camera.position, state.cameraVector);
    
    const intersectables = state.scene.children.filter(obj => ARTIFACT_DATA[obj.userData.name as keyof typeof ARTIFACT_DATA]);
    const intersects = state.raycaster.intersectObjects(intersectables);

    if (state.intersectedObject && (!intersects.length || intersects[0].object !== state.intersectedObject)) {
        const obj = state.intersectedObject as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
        obj.material.emissive.setHex(obj.userData.originalEmissive || 0x000000);
        state.intersectedObject = null;
    }

    if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
        if (intersects[0].distance < 100 && object !== state.intersectedObject) {
            state.intersectedObject = object;
            object.material.emissive.setHex(0xaaaaaa);
        }
    }
  }, [state, ARTIFACT_DATA]);
  
  const animate = useCallback((currentTime: number) => {
    requestAnimationFrame(animate);
    if (!state.renderer || !state.scene || !state.camera) return;

    try {
        const delta = (currentTime - state.lastTime) / 1000;
        state.lastTime = currentTime;

        state.euler.y = THREE.MathUtils.degToRad(state.lon);
        state.euler.x = THREE.MathUtils.degToRad(state.lat);
        state.camera.quaternion.setFromEuler(state.euler);
        state.camera.getWorldDirection(state.cameraVector);

        if (!state.isBlocked && state.isMoving) {
            const forward = state.forwardVector.clone().applyQuaternion(state.camera.quaternion);
            forward.y = 0;
            forward.normalize();
            
            const right = state.rightVector.clone().applyQuaternion(state.camera.quaternion);
            right.y = 0;
            right.normalize();

            const speed = 150.0;
            if (state.moveForward) state.camera.position.addScaledVector(forward, speed * delta);
            if (state.moveBackward) state.camera.position.addScaledVector(forward, -speed * delta);
            if (state.moveRight) state.camera.position.addScaledVector(right, speed * delta);
            if (state.moveLeft) state.camera.position.addScaledVector(right, -speed * delta);
        }

        handleInteraction();
        state.renderer.render(state.scene, state.camera);
    } catch (error) {
        console.error("Error during animation frame:", error);
    }
  }, [state, handleInteraction]);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const init = () => {
      try {
        state.scene = new THREE.Scene();
        state.scene.background = new THREE.Color(0x000000);
        state.scene.fog = new THREE.Fog(0x000000, 100, 300);

        state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        state.camera.position.set(0, 10, 0);

        state.renderer = new THREE.WebGLRenderer({ antialias: true });
        state.renderer.setPixelRatio(window.devicePixelRatio);
        state.renderer.setSize(window.innerWidth, window.innerHeight);
        state.renderer.domElement.tabIndex = -1;
        currentMount.appendChild(state.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x444444, 0.1);
        state.scene.add(ambientLight);
        const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.2);
        state.scene.add(hemiLight);
        
        const artifactPositions = [{ x: 0, z: -50 }, { x: -100, z: 50 }, { x: 100, z: 50 }];
        artifactPositions.forEach(pos => {
            const spotLight = new THREE.SpotLight(0xFFB300, 5.0);
            spotLight.position.set(pos.x, 50, pos.z);
            spotLight.angle = Math.PI / 12;
            spotLight.penumbra = 0.8;
            spotLight.decay = 0.5;
            spotLight.distance = 150;
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            spotLight.target.position.set(pos.x, 10, pos.z);
            state.scene!.add(spotLight);
            state.scene!.add(spotLight.target);
        });

        if (state.renderer) {
            state.renderer.shadowMap.enabled = true;
            state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Museum geometry
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x2e2e2e, side: THREE.DoubleSide }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        state.scene.add(floor);
        
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2a10, side: THREE.DoubleSide });
        const wall1 = new THREE.Mesh(new THREE.PlaneGeometry(500, 50), wallMaterial);
        wall1.position.set(0, 25, -250); wall1.receiveShadow = true; state.scene.add(wall1);
        const wall2 = new THREE.Mesh(new THREE.PlaneGeometry(500, 50), wallMaterial);
        wall2.position.set(0, 25, 250); wall2.rotation.y = Math.PI; wall2.receiveShadow = true; state.scene.add(wall2);
        const wall3 = new THREE.Mesh(new THREE.PlaneGeometry(500, 50), wallMaterial);
        wall3.position.set(250, 25, 0); wall3.rotation.y = -Math.PI / 2; wall3.receiveShadow = true; state.scene.add(wall3);
        const wall4 = new THREE.Mesh(new THREE.PlaneGeometry(500, 50), wallMaterial);
        wall4.position.set(-250, 25, 0); wall4.rotation.y = Math.PI / 2; wall4.receiveShadow = true; state.scene.add(wall4);
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }));
        ceiling.position.y = 50; ceiling.rotation.x = Math.PI / 2; state.scene.add(ceiling);

        // Exhibits
        const createExhibit = (position: THREE.Vector3, name: string, color: number, emissiveColor: number) => {
            let geometry, material;
            switch (name) {
                case 'mask': geometry = new THREE.BoxGeometry(8, 20, 8); break;
                case 'rosetta': geometry = new THREE.BoxGeometry(20, 15, 2); break;
                case 'canopic': geometry = new THREE.BoxGeometry(15, 12, 15); break;
                default: return;
            }
            material = new THREE.MeshStandardMaterial({ color, metalness: name === 'mask' ? 0.9 : 0.1, roughness: name === 'mask' ? 0.1 : 0.8, emissive: emissiveColor, emissiveIntensity: name === 'mask' ? 0.5 : 0.3 });
            const artifact = new THREE.Mesh(geometry, material);
            artifact.position.copy(position);
            artifact.position.y += geometry.parameters.height / 2;
            artifact.userData.name = name;
            artifact.userData.originalEmissive = new THREE.Color(emissiveColor).getHex();
            artifact.castShadow = true;
            state.scene!.add(artifact);
        };
        
        createExhibit(new THREE.Vector3(0, 0, -50), 'mask', ARTIFACT_DATA.mask.color, ARTIFACT_DATA.mask.emissiveColor);
        createExhibit(new THREE.Vector3(-100, 0, 50), 'rosetta', ARTIFACT_DATA.rosetta.color, ARTIFACT_DATA.rosetta.emissiveColor);
        createExhibit(new THREE.Vector3(100, 0, 50), 'canopic', ARTIFACT_DATA.canopic.color, ARTIFACT_DATA.canopic.emissiveColor);

        animate(performance.now());
      } catch (error: any) {
        console.error("Critical error during Three.js initialization:", error);
        alertMessage("فشل تشغيل المتحف بسبب خطأ حرج: " + error.message, 'error');
      }
    };

    const onStartClick = () => {
      if (blockerRef.current) blockerRef.current.classList.add('hidden');
      state.isBlocked = false;
      if (state.renderer) state.renderer.domElement.focus();
      alertMessage('بدأ التجول! استخدم الماوس مع السحب للنظر حولك والـ W A S D للحركة.', 'success');
    };

    const onMouseDown = (event: MouseEvent) => {
        if (state.isBlocked) return;
        event.preventDefault();
        state.isDragging = true;
        state.onMouseDownMouseX = event.clientX;
        state.onMouseDownMouseY = event.clientY;
        state.onMouseDownLon = state.lon;
        state.onMouseDownLat = state.lat;
        if (state.renderer) state.renderer.domElement.focus();
    };

    const onMouseMove = (event: MouseEvent) => {
        if (state.isBlocked || !state.isDragging) return;
        event.preventDefault();
        const deltaX = event.clientX - state.onMouseDownMouseX;
        const deltaY = event.clientY - state.onMouseDownMouseY;
        state.lon = state.onMouseDownLon - deltaX * 0.1;
        state.lat = state.onMouseDownLat - deltaY * 0.1;
        state.lat = Math.max(-85, Math.min(85, state.lat));
    };

    const onMouseUp = (event: MouseEvent) => {
        if (state.isBlocked) return;
        state.isDragging = false;
        if (state.intersectedObject && ARTIFACT_DATA[state.intersectedObject.userData.name as keyof typeof ARTIFACT_DATA]) {
            const deltaX = Math.abs(event.clientX - state.onMouseDownMouseX);
            const deltaY = Math.abs(event.clientY - state.onMouseDownMouseY);
            if (deltaX < 5 && deltaY < 5) {
                showInfoPanel(state.intersectedObject.userData.name);
            }
        }
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (state.isBlocked) return;
        state.isMoving = true;
        switch (event.code) {
            case 'KeyW': state.moveForward = true; break;
            case 'KeyA': state.moveLeft = true; break;
            case 'KeyS': state.moveBackward = true; break;
            case 'KeyD': state.moveRight = true; break;
        }
    };

    const onKeyUp = (event: KeyboardEvent) => {
        if (state.isBlocked) return;
        switch (event.code) {
            case 'KeyW': state.moveForward = false; break;
            case 'KeyA': state.moveLeft = false; break;
            case 'KeyS': state.moveBackward = false; break;
            case 'KeyD': state.moveRight = false; break;
        }
        if (!state.moveForward && !state.moveBackward && !state.moveLeft && !state.moveRight) {
            state.isMoving = false;
        }
    };
    
    const onWindowResize = () => {
        if (state.camera && state.renderer) {
            state.camera.aspect = window.innerWidth / window.innerHeight;
            state.camera.updateProjectionMatrix();
            state.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    };
    
    init();

    const startButton = document.getElementById('start-button');
    if (startButton) startButton.addEventListener('click', onStartClick);
    
    const rendererDom = state.renderer?.domElement;
    if (rendererDom) {
        rendererDom.addEventListener('mousedown', onMouseDown);
        rendererDom.addEventListener('mousemove', onMouseMove);
        rendererDom.addEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);

    return () => {
        window.removeEventListener('resize', onWindowResize);
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        if (rendererDom) {
            rendererDom.removeEventListener('mousedown', onMouseDown);
            rendererDom.removeEventListener('mousemove', onMouseMove);
            rendererDom.removeEventListener('mouseup', onMouseUp);
            currentMount.removeChild(rendererDom);
        }
        if (startButton) startButton.removeEventListener('click', onStartClick);
    };
  }, [state, animate, ARTIFACT_DATA, showInfoPanel, hideInfoPanel]);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0 }}>
      {/* Blocker */}
      <div ref={blockerRef} id="blocker" className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-95 flex flex-col items-center justify-center z-20">
        <h1 className="font-extrabold text-5xl text-[#FFD700] mb-8" style={{ fontFamily: "'El Messiri', sans-serif" }}>المتحف الفرعوني الافتراضي</h1>
        <button id="start-button" className="py-4 px-10 bg-yellow-600 text-black font-bold text-2xl rounded-xl hover:bg-yellow-500 transition-colors shadow-2xl transform hover:scale-105" style={{ fontFamily: "'El Messiri', sans-serif" }}>
          انقر للبدء في التجول
        </button>
        <div id="control-instructions" className="text-white mt-12 text-lg p-4 bg-gray-800 bg-opacity-70 rounded-lg">
          <p className="font-bold text-xl mb-2 text-[#FFD700]">دليل التحكم الجديد (إضاءة درامية):</p>
          <p><strong>الحركة:</strong> W | A | S | D</p>
          <p><strong>النظر/الدوران:</strong> <span className="text-yellow-400">اضغط بزر الماوس الأيسر واسحب</span> (تحكم دقيق)</p>
          <p><strong>التفاعل:</strong> انظر إلى تحفة (حتى تتوهج) ثم انقر عليها (نقرة واحدة)</p>
        </div>
      </div>
      
      {/* Info Panel */}
      <div ref={infoPanelRef} id="info-panel">
        <h2 ref={artifactTitleRef} id="artifact-title" className="text-3xl font-extrabold mb-3 border-b border-[#D4AF37] pb-2 text-[#FFD700]"></h2>
        <p ref={artifactDescriptionRef} id="artifact-description" className="text-lg mb-4 text-gray-200"></p>
        <div ref={puzzleContentRef} id="puzzle-content" className="bg-gray-800 p-3 rounded-lg text-white mb-4 hidden">
          <h3 className="font-bold text-lg mb-1">لغز اليوم:</h3>
          <p ref={puzzleTextRef} id="puzzle-text" className="text-sm"></p>
        </div>
        <div ref={wordContentRef} id="word-content" className="bg-gray-800 p-3 rounded-lg text-white mb-4 hidden">
            <h3 className="font-bold text-lg mb-1">كلمة فرعونية (Audio Clue):</h3>
            <p ref={wordTextRef} id="word-text" className="text-sm">انقر على زر التشغيل لسماع الكلمة.</p>
        </div>
        <div className="flex flex-col space-y-3 mt-4">
          <button id="toggle-puzzle" onClick={togglePuzzle} className="py-2 px-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-md">
            <i className="fas fa-brain ml-2"></i> لغز اليوم
          </button>
          <button ref={wordButtonRef} id="toggle-word" onClick={toggleWordAndPlayAudio} className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors shadow-md">
            <span ref={wordButtonContentRef} id="word-button-content"><i className="fas fa-volume-up ml-2"></i> كلمة فرعونية</span>
          </button>
          <button id="close-panel" onClick={hideInfoPanel} className="py-2 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md">
            <i className="fas fa-times ml-2"></i> إغلاق
          </button>
        </div>
      </div>

      {/* Crosshair */}
      <div id="crosshair"></div>
    </div>
  );
}
