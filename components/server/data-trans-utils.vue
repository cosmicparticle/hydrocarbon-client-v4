<template>
	<view>

	</view>
</template>

<script>
	import server from '@/components/server/server-v3.vue';
	import requset from '@/components/server/request.vue';
	export default {
		name: "dataTransUtils",
		data() {
			return {

			};
		},
		async getUserDetailEnity() { //当前用户信息
			let dtmplConfig_cs = await server.getUserDtmplConfig();
			let entity_ds = await server.getUserDtmplEntity(); 
			return await this.buildDetailEntity(dtmplConfig_cs, entity_ds);
		},
		async getDetailEnity(options) {
				let dtmplConfig_cs = await server.getDtmplConfig(options);
				let mainCode = options.mainCode;
				let entityCode = options.entityCode;
				let versionId = options.versionId;
				
				console.log("dtmplConfig_cs", dtmplConfig_cs);
				
				let entity_ds;
				if (entityCode) {
					entity_ds = await server.requestDtmplData(dtmplConfig_cs.sourceId, entityCode, versionId);
				} else {
					entity_ds = {
						arrayMap: {},
						fieldMap: {}
					};
				}
				console.log(entity_ds);
				//[{title,lists:[{code,items:[{item},{item}]},[]]
				return await this.buildDetailEntity(dtmplConfig_cs, entity_ds);
			// }
			
		},
		async buildDetailEntity(dtmplConfig_cs, entity_ds) {
			let detail_entity = {};
			detail_entity.code = entity_ds.code;
			detail_entity.menuId = dtmplConfig_cs.sourceId;
			detail_entity.groups = [];
			//设置整体操作
			detail_entity.operates = {
				saveBtn: dtmplConfig_cs.dtmpl.buttons.includes('dtmplSave'),
				actions: [],
			}
			if(dtmplConfig_cs.dtmpl.actions){
				for (const act of dtmplConfig_cs.dtmpl.actions) {
						let action = {};
						action.id = act.id;
						action.title = act.title;
						detail_entity.operates.actions.push(action);
				}
			}
			for (const group_cs of dtmplConfig_cs.dtmpl.groups) {
				let entityGroup = {};
				detail_entity.groups.push(entityGroup);
				entityGroup.lists = [];
				entityGroup.title = group_cs.title;

				//entityGroup.msTitle = group_cs.mStrucFieldGroup ? group_cs.mStrucFieldGroup.title : "";

				entityGroup.isArray = group_cs.type=='relation';
				entityGroup.detailable = group_cs.buttons.includes('detail');
				entityGroup.id = group_cs.id;

				if (entityGroup.isArray && entity_ds.arrayMap) {
					let groupDatas_ds = entity_ds.arrayMap[group_cs.id];
					entityGroup.relatedCodes = [];
					let maxDataCount = group_cs.max;
					entityGroup.maxDataCount = maxDataCount == 0 ? 100000 : maxDataCount;
					//设置操作
					let buttons=group_cs.buttons;
					entityGroup.operates = {
						deleteBtn: buttons.includes("delete"),
						selectBtn: buttons.includes("selectAdd"),
						detailBtn: buttons.includes("detail"),
						editBtn: buttons.includes("rowEdit"),
						createBtn: buttons.includes("rowAdd"),
						dtmplCreateBtn: buttons.includes("dtmplAdd"),
						editBtn_r: buttons.includes("dtmplEdit"),
					}
				
					if (!groupDatas_ds) {
						continue;
					}
					for (const groupData_ds of groupDatas_ds) {
						const fieldMap_ds = groupData_ds.fieldMap;
						let list = {};
						entityGroup.lists.push(list);
						list.code = groupData_ds.code;
						list.relationLabel = groupData_ds.relationLabel;
						list.relationSubdomain = group_cs.relationNames;
						entityGroup.relatedCodes.push({
							code: list.code,
							relationLabel: list.relationLabel
						});
						list.items = [];
						for (const field_cs of group_cs.fields) {
							list.items.push(this.buildItem(field_cs, fieldMap_ds));
						}
					}
				} else {
					const fieldMap_ds = entity_ds.fieldMap;
					let list = {};
					entityGroup.lists.push(list);
					list.items = [];
					for (const field_cs of group_cs.fields) {
						list.items.push(this.buildItem(field_cs, fieldMap_ds));
					}
				}
			}
			return detail_entity;
		},
		async getEmptyBaseEnityOfGroup(options) {
			let dtmplConfig_cs = await server.getDtmplConfig(options);
			let fieldGroupId = options.fieldGroupId_ref;
			console.log("dtmplConfig_cs", dtmplConfig_cs);
			let base_entity = {};
			for (const group_cs of dtmplConfig_cs.dtmpl.groups) {
				if (group_cs.id == fieldGroupId) {
					base_entity.title = group_cs.title;
					base_entity.relationSubdomain = group_cs.relationNames;
					base_entity.items = [];
					for (const field_cs of group_cs.fields) {
						base_entity.items.push(this.buildItem(field_cs, {}));
					}
					break;
				}
			}
			return base_entity;
		},
		async unshiftGroupEntity2DetailEnity(options) {
			let dtmplConfig_cs = await server.getDtmplConfig(options);
			console.log("dtmplConfig_cs", dtmplConfig_cs);
			let unshiftEntitys = options.editedEntitys;
			let fieldGroupId_ref = options.fieldGroupId_ref;
			let detailEntity = options.detailEntity;
			//先找到对应的group
			let neededGroup_cs;
			for (const group of dtmplConfig_cs.dtmpl.groups) {
				if (group.id == fieldGroupId_ref) {
					neededGroup_cs = group;
					break;
				}
			}
			//再找到ditailentity的group
			let needGroup_de = null;
			for (const group of detailEntity.groups) {
				if (group.id == fieldGroupId_ref) {
					needGroup_de = group;
					break;
				}
			}
			if (!neededGroup_cs) {
				uni.showToast({
					title: "点选或添加失败。没有匹配到关系组",
					icon: 'none',
				});
			} else {
				for (const groupData_ds of unshiftEntitys) {
					const fieldMap_ds = groupData_ds.fieldMap;
					let list = {};
					if (!needGroup_de.lists) {
						needGroup_de.lists = [];
					}
					if (!needGroup_de.relatedCodes) {
						needGroup_de.relatedCodes = [];
					}
					needGroup_de.lists.unshift(list);
					list.code = groupData_ds["code"];
					needGroup_de.relatedCodes.unshift({ //暂时只能支持一组一个关系类型
						code: list.code,
						relationLabel: neededGroup_cs.relationNames[0],
					});
					list.items = [];
					for (const field_cs of neededGroup_cs.fields) {
						list.items.push(this.buildItem(field_cs, fieldMap_ds));
					}
				}
			}
		},
		async refreshGroupEntity2DetailEnity(options) {
			let dtmplConfig_cs = await server.getDtmplConfig(options);
			console.log("dtmplConfig_cs", dtmplConfig_cs);
			let editedEntitys = options.editedEntitys;
			console.log("editedEntitys", editedEntitys);
			let fieldGroupId_ref = options.fieldGroupId_ref;
			let detailEntity = options.detailEntity;
			//先找到对应的group
			let neededGroup_cs;
			for (const group of dtmplConfig_cs.dtmpl.groups) {
				if (group.id == fieldGroupId_ref) {
					neededGroup_cs = group;
					break;
				}
			}
			//再找到ditailentity的group
			let needGroup_de = null;
			for (const group of detailEntity.groups) {
				if (group.id == fieldGroupId_ref) {
					needGroup_de = group;
					break;
				}
			}
			if (!needGroup_de) {
				needGroup_de = {};
			}
			if (!neededGroup_cs) {
				uni.showToast({
					title: "点选或添加失败。没有匹配到关系组",
					icon: 'none',
				});
			} else {
				for (const groupData_ds of editedEntitys) {
					const fieldMap_ds = groupData_ds.fieldMap;
					let list = {};

					if (!needGroup_de.lists) {
						needGroup_de.lists = [];
					}
					if (!needGroup_de.relatedCodes) {
						needGroup_de.relatedCodes = [];
					}
					let lists = needGroup_de.lists
					list.code = groupData_ds["code"];
					let index_ds = null;
					//查找原来entity，移除，再原地插入
					for (const lindex in lists) {
						if (lists[lindex].code == list.code) {
							index_ds = lindex;
						}
					}

					if (index_ds) {
						lists.splice(index_ds, 1, list);
					} else {
						needGroup_de.lists.unshift(list);
						needGroup_de.relatedCodes.unshift({ //暂时只能支持一组一个关系类型
							code: list.code,
							relationLabel: neededGroup_cs.relationNames[0],
						});
					}
					list.items = [];
					for (const field_cs of neededGroup_cs.fields) {
						list.items.push(this.buildItem(field_cs, fieldMap_ds));
					}
				}
			}
		},
		deleteGroupEntityFromDetailEnity(options) {
			let entityCode = options.entityCode;
			let fieldGroupId_ref = options.fieldGroupId_ref;
			let detailEntity = options.detailEntity;
			console.log("删除的entityCode", entityCode, fieldGroupId_ref);
			let removedIndex;
			let needGroup;
			for (const groupData_ds of detailEntity.groups) {
				if (fieldGroupId_ref == groupData_ds.id) {
					for (const index in groupData_ds.lists) {
						if (groupData_ds.lists[index].code == entityCode) {
							removedIndex = index;
							needGroup = groupData_ds;
							break;
						}
					}
				}
				if (removedIndex) {
					break;
				}
			}

			if (removedIndex) {
				needGroup.lists.splice(removedIndex, 1);
				let index;
				for (let i in needGroup.relatedCodes) {
					if (needGroup.relatedCodes[i].code == entityCode) {
						index = i;
						break;
					}
				}
				needGroup.relatedCodes.splice(index, 1);
				return true;
			} else {
				return false;
			}
		},
		transFormData(options) {
			let detailEntity = options.detailEntity;
			let formData = options.formData;
			let baseEditFormData = options.baseEditFormData;
			let commitFormData = {};
			if (detailEntity.code) { //处理唯一编码
				commitFormData['唯一编码'] = detailEntity.code;
			}
			//添加操作
			if (formData['actionId']) {
				commitFormData['actionId'] = formData['actionId'];
			}
			if (formData['mainCode']) {
				commitFormData['mainCode'] = formData['mainCode'];
			}
			for (const group of detailEntity.groups) {
				if (!group.isArray) {
					for (const list of group.lists) {
						for (const item of list.items) {
							if ((item.value || formData[item.id]) && formData[item.id] != item.value) {
								//处理文件
								if (formData[item.id].fileValue && formData[item.id].fileValue.indexOf('$blob:') >=
									0) {
									commitFormData[item.id] = formData[item.id].fileValue;
								} else {
									commitFormData[item.id] = formData[item.id];
								}

							}
						}
					}
				} else {
					commitFormData[group.id + '.$$flag$$'] = true;
					let editFormData_ = null;
					for (let index in group.relatedCodes) {
						let relatedCode = group.relatedCodes[index];
						commitFormData[`${group.id}[${index}].$$relation$$`] = relatedCode.relationLabel;
						if (relatedCode.code.indexOf('-new') < 0) {
							commitFormData[`${group.id}[${index}].唯一编码`] = relatedCode.code;
						}
						//追加baseEditFormData
						if (baseEditFormData.has(relatedCode.code)) {
							editFormData_ = baseEditFormData.get(relatedCode.code).fieldMap;
							for (const item1 of group.lists[index].items) {
								if (editFormData_[item1.id]) {
									//处理文件
									if (editFormData_[item1.id].fileValue && editFormData_[item1.id].fileValue.indexOf(
											'$blob:') >= 0) {
										commitFormData[`${group.id}[${index}].${item1.id}`] = editFormData_[item1
												.id]
											.fileValue;
									} else {
										commitFormData[`${group.id}[${index}].${item1.id}`] = editFormData_[item1
											.id];
									}
								}

							}
						}
					}
				}
			}
			return commitFormData;
		},
		buildItem(field_cs, fieldMap_ds) {
			return this.buildItem_value(field_cs, fieldMap_ds[field_cs.id], server.getEnum(field_cs.mstrucId));
		},
		buildItem_value(field_cs, value, optionValue) {
			let item = {};
			//const validators = field_cs.validators ? field_cs.validators.split(';') : [];
			item.id = field_cs.id;
			item.title = field_cs.title;
			item.readOnly = field_cs.disabled;
			item.required = field_cs.required;
			item.available = !field_cs.disabled;
			item.optionView = field_cs.extControlType;
			item.instruction=field_cs.instruction;
			item.value = this.getDetailValue(value?value:field_cs.defaultValue, item.optionView);
			item.optionValue = optionValue //枚举
			return item;
		},
		buildCriteriaItem(criteria, valueMap) {
			let item = {};
			item.id = "c_" + criteria.id;
			item.title = criteria.title;
			item.optionView = criteria.controlType;
			item.value = this.getDetailValue(valueMap[criteria.id], criteria.controlType);
			item.optionValue = server.getEnum(criteria.mstrucId) //枚举
			return item;
		},
		buildCriteriaItems(criterias, valueMap) {
			let items = [];
			for (const criteria of criterias) {
				items.push(this.buildCriteriaItem(criteria, valueMap));
			}
			return items;
		},
		buildCriteriaFormData(criteriaItems) {
			let formData = {};
			for (const criteria of criteriaItems) {
					formData[criteria.id] = criteria.value;
			}
			return formData;
		},
		setUndefinedStrValueToNull(obj) {
			let result = {};
			for (let key in obj) {
				let value = obj[key];
				if (!value || value == "Undefined" || value == "undefined") {
					result[key] = null;
				} else {
					result[key] = obj[key];
				}
			}
			return result;
		},
		getDetailValue(value_, optionView) {
			let value = value_ ? value_ : "";
			if ((optionView == 'file' || optionView == 'picture' || optionView == 'takePhoto') && value) {
				console.log('fileValue typeof', typeof(value));
				if (typeof(value) == 'string') {
					value = JSON.parse(value);
					console.log('fileValue', value);
					value = {
						name: value.base.fileName,
						extname: value.base.type,
						url:requset.joinPath(requset.joinPath(uni.getStorageSync("serverUrl"),"v3/files/"), value.base.path) +
							`?@token=${uni.getStorageSync("hydrocarbon-token")}`,
					}
				} else if (!value.name) {
					value = null;
				}
			} else if (optionView == 'multiselect' && value && typeof(value) == 'string') {
				value = value.split(",");
			}else if(optionView=='daterange' || optionView=='datetimerange' ){
				if(value.includes('~')){
					value= value.split("~")
				}else{
					value= value.split(",")
				}
			} else {
				if(value instanceof Array){
					let val="";
					for(let v of value){
						let vin = v.indexOf('@R@');
						if (vin >= 0) {
							val =val+ ","+v.substr(vin + 3);
						}else{
							val=","+v;
						}
					}
					if(val.length>0){
						val=val.substr(1);
					}
					value=val;
				}else{
					let vin = value.indexOf('@R@');
					if (vin >= 0) {
						value = value.substr(vin + 3);
					}
				}
			}

			return value;
		},
		//用于生成uuid
		S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		},
		guid() {
			return (this.S4() + this.S4() + this.S4() + this.S4() + this.S4() + "-new");
		},
		async selectFile(item, page) {
			console.log('files', page.$refs[item.id][0].files[0].file);
			//let that=this;
			let file = page.$refs[item.id][0].files[0].file;

			uni.showLoading({
				title: "文件上传中..."
			});

			let res = await server.uploadFile(file.path);
			console.log('uploadFile res', res);
			if (res.status == "success") {
				page.formData[item.id] = {
					"name": file.name,
					"extname": this.getFileExtname(file.name),
					"url": file.path,
					fileValue: res.fileKey,
				}
				uni.showToast({
					title: "文件上传成功",
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
				page.formData[item.id] = null;
				page.$refs[item.id][0] = null;
			}
			uni.hideLoading();
			//this.formData[item.id]=this.$refs[item.id][0].files[0].file;
		},
		async deleteFile(item, page) {
			//console.log('selectFile',item);
			//console.log('files', page.$refs[item.id][0].files[0].file);
			page.formData[item.id] = "";
		},
		getFileExtname(fileName) {
			var index1 = fileName.lastIndexOf(".");
			var index2 = fileName.length;
			var type = fileName.substring(index1 + 1, index2);
			return type;
		}

	}
</script>

<style>

</style>
