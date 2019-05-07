<template>
    <div id="slider">
        <project v-for="(project,index) in projects" :deltaY="deltaY" :project="project" :key="index"/>
    </div>
</template>

<script>
import Project from '@/components/Project'
import {Tweenlite} from "gsap/TweenMax";
export default {
    name:"slider",
    data() {
        return {
            counter:0,
            projectWidth: null,
            current: 0,
            projects: [
                {
                    title:'curl noise',
                    media: '/media/projects/curl_noise.mp4',
                    url: 'https://codepen.io/ClementRoche/full/jRZLea'
                },
                {
                    title: 'audio2d',
                    media: '/media/projects/audio2D.mp4',
                    url: 'https://codepen.io/ClementRoche/pen/dgwavz'
                },
                {
                    title: 'audio3d',
                    media: '/media/projects/audio3D.mp4',
                    url: 'https://codepen.io/ClementRoche/pen/oJWGGQ'
                },
                {
                    title: 'particles',
                    media: '/media/projects/particles.mp4',
                    url: 'https://codepen.io/ClementRoche/pen/BbrVVN'
                }
            ]
        }
    },
    mounted() {
        this.getProjectWidth();
        window.addEventListener('wheel', this.onMousewheel.bind(this));
        window.addEventListener('resize',this.onWindowResize.bind(this));
    },
    methods: {
        onWindowResize(e) {
            this.getProjectWidth();
        },
        onMousewheel(e) {
			this.current += -Math.sign(e.deltaY)/10;
            this.current = Math.min(Math.max(this.current, 0), this.projects.length-1);
        },
		getProjectWidth() {
			this.projectWidth = 0.70 * window.innerHeight + 0.1 * window.innerHeight;
		},
    },
    computed: {
		deltaY() {
			return this.current * this.projectWidth
		},
        style() {
            return {
                padding: `0 ${((window.innerWidth - (0.70 * window.innerHeight))/2) - 0.05 * window.innerHeight}`
            }
        }
    },
    components: {
        Project
    }
}
</script>

<style lang="scss" scoped>
#slider {
    color: white;
    height: 100%;
    width: 100%;
	display: flex;
	flex-direction: row;
	align-items:center;
	padding: 0 calc(((100vw - 70vh) / 2) - 5vh);
    // overflow-x: auto;
}
</style>
