<template>
  <div id="app">
    <scene id="scene"/>
    <router-view/>
  </div>
</template>

<script>
import Scene from './components/Scene.vue';

export default {
  components: {
    Scene,
  },
};
</script>


<style lang="scss" scoped>
#scene {
  position: absolute;
  top:0px;
  left: 0px;
  z-index: -1;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
