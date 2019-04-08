import { EventDispatcher, Object3D, Vector3, Euler, PerspectiveCamera } from 'three';
import throttle from 'lodash.throttle';

/*
  Copied and modularized from
    https://github.com/mrdoob/three.js/blob/6a1364282fbf44410eedcfb720da7d0e07f3fef7/examples/js/controls/PointerLockControls.js
*/


/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

var PointerLockControlsLib = function ( camera, domElement ) {

	var scope = this;

	this.domElement = domElement || document.body;
	this.isLocked = false;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new Object3D();
	pitchObject.add( camera );

	var yawObject = new Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	function onMouseMove( event ) {

		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( { type: 'lock' } );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( { type: 'unlock' } );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		// eslint-disable-next-line
		console.error( 'THREE.PointerLockControlsLib: Unable to use Pointer Lock API' );

	}

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.disconnect = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function () {

		// assumes the camera itself is not rotated

		var direction = new Vector3( 0, 0, - 1 );
		var rotation = new Euler( 0, 0, 0, 'YXZ' );

		return function ( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.connect();

};

PointerLockControlsLib.prototype = Object.create( EventDispatcher.prototype );
PointerLockControlsLib.prototype.constructor = PointerLockControlsLib;

class PointerLockControls extends EventTarget {

  constructor(renderFunc) {
    super();

    this.cameraHeight = 16;
    this.killanimation = false;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;

    this.prevTime = null;
    this.velocity = null;
    this.direction = null;

    this.keyboard = {
      onKeyDown: (event) => {
        switch (event.keyCode) {
          case 38: // up
          case 87: // w
            this.moveForward = true;
            break
          case 37: // left
          case 65: // a
            this.moveLeft = true;
            break
          case 40: // down
          case 83: // s
            this.moveBackward = true;
            break
          case 39: // right
          case 68: // d
            this.moveRight = true;
            break
          case 32: // space
            if (this.canJump === true) this.velocity.y += 200;
            this.canJump = false;
            break
        }
      },
      onKeyUp: (event) => {
        switch (event.keyCode) {
          case 38: // up
          case 87: // w
            this.moveForward = false;
            break
          case 37: // left
          case 65: // a
            this.moveLeft = false;
            break
          case 40: // down
          case 83: // s
            this.moveBackward = false;
            break
          case 39: // right
          case 68: // d
            this.moveRight = false;
            break
        }
      }
    };

    this.events = {
      lock: () => {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.killanimation = false;
        this.velocity = new Vector3();
        this.direction = new Vector3();
        this.prevTime = performance.now();
        // START THE ANIMATION
        this.animate();
        // console.log('PointerLockControls lock')
      },
      unlock: () => {
        this.killanimation = true;
        this.dispatchEvent(new Event('unlock'));
      }
    };

    this.emitMoveEvent = throttle(() => {
      this.dispatchEvent(new Event('move'));
    }, 1000, {});

    this.camera = new PerspectiveCamera();
    this.renderFunc = renderFunc;
    this.controls = new PointerLockControlsLib(this.camera);
    this.controls.addEventListener('lock', this.events.lock);
    this.controls.addEventListener('unlock', this.events.unlock);
    document.addEventListener('keydown', this.keyboard.onKeyDown, false);
    document.addEventListener('keyup', this.keyboard.onKeyUp, false);
    this.object3d.position.y = this.cameraHeight;
  }

  get object3d() {
    return this.controls.getObject()
  }

  lock() {
    this.controls.lock();
  }

  unlock() {
    this.controls.unlock();
  }

  get isLocked() {
    return this.controls.isLocked
  }

  setPosition(x, z, yrot) {
    this.object3d.position.x = x;
    this.object3d.position.z = z;
    this.object3d.rotation.y = yrot;
  }

  get position() {
    return {
      x: this.object3d.position.x,
      z: this.object3d.position.z,
      yrot: this.object3d.rotation.y
    }
  }

  dispose() {
    this.controls.removeEventListener('lock', this.events.lock);
    this.controls.removeEventListener('unlock', this.events.unlock);
    document.removeEventListener('keydown', this.keyboard.onKeyDown, false);
    document.removeEventListener('keyup', this.keyboard.onKeyUp, false);
    this.killanimation = true;
    this.controls.dispose();
    // console.log('PointerLockControls disposed');
  }

  animate() {

    if(this.killanimation) return

    if (this.controls.isLocked === true) {
      var time = performance.now();
      var delta = (time - this.prevTime) / 1000;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 80.0 * delta; // 100.0 = mass

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
      this.direction.normalize(); // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

      this.controls.getObject().translateX(this.velocity.x * delta);
      this.controls.getObject().translateY(this.velocity.y * delta);
      this.controls.getObject().translateZ(this.velocity.z * delta);

      if (this.controls.getObject().position.y < this.cameraHeight) {
        this.velocity.y = 0;
        this.controls.getObject().position.y = this.cameraHeight;
        this.canJump = true;
      }
      this.prevTime = time;

      this.emitMoveEvent();

      this.renderFunc();
    }

    requestAnimationFrame(() => {
      this.animate();
    });

  }

}

var index = {
  props: {
    value: {
      type: Object,
      default: () => ({ x: 0, z: 0, yrot: 0 }),
      required: true
    },
    name: String,
    scene: String
  },
  inject: {
    vglNamespace: 'vglNamespace'
  },
  data: () => ({
    controls: null
  }),
  created() {

    this.controls = new PointerLockControls(() => {
      this.vglNamespace.renderers.forEach((vm) => { vm.render(); });
    });

    // adds camera and control 3D object to namespace
    this.vglNamespace.cameras[this.name] = this.controls.camera;
    this.vglNamespace.scenes[this.scene].add(this.controls.object3d);
    this.vglNamespace.update();

    this.updatePosition();
  },
  mounted() {
    document.addEventListener('click', this.unlock);
    this.$parent.$el.addEventListener('click', this.lock);

    this.controls.addEventListener('move', this.moveEvent);
    this.controls.addEventListener('unlock', this.unlockEvent);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.unlock);
    this.$parent.$el.removeEventListener('click', this.lock);

    this.controls.removeEventListener('move', this.moveEvent);
    this.controls.removeEventListener('unlock', this.unlockEvent);
    this.controls.dispose();
  },
  methods: {
    updatePosition() {
      // console.log('update position');
      this.controls.setPosition(this.value.x, this.value.z, this.value.yrot);
    },
    lock() {
      // console.log('lock');
      this.controls.lock();
    },
    unlock() {
      // console.log('unlock');
      if(this.controls.isLocked) {
        this.controls.unlock();
        // console.log('click unlock');
      }
    },
    moveEvent() {
      this.$emit('move', this.controls.position);
    },
    unlockEvent() {
      // console.log('real unlock')
      this.$emit('unlock', this.controls.position);
    }
  },
  watch: {
    value: function() {
      this.updatePosition();
    }
  },
  render(h) {
    return h('div');
  }
};

export default index;
