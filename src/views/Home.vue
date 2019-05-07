<template>
  <div id="home">
    <slider/>
  </div>
</template>

<script>
// @ is an alias to /src
import Slider from '@/components/Slider.vue';

export default {
  name: 'home',
  components: {
    Slider,
  },
};
</script>

<style lang="scss" scoped>
#home {
  height: 100%;
  width: 100%;
}
</style>

