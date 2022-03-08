<template>
	<view>
		<uni-list :border="false">
			<view v-for="(item,index2) in dataItem.items">
				<uni-list-item>
					<view slot="body" class="list-content-row">
						<uni-row>
							<uni-col :span="6">
								<view class="list-content-row-col-title">
									<text class="slot-box slot-title-text">{{item.title}}</text>
								</view>
							</uni-col> 
							<uni-col :span="18" class="list-content-row-col-title">
								<view v-if="item.optionView=='text'" class="list-content-row-col-title">
									<rich-text :nodes='item.value' class=""></rich-text>
								</view>
								<view
									v-else-if="(item.optionView=='file' || item.optionView=='picture'  || item.optionView == 'takePhoto') && item.value && item.value.extname && ['png', 'jpg','jpeg','gif','psd','svg','tiff','bmp','ico'].indexOf(item.value.extname)>=0 "
									class="list-content-row-col-title">
									<image style="width: 100px; height: 100px; background-color: #eeeeee;"
										:src="item.value.url" @click="clickImg(item.value)" :title='item.value.name'
										@error="imageError">
									</image>
								</view>
								<view
									v-else-if="(item.optionView=='video' ) && item.value && item.value.extname && ['mp4'].indexOf(item.value.extname)>=0 "
									class="list-content-row-col-title">
									<video id="myVideo" :src="item.value.url"
										style="width: 500upx; height: 375upx; background-color: #eeeeee;"
										@error="videoErrorCallback" enable-danmu danmu-btn controls></video>
								</view>
								<!--  #ifdef  H5  -->
								<view v-else-if="item.optionView=='file' && item.value" class="list-content-row-col-title">
									<text class="file-name-text">{{item.value.name}}</text>
									<button size="mini" @click.stop="clickToDownLoad_H5(item.value)">
										<text class="normal-button-iconfont">&#xe794;</text>
									</button>
								</view>
								<!-- #endif -->
								<!--  #ifndef H5 -->
								<view
									v-else-if="item.optionView=='file' && item.value.extname && ['doc', 'xls', 'ppt', 'pdf', 'docx', 'xlsx', 'pptx'].indexOf(item.value.extname)>=0  "
									class="list-content-row-col-title">
									<text class="file-name-text">{{item.value.name}}</text>
									<button size="mini" @click.stop="clickToOpen(item.value)">
										<text class="normal-button-iconfont">&#xe6fb;</text>
									</button>
								</view>
								<!-- #endif -->
								<view v-else-if="item.optionView=='multiselect'" class="mulitselect-view">
										<view v-for="(i_ms,index_ms) in item.value"  >
											<view class="tag-view">
												<uni-tag :text="i_ms" :inverted="true" size="small" type="primary"
													:circle="true"></uni-tag>
											</view>
										</view>
								</view>
								<view v-else-if="item.optionView=='select'" class="list-content-row-col-title">
									<uni-badge :text='item.value' :isDot="true" type="primary"></uni-badge>
									<text style="padding-left: 10upx;">{{item.value}}</text>
								</view>
								<view v-else class="list-content-row-col-title">
									<text class="">{{item.value}}</text>
								</view>
							</uni-col>
						</uni-row>
						<!-- </view> -->
					</view>
				</uni-list-item>
			</view>
		</uni-list>
	</view>
</template>

<script>
	export default {
		name: "item-list-view",
		data() {
			return {

			};
		},
		onLoad() {
			console.log(this.props.dataItem);
		},
		props: {
			dataItem: { //[{title,value,optionView},{},...]
				type: Object,
				required: true,
			},
		},
		methods: {
			clickToDownLoad_H5(fileItem) {
				try {
					let a = document.createElement("a");
					a.download = fileItem.name;
					a.href = fileItem.url;
					//a.target= "_blank";
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
				} catch (e) {
					console.log(e);
					uni.showToast({
						title: "文件下载失败",
						icon: 'none'
					})
				}
			},
			clickToOpen(fileItem) {
				uni.showLoading({
					title: "文件加载中..."
				});
				if (fileItem.tempFilePath) {
					uni.openDocument({
						filePath: fileItem.tempFilePath,
						success: function(res) {
							console.log('打开文档成功');
						},
						complete: () => {
							uni.hideLoading();
						}
					});
				} else {
					uni.downloadFile({
						url: fileItem.url,
						success: (res) => {
							if (res.statusCode === 200) {
								uni.openDocument({
									filePath: res.tempFilePath,
									success: function(res1) {
										console.log('打开文档成功');
									}
								})
								fileItem.tempFilePath = res.tempFilePath;
							}
						},
						fail: () => {
							uni.showToast({
								title: "文件下载失败",
								icon: 'none'
							})
						},
						complete: () => {
							uni.hideLoading();
						}
					})
				}
			},
			clickImg(fileItem) {
				// 预览图片
				uni.previewImage({
					urls: [fileItem.url],
				});
			},
			imageError(e) {
				console.log(e);
			}
		}
	}
</script>

<style>
	.list-content-row {
		width: 100%;
	}

	.list-content-row-col-title {
		padding-right: 10upx;
		height: 100%;
		display: flex;
		flex-direction: row;
		/* justify-content:center; */
		align-items: center;
	}

	.file-name-text {
		word-break: break-all
	}

	.slot-title-text {
		flex: 1;
		font-size: 15px;
		color: #666666;
		word-break: break-all;
		/* padding-bottom: 6px; */
	}

	.slot-text {
		flex: 1;
		font-size: 16px;
		color: #000000;
		margin-right: 10px;
		word-break: break-all;
	}

	.mulitselect-view {
		
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-wrap: wrap;
		flex-direction: row;
		justify-content: left;
		padding: 0;
	}

	.tag-view {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		margin: 6rpx 8rpx;
		justify-content: center;
	}
	.list-content-row-col-content {}
</style>
