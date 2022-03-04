<template>
	<view class='list-content'>
		<uni-forms :value="formData" :rules="rules" ref="form" validate-trigger="bind" err-show-type="undertext">
			<!-- <uni-forms-item required name="生日" label="出生日期">
				<uni-datetime-picker type="date" v-model="formData['生日']" start="2000-06-01 06:30:30" end="2030-6-1" return-type="string"></uni-datetime-picker>
			</uni-forms-item> -->
			<view v-for="(group,index1) in detailEntity.groups">
				<view v-if="group.isArray">
					<uni-section :title="group.title + (group.isArray?'(共'+group.lists.length+'项)':'')" type="line">
						<button v-if="group.operates.createBtn && group.maxDataCount>group.lists.length" size="mini"
							@click.stop="clickToBaseGroupEdit(group.id)">
							<text class="iconfont">&#xe665;</text>
							<text class="iconfont-title">添加</text>
						</button>
						<button v-if="group.operates.createBtn_r && group.maxDataCount>group.lists.length" size="mini"
							@click.stop="clickToGroupEdit(group.id)">
							<text class="iconfont">&#xe664;</text>
							<text class="iconfont-title">添加</text>
						</button>
						<button v-if="group.operates.selectBtn && group.maxDataCount>group.lists.length" size="mini"
							@click.stop="toSelect(group.id,group.relatedCodes,group.maxDataCount)">
							<text class="iconfont">&#xe631;</text>
							<text class="iconfont-title">选择</text>
						</button>
					</uni-section>
					<uni-group v-for="(list,index3) in group.lists" mode='card' >
						<ItemListView :dataItem="list"></ItemListView>
						<view v-if="group.detailable">
							<view class="list-footer-box">
								<button v-if="group.operates.detailBtn" size="mini"
									@click.stop="clickToGroupDetail(list.code,group.id)">
									<text class="mini-button-iconfont">&#xe63b;</text>
									<text class="footer-box__item">详情</text></button>
								<button v-if="group.operates.editBtn" size="mini"
									@click.stop="clickToBaseGroupEdit(group.id,list.code)">
									<text class="mini-button-iconfont">&#xe75d;</text>
									<text class="footer-box__item">编辑</text></button>
								<button v-if="group.operates.editBtn_r" size="mini"
									@click.stop="clickToGroupEdit(group.id,list.code)">
									<text class="mini-button-iconfont">&#xe66f;</text>
									<text class="footer-box__item">编辑</text></button>
								<button v-if="group.operates.deleteBtn" size="mini"
									@click.stop="clickToGroupDelete(list.code,group.id)">
									<text class="mini-button-iconfont">&#xe666;</text>
									<text class="footer-box__item">删除</text></button>
							</view>
						</view>
					</uni-group>
				</view>
				<view v-else>
					<uni-section :title="group.title" type="line">
					</uni-section>
					<uni-group v-for="(list,index3) in group.lists">
						<!-- <FormsItems :dataItem="list" :formData="formData"></FormsItems> -->
						<view v-for="(item,index2) in list.items">
							<uni-forms-item :required="item.required" v-if="item.optionView=='textarea'" :name="item.id" :label="item.title">
								<uni-easyinput type="textarea" :inputBorder="true" v-model="formData[item.id]"
									:disabled="item.readOnly" :placeholder="'请输入'+item.title">
								</uni-easyinput>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='date'" :name="item.id" :label="item.title">
								<uni-datetime-picker class='uni-datetime-picker' :disabled="item.readOnly" type="date"
									v-model="formData[item.id]" start="2000-06-01 06:30:30" end="2030-6-1"
									return-type="string">
								</uni-datetime-picker>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='datetime' || item.optionView=='datetime-mm'" :name="item.id" :label="item.title">
								<uni-datetime-picker  class='uni-datetime-picker' :disabled="item.readOnly" type="datetime"
									v-model="formData[item.id]" start="2000-06-01 06:30:30" end="2030-6-1"
									return-type="string">
								</uni-datetime-picker>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='select'" :name="item.id" :label="item.title">
								<!-- <uni-data-picker :localdata="array" popup-title="请选择班级" @change="onchange" v-model="formData[item.id]"
									@nodeclick="onnodeclick"></uni-data-picker> -->
								<uni-data-checkbox v-if="item.optionValue && item.optionValue.length>0" :disabled="item.readOnly" v-model="formData[item.id]" mode="tag"
									:localdata="item.optionValue">
								</uni-data-checkbox>
								<div v-else>
									暂无选项
								</div>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='multiselect'" 
								:name="item.id" :label="item.title">
								<uni-data-checkbox v-if="item.optionValue && item.optionValue.length>0" :multiple="true" v-model="formData[item.id]" mode="tag"
									:disabled="item.readOnly" :localdata="item.optionValue">
								</uni-data-checkbox>
								<div v-else>
									暂无选项
								</div>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='caselect'" 
								:name="item.id" :label="item.title">
								<uni-data-picker :localdata="item.optionValue" :popup-title="'请选择'+item.title"
								:disabled="item.readOnly"	@change="onchange" v-model="formData[item.id]" @nodeclick="onnodeclick">
								</uni-data-picker>
							</uni-forms-item>
							<!--  #ifdef  H5 || MP-WEIXIN -->
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='file'" 
								:name="item.id" :label="item.title">
								<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
								:disabled="item.readOnly"	file-mediatype='all' v-model="formData[item.id]" :ref="item.id" limit='1' />
							</uni-forms-item>
							<!-- #endif -->
							<!--  #ifndef  H5 || MP-WEIXIN -->
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='file'"
								:name="item.id" :label="item.title">
								<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
								:disabled="item.readOnly"	file-mediatype='image'  v-model="formData[item.id]" :ref="item.id" limit='1' />
							</uni-forms-item>
							<!-- #endif -->
							
							<uni-forms-item  :required="item.required" v-else-if="item.optionView=='takePhoto' "
								:name="item.id" :label="item.title">
								<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
								:disabled="item.readOnly"	v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='image'
									:auto-upload="false" :sourceType="['camera']" />
							</uni-forms-item>
							<!-- <uni-forms-item v-else-if="item.optionView=='takePhoto'"
								:name="item.id" :label="item.title">
								<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
								:disabled="item.readOnly"	v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='image'
									:auto-upload="false" /> -->
								<!-- <uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
								:disabled="item.readOnly" 	v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='image'
									:auto-upload="false" :source-type="['camera']"/> -->
									<!-- <htz-image-upload :sourceType="['camera']" 
									        :max="2" 
											:ref="item.id"
									        v-model="formData[item.id]" 
											@chooseSuccess='takePhoto(item)'
									       ></htz-image-upload> -->
							<!-- </uni-forms-item> -->
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='picture' " 
								:name="item.id" :label="item.title">
								<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
								:disabled="item.readOnly"	v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='image'
									:auto-upload="false" />
							</uni-forms-item>
							<uni-forms-item  :required="item.required" v-else-if="item.optionView=='video'" 
								:name="item.id" :label="item.title">
								<uni-file-picker @select='selectFile(item)' @delete='deleteFile(item)'
									:disabled="item.readOnly" v-model="formData[item.id]" :ref="item.id" limit='1' file-mediatype='video'
									:auto-upload="false" />
							</uni-forms-item>
							<uni-forms-item  :required="item.required"
								v-else-if="item.optionView=='int' || item.optionView=='decimal' || item.optionView === 'float' || item.optionView === 'double'"
								:name="item.id" :label="item.title" >
								<uni-easyinput type="number" :inputBorder="true" v-model="formData[item.id]"
									:disabled="item.readOnly" :placeholder="'请输入'+item.title">
								</uni-easyinput>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else-if="item.optionView=='text'" 
								:name="item.id" :label="item.title">
								<uni-easyinput type="text" :inputBorder="true" v-model="formData[item.id]"
									:disabled="item.readOnly" :placeholder="'请输入'+item.title">
								</uni-easyinput>
							</uni-forms-item>
							<uni-forms-item :required="item.required" v-else :name="item.id" :label="item.title">
								<uni-easyinput type="text" :disabled='true' :inputBorder="true"
									v-model="formData[item.id]" placeholder="暂不支持的组件">
								</uni-easyinput>
							</uni-forms-item>
						</view>
					</uni-group>
				</view>
			</view>
			<view class='button-only-tabbar'>
				<uni-row>
					<uni-col :span="12">
						<button :disabled="!detailEntity.operates.saveBtn" @click.stop="submitForm('form')">保 存</button>
					</uni-col>
					<uni-col :span="12">
						<view class="button uni-padding-wrap ">
							<view class="uni-btn-v">
								<button
									:disabled="!detailEntity.operates.actions || detailEntity.operates.actions.length==0"
									@tap="moreAction">更多操作</button>
							</view>
						</view>
					</uni-col>
				</uni-row>
			</view>
		</uni-forms>
		<view>
			<!-- 提示窗示例 -->
			<uni-popup ref="deleteAlertDialog" type="dialog">
				<uni-popup-dialog type="warn" title="删除提示" content="您确定删除这条关系数据吗？" @close="deleteCancel"
					@confirm="deleteConfirm"></uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import htzImageUpload from '@/components/htz-image-upload/htz-image-upload.vue'
	import hcServer from '@/components/hcServer/hcServerV2.vue';
	import hcDataTransUtils from '@/components/hcServer/hcDataTransUtils.vue';
	export default {
		data() {
			return {
				buttonRect: {},
				detailEntity: {
					operates: {
						actions: null
					}
				},
				menuId: "",
				options: {},
				newGroupSelected: null,
				editedData: null,
				deletingEntityCode: null,
				deletingRelatedGroupId: null,
				rules: {
					f152513364664323: {
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
					f152513364664322: {
						rules: [{
								required: true,
								errorMessage: '请输入用123'
							},
							{
								minLength: 3,
								maxLength: 15,
								errorMessage: '姓名长度在 {minLength} 到 {maxLength} 个字符'
							}
						]
					},
				},
				formData: {},
				baseEditFormData:new Map(),
				currentBaseEditFormData:null,
			}
		},
		async onLoad(options_) {
			uni.showLoading({
				title: "数据加载中..."
			});
			let options = hcDataTransUtils.setUndefinedStrValueToNull(options_);
			console.log("edit onLoad options", options);
			this.detailEntity = await hcDataTransUtils.getDetailEnity(options);
			//组织formdata
			let form_data = {};
			let rule_={}
			for (const group of this.detailEntity.groups) {
				if (!group.isArray) {
					for (const list of group.lists) {
						for (const item of list.items) {
							if (item.value) {
								form_data[item.id] = item.value;
							}else if(item.required){
								form_data[item.id] = undefined;
							}
							if(item.required){
								rule_[item.id]={};
								rule_[item.id]['rules']=[];
								rule_[item.id]['rules'].push({
									required: true,
									errorMessage: '请输入'+item.title,
								})
							}
						}
					}
				}
			}
			this.rules=rule_;
			this.formData = Object.assign({}, this.formData, form_data);
			this.menuId = this.detailEntity.menuId;
			this.options = options;
			console.log("detailEntity:", this.detailEntity);
			uni.hideLoading();
		},
		async onShow() {
			
			console.log("edit onShow options", this.options);
			console.log("edit onshow", this.newGroupSelected);
			let entitys_ds = null;
			
			//处理点选
			if (this.newGroupSelected && this.newGroupSelected.selectedCodes.length > 0) {
				uni.showLoading({
					title: "数据加载中..."
				});
				//去查询数据并补充到detailEntity中
				entitys_ds = await hcServer.getFieldGroupEntities(this.newGroupSelected);
				console.log("edit select ds", entitys_ds);
				hcDataTransUtils.unshiftGroupEntity2DetailEnity({
					...this.options,
					editedEntitys: entitys_ds,
					fieldGroupId_ref: this.newGroupSelected.fieldGroupId,
					detailEntity: this.detailEntity,
				})
				this.newGroupSelected = null;
				uni.hideLoading();
			}
			//处理模板修改
			if (this.editedData && this.editedData.status) {
				uni.showLoading({
					title: "数据加载中..."
				});
				//去查询数据并替换到detailEntity中
				this.editedData.type = hcServer.getGroupStmplType(this.options.type);
				entitys_ds = await hcServer.getFieldGroupEntities(this.editedData);
				console.log("new select ds", entitys_ds);
				hcDataTransUtils.refreshGroupEntity2DetailEnity({
					...this.options,
					editedEntitys: entitys_ds,
					fieldGroupId_ref: this.editedData.fieldGroupId,
					detailEntity: this.detailEntity,
				})
				this.editedData = null;
				uni.hideLoading();
			}
			
			//处理行内修改
			if(this.currentBaseEditFormData){
				console.log("baseEditFormData",this.currentBaseEditFormData);
				
				//追加显示
				hcDataTransUtils.refreshGroupEntity2DetailEnity({
					...this.options,
					editedEntitys: [this.currentBaseEditFormData],
					fieldGroupId_ref: this.currentBaseEditFormData.fieldGroupId,
					detailEntity: this.detailEntity,
				})
				this.baseEditFormData.set(this.currentBaseEditFormData['唯一编码'],this.currentBaseEditFormData);
				this.currentBaseEditFormData=null;
			}
			
		},
		methods: {
			moreAction() {
				const that = this;
				let itemList = [];
				for (const action of that.detailEntity.operates.actions) {
					itemList.push(action.title);
				}
				uni.showActionSheet({
					title: '操 作',
					itemList,
					popover: {
						top: that.buttonRect.top * 2 + that.buttonRect.height,
						left: that.buttonRect.left + that.buttonRect.width / 2
					},
					success: async (e) => {
						console.log(e.tapIndex);
						that.formData['%actionId%'] = that.detailEntity.operates.actions[e.tapIndex].id;
						await this.submitForm('form');
					}
				})
			},
			async submitForm(form) {
				let that = this;
				//that.$refs['files'];
				//console.log(form);
				this.$refs[form]
					.validate()
					.then(async res => {
						console.log('表单的值：', res);
						console.log('全面表单的值：', that.formData);

						let formDataOptions={
							detailEntity: that.detailEntity,
							formData: that.formData,
							baseEditFormData:that.baseEditFormData,
						}
						if(that.options.leftCode){
							formDataOptions.formData['%leftCode%']=that.options.leftCode;
						}
						
						let submitData = await hcDataTransUtils.transFormData(formDataOptions); 
						let code = await hcServer.postDtmplEntity({
							formData: submitData,
							...that.options,
						});
						if (code) {
							setTimeout(function() {
								let pages = getCurrentPages(); //获取所有页面栈实例列表
								let prevPage = pages[pages.length - 2]; //上一页页面实例
								//prevPage.$vm.options.condition = that.formData; //修改上一页data里面的tagIndex 参数值
								prevPage.$vm.editedData = {
									status: code ? true : false,
									selectedCodes: [code],
									...that.options,
								};
								uni.navigateBack({
									delta: 1,
								})
							}, 2000)
						} else { //清空%actionId%
							that.formData['%actionId%'] = null;
						}
					})
					.catch(errors => {
						console.error('验证失败：', errors)
					})
			},
			onEditorReady() {
				// #ifdef MP-BAIDU
				this.editorCtx = requireDynamicLib('editorLib').createEditorContext('editorId');
				// #endif
				// #ifdef APP-PLUS || H5 ||MP-WEIXIN
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
				}).exec()
				// #endif
			},
			undo() {
				this.editorCtx.undo()
			},
			onchange(e) {
				const value = e.detail.value
			},
			bindPickerChange: function(e) {
				console.log('picker发送选择改变，携带值为：' + e.detail.value)
				this.index = e.detail.value
			},
			async clickToGroupDetail(entityCode, fieldGroupId) {
				// uni.showToast({
				// 	title: entityCode+'-'+fieldGroupId,
				// 	icon: 'none'
				// })
				//let dtmplConfigKey = await hcServer.requestGroupDtmplConfig_menu(this.menuId, fieldGroupId);
				uni.navigateTo({
					url: `../detail/detail?type=${hcServer.getGroupType(this.options.type)}&entityCode=${entityCode}&menuId=${this.options.menuId}&fieldGroupId=${fieldGroupId}&ratmplId=${this.options.ratmplId}&leafCode=${this.options.leafCode}`,
				})
			},
			clickToGroupDelete(entityCode, fieldGroupId) {
				this.deletingEntityCode = entityCode;
				this.deletingRelatedGroupId = fieldGroupId;
				this.$refs.deleteAlertDialog.open()
			},
			async deleteConfirm() {
				this.$refs.deleteAlertDialog.close();

				hcDataTransUtils.deleteGroupEntityFromDetailEnity({
					entityCode: this.deletingEntityCode,
					fieldGroupId_ref: this.deletingRelatedGroupId,
					detailEntity: this.detailEntity,
				})
				this.deletingEntityCode = null;
				this.deletingRelatedGroupId = null;
			},
			deleteCancel() {
				this.deletingEntityCode = null;
				this.deletingRelatedGroupId = null;
			},
			toSelect(fieldGroupId, excepts, maxDataCount) {
				console.log("要选择的fieldGroupId", fieldGroupId)
				let exceptCodes = "";
				for (let ex of excepts) {
					exceptCodes = exceptCodes + ex.code + ",";
				}
				let url =
					`../checkList/checkList?type=${hcServer.getGroupStmplType(this.options.type)}&menuId=${this.menuId}&fieldGroupId=${fieldGroupId}&exceptCodes=${exceptCodes}&maxDataCount=${maxDataCount}`;
				uni.navigateTo({
					url,
				})
			},
			async clickToGroupEdit(fieldGroupId, entityCode) {
				let url;
				//if (entityCode) { //编辑或添加
				url =
					`../edit/edit?type=${hcServer.getGroupType(this.options.type)}&entityCode=${entityCode}&menuId=${this.options.menuId}&fieldGroupId=${fieldGroupId}&ratmplId=${this.options.ratmplId}&leafCode=${this.options.leafCode}`;
				//}
				uni.navigateTo({
					url,
				})
			},
			async clickToBaseGroupEdit(fieldGroupId, baseEntityCode) {
				let url;
				//if (entityCode) { //编辑或添加
				url =
					`../edit/baseEdit?type=${this.options.type}&menuId=${this.options.menuId}&fieldGroupId=${this.options.fieldGroupId}&ratmplId=${this.options.ratmplId}&leafCode=${this.options.leafCode}&fieldGroupId_ref=${fieldGroupId}&entityCode_ref=${baseEntityCode}`;
				//}
				uni.navigateTo({
					url,
				})
			},
			async selectFile(item) {
				await hcDataTransUtils.selectFile(item,this);
			},
			async takePhoto(item) {// tempFilePaths文件路径 type 0:图片 1:视频
				console.log("tempFilePaths:",item);
				await hcDataTransUtils.selectFile(item,this);
			},
			async deleteFile(item) {
				await hcDataTransUtils.deleteFile(item,this);
			}
		},
	}
</script>

<style>
	.list-content {
		padding-bottom: 52px;
	}

	,
	.uni-card-0 {
		z-index: 0; 
	}
</style>
