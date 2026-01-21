/* ============================================
   GRIDBOX 3D BACKGROUND
   Version: 8.0 - Clean
   ============================================ */

(function() {
    'use strict';

    var themes = {
        dark: {
            background: 0x000000,
            gridColor: 0x666666,
            fogDensity: 0.04
        },
        light: {
            background: 0xEEEEEE,
            gridColor: 0xAAAAAA,
            fogDensity: 0.04
        }
    };

    var scene, camera, renderer;
    var grids = [];
    var canvas = null;
    var isInitialized = false;
    var visibleSections = 0;

    function init() {
        if (isInitialized) return;

        if (typeof THREE === 'undefined') {
            console.error('Gridbox: THREE.js not loaded');
            return;
        }

        var sections = document.querySelectorAll('.gridbox-section');
        if (sections.length === 0) {
            console.warn('Gridbox: No sections found');
            return;
        }

        isInitialized = true;

        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        var theme = isLight ? themes.light : themes.dark;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(theme.background, theme.fogDensity);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 3;
        camera.position.y = 0;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(theme.background, 1);

        canvas = renderer.domElement;
        canvas.className = 'gridbox-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);

        createGrid(-1.5, 0, 0, theme.gridColor);
        createGrid(1.5, 0, 0, theme.gridColor);
        createGrid(0, Math.PI / 2, -1.5, theme.gridColor);
        createGrid(0, Math.PI / 2, 1.5, theme.gridColor);

        setupObserver(sections);
        window.addEventListener('resize', onResize);
        setupThemeObserver();
        animate();

        console.log('Gridbox: Ready');
    }

    function createGrid(y, rotZ, x, color) {
        var grid = new THREE.GridHelper(60, 60, color, color);
        grid.position.y = y;
        grid.position.x = x;
        grid.rotation.z = rotZ;
        scene.add(grid);
        grids.push(grid);
    }

    function animate() {
        requestAnimationFrame(animate);
        for (var i = 0; i < grids.length; i++) {
            grids[i].position.z += 0.005;
            if (grids[i].position.z >= 1) {
                grids[i].position.z = 0;
            }
        }
        renderer.render(scene, camera);
    }

    function onResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function setupObserver(sections) {
        var observer = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    visibleSections++;
                } else {
                    visibleSections = Math.max(0, visibleSections - 1);
                }
            }
            updateVisibility();
        }, { threshold: 0.1 });

        for (var i = 0; i < sections.length; i++) {
            observer.observe(sections[i]);
        }
    }

    function updateVisibility() {
        if (!canvas) return;
        if (visibleSections > 0) {
            canvas.classList.add('visible');
        } else {
            canvas.classList.remove('visible');
        }
    }

    function setupThemeObserver() {
        var observer = new MutationObserver(function() {
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            var theme = isLight ? themes.light : themes.dark;
            updateTheme(theme);
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    function updateTheme(theme) {
        if (!scene || !renderer) return;
        renderer.setClearColor(theme.background, 1);
        scene.fog.color.setHex(theme.background);
        for (var i = 0; i < grids.length; i++) {
            grids[i].material.color.setHex(theme.gridColor);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();