<template>
<div class="qjewsnkgzzxlxtzncydssfbgjibiehcy" v-if="image.isSensitive && hide && !$store.state.device.alwaysShowNsfw" @click="hide = false">
	<div>
		<b><fa icon="exclamation-triangle"/> {{ $t('sensitive') }}</b>
		<span>{{ $t('click-to-show') }}</span>
	</div>
</div>
<a class="gqnyydlzavusgskkfvwvjiattxdzsqlf" v-else :href="image.url" target="_blank" :style="style" :title="image.name" @click.prevent="onClick"></a>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import ImageViewer from '../../../common/views/components/image-viewer.vue';

export default Vue.extend({
	i18n: i18n('mobile/views/components/media-image.vue'),
	props: {
		image: {
			type: Object,
			required: true
		},
		raw: {
			default: false
		}
	},
	data() {
		return {
			hide: true
		};
	}
	computed: {
		style(): any {
			let url = `url(${this.image.thumbnailUrl})`;

			if (this.$store.state.device.loadRemoteMedia || this.$store.state.device.lightmode) {
				url = null;
			} else if (this.raw || this.$store.state.device.loadRawImages) {
				url = `url(${this.image.url})`;
			}

			return {
				'background-color': this.image.properties.avgColor && this.image.properties.avgColor.length == 3 ? `rgb(${this.image.properties.avgColor.join(',')})` : 'transparent',
				'background-image': url
			};
		}
	},
	methods: {
		onClick() {
			this.$root.new(ImageViewer, {
				image: this.image
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.gqnyydlzavusgskkfvwvjiattxdzsqlf
	display block
	overflow hidden
	width 100%
	height 100%
	background-position center
	background-size contain
	background-repeat no-repeat

.qjewsnkgzzxlxtzncydssfbgjibiehcy
	display flex
	justify-content center
	align-items center
	background #111
	color #fff

	> div
		display table-cell
		text-align center
		font-size 12px

		> *
			display block

</style>
