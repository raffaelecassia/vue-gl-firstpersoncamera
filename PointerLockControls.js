import PointerLockControlsLib from './PointerLockControlsLib'
import { Vector3, PerspectiveCamera } from 'three'
import { throttle } from 'lodash-es'

class PointerLockControls extends EventTarget {

  cameraHeight = 16

  camera
  renderFunc
  controls

  killanimation = false

  moveForward = false
  moveBackward = false
  moveLeft = false
  moveRight = false
  canJump = false

  prevTime
  velocity
  direction

  keyboard = {
    onKeyDown: (event) => {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          this.moveForward = true
          break
        case 37: // left
        case 65: // a
          this.moveLeft = true
          break
        case 40: // down
        case 83: // s
          this.moveBackward = true
          break
        case 39: // right
        case 68: // d
          this.moveRight = true
          break
        case 32: // space
          if (this.canJump === true) this.velocity.y += 200
          this.canJump = false
          break
      }
    },
    onKeyUp: (event) => {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          this.moveForward = false
          break
        case 37: // left
        case 65: // a
          this.moveLeft = false
          break
        case 40: // down
        case 83: // s
          this.moveBackward = false
          break
        case 39: // right
        case 68: // d
          this.moveRight = false
          break
      }
    }
  }

  events = {
    lock: () => {
      this.moveForward = false
      this.moveBackward = false
      this.moveLeft = false
      this.moveRight = false
      this.canJump = false
      this.killanimation = false
      this.velocity = new Vector3()
      this.direction = new Vector3()
      this.prevTime = performance.now()
      // START THE ANIMATION
      this.animate()
      // console.log('PointerLockControls lock')
    },
    unlock: () => {
      this.killanimation = true
      this.dispatchEvent(new Event('unlock'))
    }
  }

  constructor(renderFunc) {
    super()
    this.camera = new PerspectiveCamera()
    this.renderFunc = renderFunc
    this.controls = new PointerLockControlsLib(this.camera)
    this.controls.addEventListener('lock', this.events.lock)
    this.controls.addEventListener('unlock', this.events.unlock)
    document.addEventListener('keydown', this.keyboard.onKeyDown, false)
    document.addEventListener('keyup', this.keyboard.onKeyUp, false)
    this.object3d.position.y = this.cameraHeight
  }

  get object3d() {
    return this.controls.getObject()
  }

  lock() {
    this.controls.lock()
  }

  unlock() {
    this.controls.unlock()
  }

  get isLocked() {
    return this.controls.isLocked
  }

  setPosition(x, z, yrot) {
    this.object3d.position.x = x
    this.object3d.position.z = z
    this.object3d.rotation.y = yrot
  }

  get position() {
    return {
      x: this.object3d.position.x,
      z: this.object3d.position.z,
      yrot: this.object3d.rotation.y
    }
  }

  dispose() {
    this.controls.removeEventListener('lock', this.events.lock)
    this.controls.removeEventListener('unlock', this.events.unlock)
    document.removeEventListener('keydown', this.keyboard.onKeyDown, false)
    document.removeEventListener('keyup', this.keyboard.onKeyUp, false)
    this.killanimation = true
    this.controls.dispose()
    // console.log('PointerLockControls disposed');
  }

  emitMoveEvent = throttle(() => {
    this.dispatchEvent(new Event('move'))
  }, 1000, {})

  animate() {

    if(this.killanimation) return

    if (this.controls.isLocked === true) {
      var time = performance.now()
      var delta = (time - this.prevTime) / 1000

      this.velocity.x -= this.velocity.x * 10.0 * delta
      this.velocity.z -= this.velocity.z * 10.0 * delta
      this.velocity.y -= 9.8 * 80.0 * delta // 100.0 = mass

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
      this.direction.x = Number(this.moveLeft) - Number(this.moveRight)
      this.direction.normalize() // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta

      this.controls.getObject().translateX(this.velocity.x * delta)
      this.controls.getObject().translateY(this.velocity.y * delta)
      this.controls.getObject().translateZ(this.velocity.z * delta)

      if (this.controls.getObject().position.y < this.cameraHeight) {
        this.velocity.y = 0
        this.controls.getObject().position.y = this.cameraHeight
        this.canJump = true
      }
      this.prevTime = time

      this.emitMoveEvent()

      this.renderFunc()
    }

    requestAnimationFrame(() => {
      this.animate()
    })

  }

}

export default PointerLockControls
