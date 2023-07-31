import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 8, 10);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#canvas") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const radStep = Math.PI / 2 / 50;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

const pivot = new THREE.Object3D();

const cubes = [];
let draggable = {
    isDragging: false,
    cube: null,
    direction: null,
    position: null,
    mouseX: 0,
    mouseY: 0,
};

let pan = {
    isPanning: false,
    mouseX: 0,
    mouseY: 0
};

const cubesColors = [
    [
        [
            [ 0x000000, 0xffd500, 0x000000, 0x0045ad, 0x000000, 0x009b48 ],
            [ 0x000000, 0xffd500, 0x000000, 0x0045ad, 0x000000, 0x000000 ],
            [ 0x000000, 0xffd500, 0x000000, 0x0045ad, 0xff5900, 0x000000 ],
        ],
        [
            [ 0x000000, 0xffd500, 0x000000, 0x000000, 0x000000, 0x009b48 ],
            [ 0x000000, 0xffd500, 0x000000, 0x000000, 0x000000, 0x000000 ],
            [ 0x000000, 0xffd500, 0x000000, 0x000000, 0xff5900, 0x000000 ],
        ],
        [
            [ 0x000000, 0xffd500, 0xb90000, 0x000000, 0x000000, 0x009b48 ],
            [ 0x000000, 0xffd500, 0xb90000, 0x000000, 0x000000, 0x000000 ],
            [ 0x000000, 0xffd500, 0xb90000, 0x000000, 0xff5900, 0x000000 ],
        ]
    ],
    [
        [
            [ 0x000000, 0x000000, 0x000000, 0x0045ad, 0x000000, 0x009b48 ],
            [ 0x000000, 0x000000, 0x000000, 0x0045ad, 0x000000, 0x000000 ],
            [ 0x000000, 0x000000, 0x000000, 0x0045ad, 0xff5900, 0x000000 ],
        ],
        [
            [ 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ],
            [ 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ],
            [ 0x000000, 0x000000, 0x000000, 0x000000, 0xff5900, 0x000000 ],
        ],
        [
            [ 0x000000, 0x000000, 0xb90000, 0x000000, 0x000000, 0x009b48 ],
            [ 0x000000, 0x000000, 0xb90000, 0x000000, 0x000000, 0x000000 ],
            [ 0x000000, 0x000000, 0xb90000, 0x000000, 0xff5900, 0x000000 ],
        ]
    ],
    [
        [
            [ 0xffffff, 0x000000, 0x000000, 0x0045ad, 0x000000, 0x009b48 ],
            [ 0xffffff, 0x000000, 0x000000, 0x0045ad, 0x000000, 0x000000 ],
            [ 0xffffff, 0x000000, 0x000000, 0x0045ad, 0xff5900, 0x000000 ],
        ],
        [
            [ 0xffffff, 0x000000, 0x000000, 0x000000, 0x000000, 0x009b48 ],
            [ 0xffffff, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000 ],
            [ 0xffffff, 0x000000, 0x000000, 0x000000, 0xff5900, 0x000000 ],
        ],
        [
            [ 0xffffff, 0x000000, 0xb90000, 0x000000, 0x000000, 0x009b48 ],
            [ 0xffffff, 0x000000, 0xb90000, 0x000000, 0x000000, 0x000000 ],
            [ 0xffffff, 0x000000, 0xb90000, 0x000000, 0xff5900, 0x000000 ],
        ]
    ],
];

const onMouseDown = event => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(cubes, false);

    if (draggable.intersect == null) {
        draggable.intersect = intersects[0];
    }

    if (intersects.length > 0) {
        controls.enabled = false;

        draggable.isDragging = true;
        draggable.mouseX = event.clientX;
        draggable.mouseY = event.clientY;

        draggable.cube = intersects[0].object;

        const intersectPoint = new THREE.Vector3(...intersects[0].point.toArray().map(c => +(c.toFixed(3))));
        const objPos = new THREE.Vector3(...intersects[0].object.position.toArray().map(c => +(c.toFixed(3))));

        if (intersectPoint.z == objPos.z + 1) {
            draggable.direction = "front";
        }
        else if (intersectPoint.y == objPos.y + 1) {
            draggable.direction = "top";
        }
        else if (intersectPoint.x == objPos.x + 1) {
            draggable.direction = "side";
        }
    }
    else if(!controls.enabled){
        pan.isPanning = true;
        pan.mouseX = event.clientX;
        pan.mouseY = event.clientY;
    }
}

const onMouseUp = () => {
    draggable.isDragging = false;
    pan.isPanning = false;
}

const onMouseMove = event => {
    if (draggable.isDragging) {
        if (event.clientY > draggable.mouseY + 50 || event.clientY < draggable.mouseY - 50) {
            if (draggable.direction == "side") {
                doRotation("z", Math.sign(event.clientY - draggable.mouseY) * -1, draggable.cube);
                draggable.isDragging = false;
            }
            else if (draggable.direction == "front") {
                doRotation("x", Math.sign(event.clientY - draggable.mouseY), draggable.cube);
                draggable.isDragging = false;
            }
        }
        else if ((event.clientX > draggable.mouseX + 20 && event.clientY < draggable.mouseY - 20) ||
                 (event.clientX < draggable.mouseX - 20 && event.clientY > draggable.mouseY + 20)) {
            if (draggable.direction == "top") {
                doRotation("x", Math.sign(event.clientX - draggable.mouseX) * -1, draggable.cube);
                draggable.isDragging = false;
            }
            else {
                doRotation("y", Math.sign(event.clientX - draggable.mouseX), draggable.cube);
                draggable.isDragging = false;
            }
        }
        else if ((event.clientX < draggable.mouseX - 20 && event.clientY < draggable.mouseY - 20) ||
                 (event.clientX > draggable.mouseX + 20 && event.clientY > draggable.mouseY + 20)) {
            if (draggable.direction == "top") {
                doRotation("z", Math.sign(event.clientX - draggable.mouseX) * -1, draggable.cube);
                draggable.isDragging = false;
            }
            else {
                doRotation("y", Math.sign(event.clientY - draggable.mouseY), draggable.cube);
                draggable.isDragging = false;
            }
        }
    }
    else if(pan.isPanning) {
        if(event.clientX > pan.mouseX + 20 || event.clientX < pan.mouseX - 20) {
            for(let i = 0; i < 27; i++) {
                pivot.attach(cubes[i]);
            }

            rotateOnAxis("y", Math.sign(event.clientX - pan.mouseX));

            pan.isPanning = false;
        }
        else if(event.clientY > pan.mouseY + 20 || event.clientY < pan.mouseY - 20) {
            for(let i = 0; i < 27; i++) {
                pivot.attach(cubes[i]);
            }

            if(event.clientX > window.innerWidth / 2) {
                rotateOnAxis("z", Math.sign(event.clientY - pan.mouseY) * -1); 
            } 
            else {
                rotateOnAxis("x", Math.sign(event.clientY - pan.mouseY));
            }

            pan.isPanning = false;
        }
    }
}

function createCubes() {
    let cubeIndex = 0;

    const geometry = new THREE.BoxGeometry(2, 2, 2);

    function getMaterial(colors) {
        const mat = [];
        for(let i = 0; i < 6; i++) {
            mat[i] = new THREE.MeshStandardMaterial({color: colors[i]});
        }
        return mat;
    }

    for (let x = -1; x <= 1; x += 1) {
        for (let y = -1; y <= 1; y += 1) {
            for (let z = -1; z <= 1; z += 1) {                
                const mat = getMaterial(cubesColors[x + 1][y + 1][z + 1]);
                const cube = new THREE.Mesh(geometry, mat);
                
                cube.position.set(x * 2.1, y * 2.1, z * 2.1);
                cube.userData.index = cubeIndex;
                cubeIndex++;

                cubes.push(cube);
                scene.add(cube);
            }
        }
    }
}

function doRotation(axis, direction, cube) {
    
    for(let i = 0; i < 27; i++) {
        if(Math.abs(cubes[i].position[axis] - cube.position[axis]) < 1) {
            pivot.attach(cubes[i]);
        }
    }

    rotateOnAxis(axis, direction);
}

function rotateOnAxis(axis, direction, angle = Math.PI / 2, done = 0) {
    if (done >= angle) {
        let len = pivot.children.length;
        for (let i = 0; i < len; i++) {
            scene.attach(pivot.children[0]);
        }

        pivot.rotation.set(0, 0, 0);

        return;
    }

    done += radStep;

    switch (axis) {
        case "x": { pivot.rotateX(radStep * direction); break; }
        case "y": { pivot.rotateY(radStep * direction); break; }
        case "z": { pivot.rotateZ(radStep * direction); break; }
    }

    requestAnimationFrame(() => rotateOnAxis(axis, direction, angle, done));
}

function start() {
    createCubes();

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    window.addEventListener( 'resize', function(){

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
        
    }, false);

    const ambient = new THREE.AmbientLight(0xffffff, 0.69);
    const front = new THREE.DirectionalLight(0xffffff, 0.36);
    const back = new THREE.DirectionalLight(0xffffff, 0);

    front.position.set(1.5, 5, 3);
    back.position.set(-1.5, -5, -3);

    scene.add(ambient, front, back);

    scene.add(pivot);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.getElementById("scramble").addEventListener("click", async () => {
    let arr = ["x", "y", "z"];
    for(let i = 0; i < 15; i++)
    {
        let axis = arr[Math.floor(Math.random() * 3)];
        let direction = Math.round(Math.random()) * 2 - 1;
        let cube = Math.floor(Math.random() * 27);

        doRotation(axis, direction, cubes[cube]);

        await new Promise(r => setTimeout(r, 500));
    }
});

start();
