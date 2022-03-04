<template>
	<view class='list-content'>
		<uni-forms v-if="criteriaItems.length>0" :value="formData" :rules="rules" ref="form" validate-trigger="bind"
			err-show-type="undertext">
			<uni-group>
				<view v-for="(item,index2) in criteriaItems">
					<uni-forms-item v-if="item.optionView=='textarea'" :name="item.id" :label="item.title">
						<uni-easyinput type="textarea" :inputBorder="true" v-model="formData[item.id]"
							:disabled="item.readOnly" :placeholder="'请输入'+item.title">
						</uni-easyinput>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='date'" :name="item.id" :label="item.title">
						<uni-datetime-picker class='uni-datetime-picker' type="date" v-model="formData[item.id]"
							:disabled="item.readOnly" start="2000-06-01 06:30:30" end="2030-6-1" return-type="string">
						</uni-datetime-picker>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='daterange'" :name="item.id" :label="item.title">
						<uni-datetime-picker class='uni-datetime-picker' type="daterange" v-model="formData[item.id]"
							:disabled="item.readOnly" start="2000-06-01 06:30:30" end="2030-6-1" return-type="string">
						</uni-datetime-picker>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='datetimerange'" :name="item.id" :label="item.title">
						<uni-datetime-picker class='uni-datetime-picker' type="datetimerange"
							v-model="formData[item.id]" :disabled="item.readOnly" start="2000-06-01 06:30:30"
							end="2030-6-1" return-type="string">
						</uni-datetime-picker>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='datetime'" :name="item.id" :label="item.title">
						<uni-datetime-picker class='uni-datetime-picker' type="date" v-model="formData[item.id]"
							:disabled="item.readOnly" start="2000-06-01 06:30:30" end="2030-6-1" return-type="string">
						</uni-datetime-picker>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='select'" :name="item.id" :label="item.title">
						<!-- <uni-data-picker :localdata="array" popup-title="请选择班级" @change="onchange" v-model="formData[item.id]"
						@nodeclick="onnodeclick"></uni-data-picker> -->
						<uni-data-checkbox v-model="formData[item.id]"  mode="tag" :localdata="item.optionValue"
							:disabled="item.readOnly">
						</uni-data-checkbox>
						<button class="button" size='mini' type="warn" @click="unSelectAnyValue(item.id)">取消选择</button>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='multiselect'" :name="item.id" :label="item.title">
						<!-- <uni-data-picker :localdata="array" popup-title="请选择班级" @change="onchange"
						v-model="formData[item.id]" @nodeclick="onnodeclick"></uni-data-picker> -->
						<uni-data-checkbox :multiple="true" v-model="formData[item.id]" mode="tag"
							:disabled="item.readOnly" :localdata="item.optionValue">
						</uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='caselect'" :name="item.id" :label="item.title">
						<uni-data-picker :localdata="item.optionValue" :popup-title="'请选择'+item.title"
							:disabled="item.readOnly" @change="onchange" v-model="formData[item.id]"
							@nodeclick="onnodeclick">
						</uni-data-picker>
					</uni-forms-item>
					<uni-forms-item
						v-else-if="item.optionView=='int' || item.optionView=='decimal' || item.optionView === 'float' || item.optionView === 'double'"
						:name="item.id" :label="item.title">
						<uni-easyinput type="number" :inputBorder="true" v-model="formData[item.id]"
							:disabled="item.readOnly" :placeholder="'请输入'+item.title">
						</uni-easyinput>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='text'" :name="item.id" :label="item.title">
						<uni-easyinput type="text" :inputBorder="true" v-model="formData[item.id]"
							:disabled="item.readOnly" :placeholder="'请输入'+item.title">
						</uni-easyinput>
					</uni-forms-item>
					<uni-forms-item v-else :name="item.id" :label="item.title">
						<uni-easyinput type="text" :disabled='true' :inputBorder="true" v-model="formData[item.id]"
							placeholder="暂不支持的组件">
						</uni-easyinput>
					</uni-forms-item>
				</view>
			</uni-group>
			<view class='button-only-tabbar'>
				<!-- 底部导航 -->
				<uni-row class="demo-uni-row">
					<uni-col :span="12">
						<view @click="submitForm('form')">
							<button  class="button">确 定</button>
						</view>
					</uni-col>
					<uni-col :span="12">
						<view class="button">
							<button>重 置</button>
						</view>
					</uni-col>
				</uni-row>
			</view>
		</uni-forms>
		<Empty v-else></Empty>
	</view>
</template>

<script>
	import dataTransUtils from '@/components/server/data-trans-utils.vue';
	import server from '@/components/server/server-v3.vue';
	export default {
		data() {
			return {
				criteriaItems: [],
				formData: {},
				rules: {
					test: {
						rules: [{
								required: true,
								errorMessage: '请输入用户名'
							},
							{
								minLength: 3,
								maxLength: 15,
								errorMessage: '姓名长度在 {minLength} 到 {maxLength} 个字符'
							}
						]
					},
				}
			}
		},
		async onLoad(options) {
			console.log("来自criteria", options);
			let config = uni.getStorageSync(options.key);
			//加入枚举
			let selectMSFieldIdMap = await server.getSelect(config.config.selectMSFieldIdArray);
			let criterias = config.config.ltmpl.criterias;
			this.criteriaItems = dataTransUtils.buildCriteriaItems(criterias, options, selectMSFieldIdMap);
			console.log("来自criteria,criteriaItems", this.criteriaItems);
			this.formData = dataTransUtils.buildCriteriaFormData(this.criteriaItems);
			this.options = options;
			console.log("来自criteria,formData", this.formData);
		},
		async onShow() {
			if (!this.needReload) {
				return;
			}
			console.log("reload:", this.options);
			this.pageInfo.pageNo = 1;
			let query_key = await server.getLtmplQueryKey(this.options);
			this.initData(this.ltmplConfig, query_key, this.pageInfo);
			this.queryKey = query_key;
			this.totalCount = null;
			this.needReload = false;
		},
		methods: {
			submitForm(form) {
				let that = this;
				//console.log(form);
				this.$refs[form]
					.validate()
					.then(res => {
						console.log('表单的值：', res);
						console.log('全面表单的值：', that.formData)
						// uni.showToast({
						// 	title: '验证成功'
						// })
						let pages = getCurrentPages(); //获取所有页面栈实例列表
						//let nowPage = pages[pages.length - 1]; //当前页页面实例
						let prevPage = pages[pages.length - 2]; //上一页页面实例
						prevPage.$vm.condition = that.formData; //修改上一页data里面的tagIndex 参数值
						prevPage.$vm.needReload = true;
						uni.navigateBack({
							delta: 1
						});
					})
					.catch(errors => {
						console.error('验证失败：', errors)
					})
			},
			unSelectAnyValue(itemId){
				this.formData[itemId]=null;
			}
		}
	}
</script>

<style>
</style>
