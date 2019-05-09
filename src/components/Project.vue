<template>
    <div class="project" ref="project">
        <a :href="project.url" target="_blank">
            <video :src="project.media" autoplay playsinline muted loop></video>
        </a>
    </div>
</template>

<script>
export default {
    props: {
        deltaY: Number,
        project: Object
    },
	watch: {
		deltaY() {
			TweenLite.to(this.$refs.project, 2, { ease: Power4.easeOut, x: -this.deltaY});
		}
	}
}
</script>

<style lang="scss" scoped>
.project{
  min-width: 50vh;
	height: 50vh;
	max-height: 50vh;
	display:flex;
	margin: 0 10vh;
    a {
        width: 100%;
        video {
            width: 100%;
        }
    }
}
</style>
