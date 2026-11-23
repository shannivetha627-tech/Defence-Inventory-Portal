import { useEffect, useRef } from "react";
import * as THREE from "three";

const Background3D = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        // =====================================================
        // SCENE
        // =====================================================

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            58,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        camera.position.z = 34;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
        });

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        // =====================================================
        // THEME DETECTION
        // =====================================================

        const getCurrentTheme = () => {
            const root = document.querySelector(".portal-root");

            if (root?.classList.contains("light-theme")) {
                return "light";
            }

            return "dark";
        };

        const getThemeColors = () => {
            const theme = getCurrentTheme();

            if (theme === "light") {
                return {
                    pink: 0xec4899,
                    hotPink: 0xf472b6,
                    magenta: 0xc026d3,
                    purple: 0x7c3aed,
                    violet: 0x9333ea,
                    white: 0xffffff,
                    opacity: 0.28,
                    particleOpacity: 0.42,
                };
            }

            return {
                pink: 0xff4fa3,
                hotPink: 0xf472b6,
                magenta: 0xd946ef,
                purple: 0x8b5cf6,
                violet: 0xa855f7,
                white: 0xfdf4ff,
                opacity: 0.38,
                particleOpacity: 0.68,
            };
        };

        let colors = getThemeColors();

        // =====================================================
        // MAIN 3D GROUP
        // =====================================================

        const royalRig = new THREE.Group();

        // =====================================================
        // LARGE PURPLE RING
        // =====================================================

        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(
                11,
                0.10,
                20,
                120
            ),
            new THREE.MeshBasicMaterial({
                color: colors.purple,
                transparent: true,
                opacity: colors.opacity,
            })
        );

        ring1.rotation.x = Math.PI / 3;

        // =====================================================
        // LARGE PINK RING
        // =====================================================

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(
                15,
                0.08,
                20,
                140
            ),
            new THREE.MeshBasicMaterial({
                color: colors.pink,
                transparent: true,
                opacity: colors.opacity * 0.82,
            })
        );

        ring2.rotation.y = Math.PI / 4;

        // =====================================================
        // SMALL MAGENTA RING
        // =====================================================

        const ring3 = new THREE.Mesh(
            new THREE.TorusGeometry(
                7,
                0.055,
                16,
                100
            ),
            new THREE.MeshBasicMaterial({
                color: colors.magenta,
                transparent: true,
                opacity: colors.opacity * 0.72,
            })
        );

        ring3.rotation.x = Math.PI / 2.4;

        royalRig.add(
            ring1,
            ring2,
            ring3
        );

        // =====================================================
        // FLOATING 3D SHAPES
        // =====================================================

        const shapePositions = [
            [-22, 11, -8, 3.4],
            [23, -10, -9, 3.8],
            [-19, -13, -14, 2.8],
            [20, 13, -12, 3.0],
            [0, 16, -18, 2.5],
            [-8, -3, -10, 2.2],
        ];

        shapePositions.forEach(
            ([x, y, z, size], index) => {

                let geometry;

                if (index % 3 === 0) {
                    geometry = new THREE.BoxGeometry(
                        size,
                        size,
                        size
                    );
                } else if (index % 3 === 1) {
                    geometry =
                        new THREE.OctahedronGeometry(
                            size * 0.72,
                            0
                        );
                } else {
                    geometry =
                        new THREE.IcosahedronGeometry(
                            size * 0.62,
                            0
                        );
                }

                const edges =
                    new THREE.EdgesGeometry(
                        geometry
                    );

                const material =
                    new THREE.LineBasicMaterial({
                        color:
                            index % 3 === 0
                                ? colors.pink
                                : index % 3 === 1
                                    ? colors.purple
                                    : colors.magenta,

                        transparent: true,

                        opacity:
                            colors.opacity * 0.9,
                    });

                const wireObject =
                    new THREE.LineSegments(
                        edges,
                        material
                    );

                wireObject.position.set(
                    x,
                    y,
                    z
                );

                wireObject.userData = {
                    baseY: y,

                    rx:
                        (index % 2 === 0
                            ? 1
                            : -1) * 0.004,

                    ry: 0.005,

                    phase:
                        index * 1.35,
                };

                royalRig.add(
                    wireObject
                );
            }
        );

        scene.add(royalRig);

        // =====================================================
        // GLOWING PARTICLES
        // =====================================================

        const particleCount = 420;

        const particleGeometry =
            new THREE.BufferGeometry();

        const positions =
            new Float32Array(
                particleCount * 3
            );

        for (
            let i = 0;
            i < particleCount * 3;
            i += 3
        ) {
            positions[i] =
                (Math.random() - 0.5) * 100;

            positions[i + 1] =
                (Math.random() - 0.5) * 70;

            positions[i + 2] =
                (Math.random() - 0.5) * 60;
        }

        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const particleMaterial =
            new THREE.PointsMaterial({
                size:
                    getCurrentTheme() === "light"
                        ? 0.30
                        : 0.38,

                color:
                    colors.pink,

                transparent: true,

                opacity:
                    colors.particleOpacity,
            });

        const particleSystem =
            new THREE.Points(
                particleGeometry,
                particleMaterial
            );

        scene.add(
            particleSystem
        );

        // =====================================================
        // SOFT FLOATING GLOW ORBS
        // =====================================================

        const orbGroup =
            new THREE.Group();

        const orbPositions = [
            [-15, 8, -12],
            [16, 5, -15],
            [-12, -8, -10],
            [13, -12, -14],
            [3, 10, -18],
        ];

        orbPositions.forEach(
            ([x, y, z], index) => {

                const orbGeometry =
                    new THREE.SphereGeometry(
                        index % 2 === 0
                            ? 1.4
                            : 1.1,
                        32,
                        32
                    );

                const orbMaterial =
                    new THREE.MeshBasicMaterial({
                        color:
                            index % 2 === 0
                                ? colors.pink
                                : colors.purple,

                        transparent: true,

                        opacity:
                            getCurrentTheme() === "light"
                                ? 0.075
                                : 0.13,
                    });

                const orb =
                    new THREE.Mesh(
                        orbGeometry,
                        orbMaterial
                    );

                orb.position.set(
                    x,
                    y,
                    z
                );

                orb.userData = {
                    baseY: y,
                    phase: index * 1.5,
                };

                orbGroup.add(orb);
            }
        );

        scene.add(
            orbGroup
        );

        // =====================================================
        // MOUSE PARALLAX
        // =====================================================

        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (
            event
        ) => {

            mouseX =
                (
                    event.clientX /
                    window.innerWidth -
                    0.5
                ) * 2;

            mouseY =
                (
                    event.clientY /
                    window.innerHeight -
                    0.5
                ) * 2;
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        // =====================================================
        // RESIZE
        // =====================================================

        const handleResize = () => {

            camera.aspect =
                window.innerWidth /
                window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio,
                    2
                )
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        // =====================================================
        // THEME CHANGE OBSERVER
        // =====================================================

        const themeObserver =
            new MutationObserver(() => {

                const newColors =
                    getThemeColors();

                colors = newColors;

                // Rings
                ring1.material.color.setHex(
                    colors.purple
                );

                ring2.material.color.setHex(
                    colors.pink
                );

                ring3.material.color.setHex(
                    colors.magenta
                );

                ring1.material.opacity =
                    colors.opacity;

                ring2.material.opacity =
                    colors.opacity * 0.82;

                ring3.material.opacity =
                    colors.opacity * 0.72;

                // Floating shapes
                royalRig.children.forEach(
                    (object, index) => {

                        if (
                            object.material &&
                            object !== ring1 &&
                            object !== ring2 &&
                            object !== ring3
                        ) {
                            const shapeIndex =
                                index - 3;

                            object.material.color.setHex(
                                shapeIndex % 3 === 0
                                    ? colors.pink
                                    : shapeIndex % 3 === 1
                                        ? colors.purple
                                        : colors.magenta
                            );

                            object.material.opacity =
                                colors.opacity * 0.9;
                        }
                    }
                );

                // Particles
                particleMaterial.color.setHex(
                    colors.pink
                );

                particleMaterial.opacity =
                    colors.particleOpacity;

                particleMaterial.size =
                    getCurrentTheme() === "light"
                        ? 0.30
                        : 0.38;

                // Orbs
                orbGroup.children.forEach(
                    (orb, index) => {

                        orb.material.color.setHex(
                            index % 2 === 0
                                ? colors.pink
                                : colors.purple
                        );

                        orb.material.opacity =
                            getCurrentTheme() === "light"
                                ? 0.075
                                : 0.13;
                    }
                );
            });

        const rootElement =
            document.querySelector(
                ".portal-root"
            );

        if (rootElement) {
            themeObserver.observe(
                rootElement,
                {
                    attributes: true,
                    attributeFilter: [
                        "class",
                    ],
                }
            );
        }

        // =====================================================
        // ANIMATION
        // =====================================================

        let animationFrameId;

        const animate = () => {

            animationFrameId =
                requestAnimationFrame(
                    animate
                );

            const time =
                Date.now() * 0.001;

            // -----------------------------------------------
            // RING MOVEMENT
            // -----------------------------------------------

            ring1.rotation.z =
                time * 0.12;

            ring1.rotation.y =
                Math.sin(
                    time * 0.3
                ) * 0.25;

            ring2.rotation.x =
                time * 0.09;

            ring2.rotation.z =
                -time * 0.07;

            ring3.rotation.z =
                time * 0.16;

            ring3.rotation.y =
                Math.sin(
                    time * 0.4
                ) * 0.3;

            // -----------------------------------------------
            // FLOATING SHAPES
            // -----------------------------------------------

            for (
                let i = 3;
                i < royalRig.children.length;
                i++
            ) {

                const object =
                    royalRig.children[i];

                object.rotation.x +=
                    object.userData.rx;

                object.rotation.y +=
                    object.userData.ry;

                object.position.y =
                    object.userData.baseY +
                    Math.sin(
                        time +
                        object.userData.phase
                    ) * 0.7;
            }

            // -----------------------------------------------
            // PARTICLES
            // -----------------------------------------------

            particleSystem.rotation.y =
                time * 0.025;

            particleSystem.rotation.x =
                Math.sin(
                    time * 0.08
                ) * 0.04;

            // -----------------------------------------------
            // GLOW ORBS
            // -----------------------------------------------

            orbGroup.children.forEach(
                (orb) => {

                    orb.position.y =
                        orb.userData.baseY +
                        Math.sin(
                            time * 0.7 +
                            orb.userData.phase
                        ) * 1.1;

                    orb.position.x =
                        orb.userData.baseX ??
                        orb.position.x;
                }
            );

            // -----------------------------------------------
            // CAMERA PARALLAX
            // -----------------------------------------------

            camera.position.x +=
                (
                    mouseX * 3.2 -
                    camera.position.x
                ) * 0.035;

            camera.position.y +=
                (
                    -mouseY * 2.2 -
                    camera.position.y
                ) * 0.035;

            camera.lookAt(
                scene.position
            );

            renderer.render(
                scene,
                camera
            );
        };

        animate();

        // =====================================================
        // CLEANUP
        // =====================================================

        return () => {

            cancelAnimationFrame(
                animationFrameId
            );

            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            window.removeEventListener(
                "resize",
                handleResize
            );

            themeObserver.disconnect();

            renderer.dispose();

            particleGeometry.dispose();
            particleMaterial.dispose();

            royalRig.children.forEach(
                (object) => {

                    if (object.geometry) {
                        object.geometry.dispose();
                    }

                    if (object.material) {
                        object.material.dispose();
                    }
                }
            );

            orbGroup.children.forEach(
                (object) => {

                    if (object.geometry) {
                        object.geometry.dispose();
                    }

                    if (object.material) {
                        object.material.dispose();
                    }
                }
            );
        };

    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="bg-3d-canvas"
            aria-hidden="true"
        />
    );
};

export default Background3D;