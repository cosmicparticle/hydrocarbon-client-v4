<template>
	<view>
		<view v-for="(item,index2) in dataItem.items">
			<uni-forms-item v-if="item.optionView=='text'" :name="item.title" :label="item.title">
				<uni-easyinput type="text" :inputBorder="true" v-model="formData[item.title]" placeholder="请输入用户名">
				</uni-easyinput>
			</uni-forms-item>
			<uni-forms-item v-else-if="item.optionView=='date'" :name="item.title" :label="item.title">
				<uni-datetime-picker class='uni-datetime-picker' type="date" v-model="formData[item.title]"
					start="2000-06-01 06:30:30" end="2030-6-1" return-type="string"></uni-datetime-picker>
			</uni-forms-item>
		</view>
	</view>
</template>

<script>
	export default {
		name: "FormsItems",
		data() {
			return {

			};
		},
		props: {
			dataItem: { //[{title,value,optionView},{},...]
				type: Object,
				required: true,
			},
			formData: { //[{title,value,optionView},{},...]
				type: Object,
				required: true,
			},
		},
	}
</script>

<style lang="scss">
	// @import '@/common/uni-nvue.scss';
</style>
