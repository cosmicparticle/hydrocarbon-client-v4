<script>
	export default {
		name: "hcRequest",
		data() {
			return {
				msgType: 'success',
				messageText: '这是一条成功提示',
			};
		},
		uploadFile(filePath) {
			var serverUrl = uni.getStorageSync("serverUrl");
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: this.joinPath(serverUrl , 'v3/upload'), 
					filePath,
					sslVerify:false,
					name: 'file',
					header: {
						"hydrocarbon-token": uni.getStorageSync("hydrocarbon-token"),
						"hydrocarbon-program-token":uni.getStorageSync("hydrocarbon-program-token"),
					},
					success: (res) => {
						console.log(res);
						let data = JSON.parse(res.data);
						if (res.statusCode == 200) {
							resolve(data)
						}else if (res.statusCode == 201) {
							resolve(data)
						} else if (res.statusCode == 403) {
							uni.switchTab({
								url: "../../pages/login/login"
							});
						} else if (res.statusCode == 404 || res.statusCode == 504) {
							uni.showToast({
								title: "服务器连接失败!",
								icon: "none",
								duration: 3000,
							})
						} else if (res.statusCode == 500) {
							uni.showToast({
								title: "后台处理错误。",
								icon: "none",
								duration: 3000,
							})
						} else {
							reject(data)
						}
					}
				})
			});
		},
		request: function(options) {
			//console.log("hcRequest");
			var me = this;
			if (options.showLoading) {
				uni.showLoading({
					title: "数据加载中..."
				});
			}

			var serverUrl = uni.getStorageSync("serverUrl");
			//
			return new Promise((resolve, reject) => {
				uni.request({
					sslVerify:false,
					url: this.joinPath(serverUrl , options.url),
					header: {
						"content-type": options.contentType ? options.contentType :
						"application/x-www-form-urlencoded",
						"hydrocarbon-token": uni.getStorageSync("hydrocarbon-token"),
						"hydrocarbon-program-token":uni.getStorageSync("hydrocarbon-program-token"),
						"hydrocarbon-client": "MOBILE",
					},
					method: options.method,
					data: options.data,
					success: (res) => {
						// console.log('123');
						//console.log(res);
						if (res.statusCode == 200) {
							//Units.setLocalStorge("hydrocarbonToken", hydrocarbonToken)
							resolve(res.data)
						}
						if (res.statusCode == 201) {
							//Units.setLocalStorge("hydrocarbonToken", hydrocarbonToken)
							resolve(res)
						} else if (res.statusCode == 403) {
							//message.info("请求权限不足,可能是token已经超时")
							uni.switchTab({
								url: "../../pages/login/login"
							});
							//console.log('403');
						} else if (res.statusCode == 404 || res.statusCode == 504) {
							uni.showToast({
								title: "服务器连接失败!",
								icon: "none",
								duration: 3000,
							})
						} else if (res.statusCode == 500) {
							uni.showToast({
								title: "后台处理错误。",
								icon: "none",
								duration: 3000,
							})
						} else {
							reject(res.data)
						}
					},
					fail: (e) => {
						console.log(e);
						// me.msgType = 'error';
						// me.messageText = "【fail】请求服务失败";
						// me.$refs.message.open();
						var message = "【fail】请求服务失败";
						uni.showToast({
							title: message,
							icon: "none",
							duration: 3000,
						})
						reject(message);
					},
					complete: (e) => {
						if (options.showLoading) {
							uni.hideLoading();
						}
					}
				})
			})
		},
		joinPath:function(path1,path2){
		        let path=path1;
		        if(!path.endsWith('/') && !path.endsWith('\\')){
		            path=path+"/";
		        }
		        if(path2.startsWith('/') || path.startsWith('\\')){
		            path=path+path2.slice(1);
		        }else{
		            path=path+path2;
		        }
		        return path;
		    }
	}
	
</script>

<style>

</style>
