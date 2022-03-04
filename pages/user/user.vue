<template>
	<view>
		<view v-if="hydrocarbonToken">
			<view v-for="(group,index1) in detailEntity.groups">
				<uni-section :title="group.title + (group.isArray?'(共'+group.lists.length+'项)':'')" type="line">
				</uni-section>
				<view v-for="(list,index3) in group.lists">
					<uni-card isShadow>
						<ItemListView :dataItem="list"></ItemListView>
						<!-- <view v-if="group.detailable">
							<view>
								<button @click.stop="clickToGroupDetail(list.code,group.id)">
									<text class="normal-button-iconfont">&#xe63b;</text>
									<text class="footer-box__item">详 情</text>
								</button>
							</view>
						</view> -->
					</uni-card>
				</view>
			</view>
			<button @click.stop="logout()">
				<text class="footer-box__unlogin">退出登录</text>
			</button>
		</view>

		<button v-else @click.stop="login()">
			<text class="footer-box__login">登 陆</text>
		</button>
		<button @click.stop="cleanCache()">
			<text class="footer-box__unlogin">清空缓存</text>
		</button>

	</view>
</template>

<script>
	import hcServer from '@/components/hcServer/hcServerV2.vue';
	import hcDataTransUtils from '@/components/hcServer/hcDataTransUtils.vue';
	export default {
		data() {
			return {
				hydrocarbonToken: null,
				detailEntity: null,
			}
		},
		async onLoad() {
			let hydrocarbonToken_ = uni.getStorageSync("hydrocarbon-token");
			let detailEntity_ = null;
			console.log(hydrocarbonToken_);
			if (hydrocarbonToken_ && this.detailEntity == null) {
				detailEntity_ = await hcDataTransUtils.getUserDetailEnity();
				console.log('userdetailEntity', detailEntity_);
				this.detailEntity = detailEntity_;
			}
			this.hydrocarbonToken = hydrocarbonToken_;
		},
		methods: {
			logout() {
				uni.setStorageSync("hydrocarbon-token", null);
				uni.navigateTo({
					url: '../login/login',
				})
			},
			login() {
				uni.setStorageSync("hydrocarbon-token", null);
				uni.navigateTo({
					url: '../login/login',
				})
			},
			edit() {
				uni.navigateTo({
					url: `../edit/edit?type=user`,
				})
			},
			cleanCache() {
				try {
				let serverUrl=	uni.getStorageSync("serverUrl");
					uni.clearStorageSync();
					uni.showToast({
						title: "缓存已清空",
						icon: 'success'
					});
					uni.setStorageSync("serverUrl", serverUrl);
				} catch (e) {
					console.log(e);
					uni.showToast({
						title: "缓存清空有异常",
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style>
	.footer-box__login {
		font-size: 16px;
		color: #007AFF;
	}

	.footer-box__unlogin {
		font-size: 16px;
		color: #DD524D;
	}

	.footer-box__edit {
		font-size: 16px;
		color: #007AFF;
	}
</style>
