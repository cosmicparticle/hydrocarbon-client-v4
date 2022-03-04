<template>
	<view class='main'>
		<view class="page-section-spacing">
			<swiper class="swiper" :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
				:duration="duration">
				<swiper-item>
					<view class="swiper-item uni-bg-red">
						<image class='image' src="../../static/workbanch/jd100.jpeg">
					</view>
				</swiper-item>
				<swiper-item>
					<image class='image' src="../../static/workbanch/jd1002.jpg">
				</swiper-item>
			</swiper>
		</view>
		<uni-card>
			<view class="row-view">
				<uni-row>
					<!-- 重点工作 显示数字 -->
					<view v-for="(item,index) in faceplateStatistic">
						<uni-col :span="6">
							<navigator :url="item.url">
								<!-- <view class='work-item'> -->
								<view class='work-item-l2 ipm-work-item-l2'>
									<view class='work-item-l2-row'>
										<view class='ipmwork-item-count'>
											{{item.count}}
										</view>
									</view>
									<view class='work-item-l2-row'>
										<view class='work-item-title'>
											{{item.title}}
										</view>
									</view>
								</view>
								<!-- </view> -->
							</navigator>
						</uni-col>

					</view>
				</uni-row>
			</view>
		</uni-card>
		<!-- 日常工作 -->
		<uni-card title='日常工作' isShadow>
			<view class="row-view">
				<uni-row>
					<view v-for="(item,index) in faceplateDaily">
						<uni-col :span="6">
							<navigator :url="item.url">
								<view class='work-item-l2'>
									<view class='work-item-l2-row'>
										<view class='work-item-logo'>
											<image class='work-item-logo-icon' src="../../static/workbanch/menu.png">
											</image>
										</view>
									</view>
									<view class='work-item-l2-row'>
										<view class='work-item-title'>
											{{item.title}}
										</view>
									</view>
								</view>
							</navigator>
						</uni-col>
					</view>
				</uni-row>
			</view>
		</uni-card>
		<!-- 嵌套循环下的 uni-collapse 在微信不能正常显示 -->
		<view v-for="(block,index1) in blocks">
			<uni-card :title='block.title' isShadow>
				<view v-for="(l1Menu,index2) in block.l1Menus">
					<uni-collapse>
						<uni-collapse-item :title="l1Menu.title">
							<view class="row-view">
								<uni-row>
									<view v-for="(item,index3) in l1Menu.l2Menus">
										<uni-col :span="6">
											<navigator :url="item.url">
												<view class='work-item-l2'>
													<view class='work-item-l2-row'>
														<view class='work-item-logo'>
															<image class='work-item-logo-icon'
																src="../../static/workbanch/menu.png">
															</image>
														</view>
													</view>
													<view class='work-item-l2-row'>
														<view class='work-item-title'>
															{{item.title}}
														</view>
													</view>
												</view>
											</navigator>
										</uni-col>
									</view>
								</uni-row>
							</view>
						</uni-collapse-item>
					</uni-collapse>
				</view>
			</uni-card>
		</view>
	</view>
</template>

<script>
	import server from '@/components/server/server-v3.vue';
	export default {
		data() {
			return {
				indicatorDots: true,
				autoplay: true,
				interval: 2000,
				duration: 500,
				faceplateStatistic: [],
				faceplateDaily: [],
				blocks: [],

			}
		},
		async onLoad() {
			uni.showLoading({
				title:"数据加载中..."
			});
			var me = this;
			//重点工作
			var faceplate_statistic = await server.requestFaceplateStatistic_menu();
			//console.log(data); 
			for (const item of faceplate_statistic) {
				setInterval(async () => {
					let count = await server.requestLtmplCount_menu(item.id);
					item.count = count;
				}, 180000);
				let count = await server.requestLtmplCount_menu(item.id);
				item.count = count;
				item.url = "../list/list?type=menu&menuId=" + item.id;
			}
			me.faceplateStatistic = faceplate_statistic;

			//日常工作
			let faceplate_daily = await server.requestFaceplate_menu();

			for (const item of faceplate_daily) {
				item.url = "../list/list?type=menu&menuId=" + item.id;
			}
			me.faceplateDaily = faceplate_daily;
			//板块
			let blocks_res = await server.requestBlocks();
			if (blocks_res.status == "suc") {
				for (const block of blocks_res.blocks) {
					for (const l1menu of block.l1Menus) {
						for (const l2menu of l1menu.l2Menus) {
							l2menu.url = "../list/list?type=menu&menuId=" + l2menu.id;
						}
					}
				}
				me.blocks = blocks_res.blocks;
			}
			//console.log(blocksRes);
			uni.hideLoading();
		},
		methods: {
			clickIpmWork() {
				console.log("clickIpmWork");
			},

		}
	}
</script>

<style>
	.main {
		background-color: #eeeeee;
		/* display: flex;
		justify-content: center; */
		/* flex-wrap: wrap; */
		width: 750upx;
		font-size: 12px;
	}

	.page-section-spacing {
		display: flex;
		justify-content: center;
		width: 750upx;
	}

	.swiper {
		width: 730upx;
		height: 220upx;
	}

	.image {
		width: 730upx;
		height: 220upx;
	}

	.work-block {
		display: flex;
		flex-direction: row;
		/* justify-content: space-around; */
		flex-wrap: wrap;
		width: 730upx;
		background-color: #ffffff;
	}



	.work-item-l2 {
		/* width: 130upx;
		height: 120upx; */
		padding: 20upx;
		/* display: flex; */
		/* flex-wrap: wrap;
		justify-content: center; */
	}

	.work-item-l2-row {
		width: 130upx;
		height: 64upx;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.ipm-work-item-l2 {
		border-right: 1upx solid #dddddd;
	}

	.row-view {
		width: 100%;
		background-color: #f9f9f9;
	}

	.ipmwork-item-count {
		width: 70upx;
		height: 70upx;
		border: 1upx solid #dddddd;
		display: flex;
		justify-content: center;
		align-items: center;
		color: red;
		font-weight: 800;
		border-radius: 10upx;

	}

	.work-block-title {
		font-size: 16px;
		font-weight: 800;
		width: 100%;
		padding-left: 30upx;
		padding-top: 15upx;

	}

	.work-item-title {
		color: #888888;
		font-weight: 400;
		font-size: 15px;
		padding-top: 4px;
	}

	.work-item-logo {
		width: 64upx;
		height: 64upx;
		background-color: #007AFF;
		border-radius: 32upx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.work-item-logo-icon {
		width: 50upx;
		height: 50upx;
	}

	.blank-block {
		width: 100%;
		height: 8px;
	}
</style>
