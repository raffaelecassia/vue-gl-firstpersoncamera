# vue-gl-firstpersoncamera
A quick and dirty first person camera for Vue-GL

## USAGE

```
<vgl-renderer camera="camera" scene="scene" antialias style="height: 100vh;">
  <vgl-scene>
  ...
  </vgl-scene>

  <first-person-camera name="camera" scene="scene"
      v-model="cameraposition"
      v-on:unlock="onCameraUnlock"
      v-on:move="onCameraMove">
  </first-person-camera>

</vgl-renderer>
```

Click on the scene to grab mouse (click again or ESC to ungrab)

WASD to move, SPACE to jump
