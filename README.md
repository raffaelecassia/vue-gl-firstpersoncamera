# vue-gl-firstpersoncamera
A quick and dirty first person camera for Vue-GL

[demo](http://www.raffaelecassia.it/vue-gl-firstpersoncamera-demo/)

## USAGE

Install it:
```
npm install --save vue-gl-firstpersoncamera
```

And in .vue file:
```
<template>
  <vgl-renderer camera="camera" scene="scene">
    <vgl-scene>
    ...
    </vgl-scene>

    <first-person-camera name="camera" scene="scene"
        v-model="pos"
        v-on:unlock="onCameraUnlock"
        v-on:move="onCameraMove">
    </first-person-camera>

  </vgl-renderer>
</template>

<script>
import FirstPersonCamera from 'vue-gl-firstpersoncamera'

export default {
  components: {
    FirstPersonCamera
  },
  data: () => ({
    pos: { x: 0, z: 100, yrot: -0.5 }
  }),
  methods: {
    onCameraUnlock(position) {
      // ...
    },
    onCameraMove(position) {
      // ...
    }
  }
}
</script>
```

Click on the scene to grab mouse (click again or ESC to ungrab)

WASD to move, SPACE to jump

Tested in a project created with Vue CLI
