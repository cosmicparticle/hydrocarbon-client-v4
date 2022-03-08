<template>
	<view>
		<uni-forms :value="formData" :rules="rules" ref="form" validate-trigger="bind" err-show-type="undertext">
			<uni-section :title="baseEntity.title" type="line">
			</uni-section>
			<uni-group>
				<!-- <FormsItems :dataItem="list" :formData="formData"></FormsItems> -->
				<view v-for="(item,index2) in baseEntity.items">
					<uni-forms-item v-if="item.optionView=='textarea'" :name="item.id" :label="item.title">
						<uni-easyinput type="textarea" :inputBorder="true" v-model="formData[item.id]"
							:disabled="item.readOnly" :placeholder="'请输入'+item.title">
						</uni-easyinput>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='date'" :name="item.id" :label="item.title">
						<uni-datetime-picker class='uni-datetime-picker' :disabled="item.readOnly" type="date"
							v-model="formData[item.id]" start="2000-06-01 06:30:30" end="2030-6-1" return-type="string">
						</uni-datetime-picker>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='datetime' || item.optionView=='datetime-mm'"
						:name="item.id" :label="item.title">
						<uni-datetime-picker class='uni-datetime-picker' :disabled="item.readOnly" type="datetime"
							v-model="formData[item.id]" start="2000-06-01 06:30:30" end="2030-6-1" return-type="string">
						</uni-datetime-picker>
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='select'" :name="item.id" :label="item.title">
						<!-- <uni-data-picker :localdata="array" popup-title="请选择班级" @change="onchange" v-model="formData[item.id]"
						@nodeclick="onnodeclick"></uni-data-picker> -->
						<uni-data-checkbox :disabled="item.readOnly" v-model="formData[item.id]" mode="tag"
							:localdata="item.optionValue">
						</uni-data-checkbox>
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
					<!--  #ifdef  H5 || MP-WEIXIN -->
					<uni-forms-item v-else-if="item.optionView=='file'" :name="item.id" :label="item.title">
						<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)' :disabled="item.readOnly"
							file-mediatype='all' v-model="formData[item.id]" :ref="item.id" limit='1' />
					</uni-forms-item>
					<!-- #endif -->
					<!--  #ifndef  H5 || MP-WEIXIN -->
					<uni-forms-item v-else-if="item.optionView=='file'" :name="item.id" :label="item.title">
						<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)' :disabled="item.readOnly"
							file-mediatype='image' v-model="formData[item.id]" :ref="item.id" limit='1' />
					</uni-forms-item>
					<!-- #endif -->
					<uni-forms-item v-else-if="item.optionView=='picture'" :name="item.id" :label="item.title">
						<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)' :disabled="item.readOnly"
							v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='image'
							:auto-upload="false" />
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='takePhoto'" :name="item.id" :label="item.title">
						<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)' :disabled="item.readOnly"
							v-model="formData[item.id]"  :ref="item.id" limit='1' file-mediatype='image'
							:auto-upload="false" :sourceType="['camera']" />
					</uni-forms-item>
					<uni-forms-item v-else-if="item.optionView=='video'" :name="item.id" :label="item.title">
						<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)' :disabled="item.readOnly"
							v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='video'
							:auto-upload="false" />
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
				<view>
					<button @click.stop="clickToConfirm()">
						<text class="normal-button-iconfont">&#xe62e;</text>
						<text class="footer-box__item">确 定</text>
					</button>
				</view>
			</uni-group>
		</uni-forms>
	</view>
</template>

<script>
	import dataTransUtils from '@/components/server/data-trans-utils.vue';
	export default {
		data() {
			return {
				baseEntity: {},
				formData: {},
				rules: {},
				options: null,
				code: null,
			}
		},
		async onLoad(options_) {
			uni.showLoading({
				title: "数据加载中..."
			});
			let options = dataTransUtils.setUndefinedStrValueToNull(options_);
			console.log("edit onLoad options", options);
			let code_ = options.entityCode_ref ? options.entityCode_ref : dataTransUtils.guid();
			//获取baseentity
			let datail_entity = null,
				base_entity = null;
			if (options.entityCode_ref) { //直接从上级页面中获取
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let prevPage = pages[pages.length - 2]; //上一页页面实例
				datail_entity = prevPage.$vm.detailEntity;
				//根据baseEntityCode匹配baseEntity
				for (let group of datail_entity.groups) {
					if (options.fieldGroupId_ref == group.id) {
						for (let list of group.lists) {
							if (list.code == code_) {
								base_entity = list;
								base_entity.title = group.title;
								break;
							}
						}
						break;
					}
				}
			} else {
				base_entity = await dataTransUtils.getEmptyBaseEnityOfGroup(options);
			}
			let form_data = {};
			let rule_ = {}
			for (const item of base_entity.items) {
				if (item.value) {
					form_data[item.id] = item.value;
				}
				if (item.validators && item.validators.indexOf('required') >= 0) {
					rule_[item.id] = {};
					rule_[item.id]['rules'] = [];
					rule_[item.id]['rules'].push({
						required: true,
						errorMessage: '请输入' + item.title,
					})
				}
			}
			console.log('base_entity', base_entity);
			this.formData = Object.assign({}, this.formData, form_data);
			this.baseEntity = base_entity;
			this.options = options;
			this.code = code_;
			uni.hideLoading();
		},
		methods: {
			clickToConfirm() {
				let that = this;
				this.$refs['form']
					.validate()
					.then(async res => {
						console.log('表单的值：', res);
						console.log('全面表单的值：', that.formData);
						let pages = getCurrentPages(); //获取所有页面栈实例列表
						let prevPage = pages[pages.length - 2]; //上一页页面实例
						//prevPage.$vm.options.condition = that.formData; //修改上一页data里面的tagIndex 参数值
						prevPage.$vm.currentBaseEditFormData = {
							'code': that.code,
							fieldMap: that.formData,
							fieldGroupId: that.options.fieldGroupId_ref,
						};
						uni.navigateBack({
							delta: 1,
						})
					}).catch(errors => {
						console.error('验证失败：', errors)
					})
			}, 
			async selectFile(item) {
				await dataTransUtils.selectFile(item, this);
			},
			async deleteFile(item) {
				await dataTransUtils.deleteFile(item, this);
			}
		}
	}
</script>

<style>

</style>
