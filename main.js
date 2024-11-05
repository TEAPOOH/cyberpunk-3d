import './style.css'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { gsap } from 'gsap'
import LocomotiveScroll  from 'locomotive-scroll'
const locomotiveScroll = new LocomotiveScroll()

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 4
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMappingExposure = 1
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputEncoding = THREE.sRGBEncoding

const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)

rgbShiftPass.uniforms['amount'].value = 0.003
composer.addPass(rgbShiftPass)

// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true
let model
new RGBELoader().load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture){
  const envMap = pmremGenerator.fromEquirectangular(texture).texture
  scene.environment = envMap

  texture.dispose()
  pmremGenerator.dispose()

  const loader = new GLTFLoader()
  loader.load('./DamagedHelmet.gltf', gltf => {
    model = gltf.scene
    scene.add(model)
  })
})

window.addEventListener('mousemove', (e) => {
  if (model){
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * .15)
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * .15)
    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.9,
      ease: 'power2.Out'
    })
  }
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})


function animate() {
  requestAnimationFrame(animate)
  // controls.update()
  renderer.render(scene, camera)
  composer.render()
}

animate()

/******  cbc547fb-6858-43dc-bf98-79c94c1d471a  *******/