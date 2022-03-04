<template>
	<view>
		<uni-section title="消息列表" type="line"></uni-section>
		<uni-list v-for="(item,index1) in messages">
			<uni-list-item :title="item.title" :show-badge="true" badgeType='error' :badge-text="item.count+''" link :to="`../list/list?type=menu&menuId=${item.id}`"  />
		</uni-list>
	</view>
</template>

<script>
	import server from '@/components/server/server-v3.vue';
	export default {
		data() {
			return {
				messages:null,
			}
		},
		async onLoad(){
			//在此处加载，用户登录后并不能第一时间看到有消息提醒
			let messageList = await server.requestMessagebar_menu();
			for (const item of messageList) {
				setInterval(async () => {
					let count = await server.requestLtmplCount_menu(item.id);
					item.count = count;
				}, 180000);
				let count = await server.requestLtmplCount_menu(item.id);
				item.count = count;
				if(count>0){
					uni.showTabBarRedDot({
						index:1,
					})
				}
			}
			console.log("messageList",messageList);
			uni.setStorageSync("messageList",messageList);
			setInterval(async () => {
				let messages=uni.getStorageSync("messageList");
				let count=0;
				for(const item of messages){
					count=count+item.count;
				}
				console.log('count:',count);
				if(count>0){
					uni.showTabBarRedDot({
						index:1,
					})
				}else{
					uni.hideTabBarRedDot({
						index:1,
					})
				}
				
			}, 180000);
		},
		onShow(){
			
			this.messages=uni.getStorageSync("messageList");
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
