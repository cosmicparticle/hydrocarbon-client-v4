<script>
	import server from '@/components/server/server-v3.vue';
	export default {
		onLaunch:async function() {
			console.log('App Launch')
			console.log("1" + this.serverUrl);
			uni.setStorageSync("serverUrl", this.serverUrl);
			
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	.iconfont {
		font-family: iconfont;
		margin-left: 20rpx;
		color: #0066CC;
		font-size: 16px;
	}
	
	.show-more-button{
		line-height:35px;
		font-size: 16px;
		color: #007AFF;
	}
	

	.mini-button-iconfont {
		font-family: iconfont;
		margin-right: 2rpx;
		color: #597ef7;
		font-size: 16px;
		padding: 10px 3px;
	}

	.normal-button-iconfont {
		font-family: iconfont;
		margin-right: 20rpx;
		color: #597ef7;
		font-size: 18px;
		padding: 0px 5px;
	}

	.iconfont-title {
		color: #0066CC;
		font-size: 15px;
		margin-right: 20rpx;
	}

	.iconfont-navigator {
		border: 1px solid #0066CC;
		border-radius: 3px;
		height: 50upx;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		align-items: center;
		margin: 0 10upx;
	}

	@font-face {
		font-family: 'iconfont';
		src: url('~@/static/font/iconfont.ttf');
	}

	/* 列表信息下面的操作footer */
	.list-footer-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: center;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 10px 0px 0 0px;
	}

	.list-footer-box__item {
		align-items: center;
		padding: 10px 0;
		font-size: 16px;
		color: #666;
	}

	.list-content {
		padding-bottom: 85px;
	}

	.list-tabbar {
		width: 100%;
		height: 84px;
		background-color: #F8F8F8;
		position: fixed;
		bottom: 0;
		z-index: 100;
	}

	.button {
		padding-left: 10px;
		padding-right: 10px;
		margin-top: 2px;
		margin-bottom: 2px;
	}
	,
	.button-only-tabbar {
		width: 100%;
		height: 52px;
		background-color: #F8F8F8;
		position: fixed;
		bottom: 0;
		z-index: 0;
	}
</style>
