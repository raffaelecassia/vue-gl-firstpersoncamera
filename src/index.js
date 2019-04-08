import PointerLockControls from './PointerLockControls'

export default {
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
      this.vglNamespace.renderers.forEach((vm) => { vm.render() })
    })

    // adds camera and control 3D object to namespace
    this.vglNamespace.cameras[this.name] = this.controls.camera
    this.vglNamespace.scenes[this.scene].add(this.controls.object3d)
    this.vglNamespace.update()

    this.updatePosition()
  },
  mounted() {
    document.addEventListener('click', this.unlock)
    this.$parent.$el.addEventListener('click', this.lock)

    this.controls.addEventListener('move', this.moveEvent)
    this.controls.addEventListener('unlock', this.unlockEvent)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.unlock)
    this.$parent.$el.removeEventListener('click', this.lock)

    this.controls.removeEventListener('move', this.moveEvent)
    this.controls.removeEventListener('unlock', this.unlockEvent)
    this.controls.dispose()
  },
  methods: {
    updatePosition() {
      // console.log('update position');
      this.controls.setPosition(this.value.x, this.value.z, this.value.yrot)
    },
    lock() {
      // console.log('lock');
      this.controls.lock()
    },
    unlock() {
      // console.log('unlock');
      if(this.controls.isLocked) {
        this.controls.unlock()
        // console.log('click unlock');
      }
    },
    moveEvent() {
      this.$emit('move', this.controls.position)
    },
    unlockEvent() {
      // console.log('real unlock')
      this.$emit('unlock', this.controls.position)
    }
  },
  watch: {
    value: function() {
      this.updatePosition()
    }
  },
  render(h) {
    return h('div');
  }
}
