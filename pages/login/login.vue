<template>
	<view class=" body">
		<form @submit="formSubmit">
			<view class="face-wapper">
				<image src="../../static/image/carbonlogo.png" class="face"></image>
			</view>

			<view class="info-wapper">
				<label class="words-lb1">账号</label>
				<input name="username" type="text" value="" class="input" placeholder="请输入用户名"
					placeholder-class="graywords" />
			</view>

			<view class="info-wapper" style="margin-top: 4oupx;">
				<label class="words-1bl">密码 </label>
				<input name="password" type="text" value="" password="true" class="input" placeholder="请输入密码"
					placeholder-class="graywords" />
			</view>

			<view v-if="needKaptcha" class="info-wapper">
				<label class="words-1bl">验证码 </label>
				<input name="kaptchaText" type="text" value="" class="kaptchaText" placeholder="验证码"
					placeholder-class="graywords" />
				<image style="width: 100px; height: 30px;margin-right:10px" title='点击刷新' @click.stop="changeKaptcha()"
					:src="kaptchaImg">
				</image>
			</view>

			<button type="primary" :loading="submitLoading" form-type="submit"
				style="margin-top: 60upx;width: 90%; ">登录</button>
		</form>
		<view>
			<!-- 提示信息弹窗 -->
			<uni-popup ref="message" type="message">
				<uni-popup-message :type="msgType" :message="messageText" :duration="2000"></uni-popup-message>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import hcServer from '@/components/hcServer/hcServerV2.vue';
	export default {
		data() {
			return {
				msgType: 'success',
				messageText: '这是一条成功提示',
				submitLoading: false,
				kaptchaImg: null,
				kaptchaToken: null,
				needKaptcha: false,
			}
		},
		async onLoad(options_) {
			this.pubkey = await hcServer.getRasPubkey();
		},
		methods: {
			async getKaptchaToken() {
				let res = await hcServer.getKaptchaToken();
				if (res) {
					this.kaptchaImg = `data:image/png;base64,${res.img.replace(/[\r\n]/g, "")}`;
					this.kaptchaToken = res.kaptchaToken;
					this.needKaptcha = true;
				}
			},
			async formSubmit(e) {
				var me = this;
				var username = e.detail.value.username;
				var password = e.detail.value.password;
				var kaptchaText = e.detail.value.kaptchaText;
				me.submitLoading = true;
				var data = await hcServer.login(
					username, password, this.kaptchaToken, kaptchaText, this.pubkey
				);
				if (data.status == "suc") {
					console.log("登陆成功");
					uni.setStorageSync("hydrocarbon-token", data.token);
					uni.switchTab({
						url: "../workbench/workbench",
						success(res) {
							console.log(res);
						},
						fail(err) {
							// errMsg: "navigateTo:fail page "pages/index/pages/test/test" is not found"
							console.log(err);
						}
					})
				} else {
					await this.getKaptchaToken();
					if (data.status == "error") {
						this.msgType = 'error';
						this.messageText = data.errorMsg;
						this.$refs.message.open();
					} else {
						//console.log(res.data);
						this.msgType = 'error';
						this.messageText = data;
						this.$refs.message.open();
					}
				}
				me.submitLoading = false;
			},
			async changeKaptcha() { //切换验证码
				await this.getKaptchaToken();
			}
		}
	}
</script>

<style>
	@import url("./login.css");
</style>
