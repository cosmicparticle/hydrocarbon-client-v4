<template>
	<view>
		<view v-for="(group,index1) in detailEntity.groups">
			<uni-section :title="group.title + (group.isArray?'(共'+group.lists.length+'项)':'')" type="line">
			</uni-section>
			<view v-for="(list,index3) in group.lists">
				<uni-card isShadow>
					<ItemListView :dataItem="list"></ItemListView>
					<view v-if="group.detailable">
						<view>
							<button @click.stop="clickToGroupDetail(list.code,group.id)">
								<text class="normal-button-iconfont">&#xe63b;</text>
								<text class="footer-box__item">详 情</text>
							</button>
						</view>
					</view>
				</uni-card>
			</view>
		</view>
	</view>
</template>

<script>
	import hcServer from '@/components/hcServer/hcServerV2.vue';
	import hcDataTransUtils from '@/components/hcServer/hcDataTransUtils.vue';
	export default {
		data() {
			return {
				detailEntity: {},
				menuId: "",
				options: null,
			}
		},
		async onLoad(options_) {
			uni.showLoading({
				title: "数据加载中..."
			});
			let options = hcDataTransUtils.setUndefinedStrValueToNull(options_);
			this.detailEntity = await hcDataTransUtils.getDetailEnity(options);
			this.menuId = this.detailEntity.menuId;
			console.log(this.detailEntity);
			this.options = options;
			uni.hideLoading();
		},
		methods: {
			async clickToGroupDetail(entityCode, fieldGroupId) {
				console.log(entityCode + "_" + fieldGroupId);
				//let dtmplConfigKey = await hcServer.requestGroupDtmplConfig_menu(this.menuId, fieldGroupId);
				uni.navigateTo({
					url: `../detail/detail?type=${hcServer.getGroupType(this.options.type)}&entityCode=${entityCode}&menuId=${this.options.menuId}&fieldGroupId=${fieldGroupId}&ratmplId=${this.options.ratmplId}&leafCode=${this.options.leafCode}`,
				})
			}
		}
	}
</script>

<style>
	.footer-box__item {
		font-size: 16px;
		color: #666;
	}
</style>
