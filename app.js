const section = document.querySelector('section');
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0xdddddd,1)
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
section.appendChild(renderer.domElement);

//Scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.z = -900;
scene.add(camera);

const light = new THREE.AmbientLight(0xcccccc,1);
const dirLight = new THREE.DirectionalLight(0xcccccc,0.5);
dirLight.position.set(100 ,200, -200)
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 3000;
dirLight.shadow.mapSize.height = 3000;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1000;
dirLight.shadow.camera.top = 1000;
dirLight.shadow.camera.bottom = -1000;
dirLight.shadow.camera.left = -1000;
dirLight.shadow.camera.right = 1000;

scene.add(light)
scene.add(dirLight)


const loadFiles = (mtlUrl,objUrl) => {
    return new Promise((resolve,reject) => {
        //LOADER
        const mtlloader = new THREE.MTLLoader();
        const objloader = new THREE.OBJLoader();
        

        mtlloader.load(mtlUrl,function(materials){
            objloader.setMaterials(materials);
            objloader.load(objUrl,function(obj){
                resolve(obj);
            })
        })
        
    })
}


    


let cat = null;
let catGroup = new THREE.Group();
scene.add(catGroup)

loadFiles('./cat.mtl','/cat.obj').then(function(obj) {
    obj.rotateX(Math.PI / 2);
    obj.rotateY(Math.PI);
    obj.position.y = -200;

    // CHANGE THE OBJ MATERIAL
    const material = new THREE.MeshLambertMaterial({
        color: 0x333333
    });
    obj.traverse((child) => {
        child.material = material; 
        child.castShadow = true
    })

    cat = obj;
    catGroup.add(cat)
})

const loader = new THREE.TextureLoader();

const addEye = () => {
    const eye = loader.load('./catseye.png');
    const geometry = new THREE.SphereGeometry(12,128,128);
    const material = new THREE.MeshLambertMaterial({
        map: eye
    });
    const mesh = new THREE.Mesh(geometry,material);
    mesh.rotateY(Math.PI)
    return mesh;
}

const addFloor = () => {
    const geometry = new THREE.CylinderGeometry(400,420,40,44);
    const material = new THREE.MeshLambertMaterial({
        color: 0x0099ee
    });
    const floor = new THREE.Mesh(geometry,material);
    floor.receiveShadow = true;
    return floor
}

const floor = addFloor();
floor.position.y = -200;
scene.add(floor)

const eye1 = addEye();
eye1.position.set(-32, 140, -209);
catGroup.add(eye1)

const eye2 = addEye();
eye2.position.set(25, 140, -209);
catGroup.add(eye2)


//Tweening a camera
let cameraAimX = 0;
let cameraAimY = 0;
let cameraAimZ = -900;



const animate = () => {
    let cameraDiffX = cameraAimX - camera.position.x;
    let cameraDiffY = cameraAimY - camera.position.y;
    let cameraDiffZ = cameraAimZ - camera.position.z;

    camera.position.x = camera.position.x + cameraDiffX * 0.05
    camera.position.y = camera.position.y + cameraDiffY * 0.05
    camera.position.z = camera.position.z + cameraDiffZ * 0.05

    // if (cat) cat.rotateZ(0.01)
    camera.lookAt(scene.position);
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()

document.addEventListener('wheel', (event) => {
    cameraAimZ = cameraAimZ + event.deltaY;
    cameraAimZ = Math.max(-4500, cameraAimZ)
    cameraAimZ = Math.min(-500, cameraAimZ)
})

document.addEventListener('mousemove', (event) => {
    cameraAimX = event.pageX - (window.innerWidth / 2);
    cameraAimY = event.pageY - (window.innerHeight / 2)
})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render.setSize(window.innerWidth , window.innerHeight);
})