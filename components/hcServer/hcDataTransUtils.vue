<template>
	<view>

	</view>
</template>

<script>
	import hcServer from '@/components/hcServer/hcServerV2.vue';
	export default {
		name: "hcDataTransUtils",
		data() {
			return {

			};
		},
		async getUserDetailEnity() { //当前用户信息
			let dtmplConfigKey = await hcServer.getUserDtmplConfig();
			let dtmplConfig_cs = uni.getStorageSync(dtmplConfigKey);
			let entity_ds = await hcServer.getUserDtmplEntity(); 
			return await this.buildDetailEntity(dtmplConfig_cs, entity_ds);
		},
		async getDetailEnity(options) {
			//console.log(options);
			// uni.showToast({
			// 	title: options.entityCode + "_" + options.dtmplConfigKey,
			// 	icon: 'none'
			// });
			// if(options.type=='user'){
			// 	return await this.getUserDetailEnity();
			// }else{
				let dtmplConfigKey = await hcServer.getDtmplConfig(options);
				let leftCode = options.leftCode;
				let entityCode = options.entityCode;
				let versionId = options.versionId;
				let dtmplConfig_cs = uni.getStorageSync(dtmplConfigKey);
				
				console.log("dtmplConfig_cs", dtmplConfig_cs);
				
				let entity_ds;
				if (entityCode) {
					entity_ds = await hcServer.getDtmplEntity(dtmplConfigKey, leftCode, entityCode, versionId);
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
			let optionsMap = await this.getOptionsMap(dtmplConfig_cs);
			console.log("optionsMap:", optionsMap);
			let detail_entity = {};
			detail_entity.code = entity_ds.code;
			detail_entity.menuId = dtmplConfig_cs.menuId;
			detail_entity.groups = [];
			//设置整体操作
			detail_entity.operates = {
				saveBtn: dtmplConfig_cs.dtmpl.buttonStatus?dtmplConfig_cs.dtmpl.buttonStatus.saveButton:null,
				actions: [],
			}
			if(dtmplConfig_cs.dtmpl.actions){
				for (const act of dtmplConfig_cs.dtmpl.actions) {
					if (act.face.indexOf("detail") >= 0) {
						let action = {};
						action.id = act.id;
						action.title = act.title;
						detail_entity.operates.actions.push(action);
					}
				}
			}
			for (const group_cs of dtmplConfig_cs.dtmpl.dtmpl.groups) {
				let entityGroup = {};
				detail_entity.groups.push(entityGroup);
				entityGroup.lists = [];
				entityGroup.title = group_cs.title;

				entityGroup.msTitle = group_cs.mStrucFieldGroup ? group_cs.mStrucFieldGroup.title : "";

				entityGroup.isArray = group_cs.isArray && group_cs.isArray == 1 ? true : false;
				entityGroup.detailable = entityGroup.isArray ? group_cs.rabcUndetailable && group_cs
					.rabcUndetailable == 1 ? false : true : false;
				entityGroup.id = group_cs.id;

				if (entityGroup.isArray && entity_ds.arrayMap) {
					let groupDatas_ds = entity_ds.arrayMap[group_cs.id];
					entityGroup.relatedCodes = [];
					let maxDataCount = group_cs.mStrucFieldGroup.maxDataCount;
					entityGroup.maxDataCount = !maxDataCount || maxDataCount == 0 ? 100000 : maxDataCount;
					//设置操作
					entityGroup.operates = {
						deleteBtn: true,
						selectBtn: false,
						detailBtn: true,
						editBtn: true,
						createBtn: true,
						createBtn_r: false,
						editBtn_r: false,
					}
					//暂时用创建控制编辑
					if (group_cs.unallowedCreate == 1) {
						entityGroup.operates.createBtn = false;
						entityGroup.operates.editBtn = false;
					}
					// if (group_cs.unmodifiable == 1) {
					// 	entityGroup.operates.editBtn = false;
					// }
					if (group_cs.rabcTemplateGroupId && group_cs.rabcUncreatable != 1) {
						entityGroup.operates.createBtn_r = true;
						entityGroup.operates.createBtn = false;
					}
					if (group_cs.rabcTemplateGroupId && group_cs.rabcUnupdatable != 1) {
						entityGroup.operates.editBtn_r = true;
						entityGroup.operates.editBtn = false;
					}
					if (group_cs.unallowedDelete == 1) {
						entityGroup.operates.deleteBtn = false;
					}

					if (group_cs.dialogSelectType) {
						entityGroup.operates.selectBtn = true;
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
						list.relationSubdomain = group_cs.relationSubdomain;
						entityGroup.relatedCodes.push({
							code: list.code,
							relationLabel: list.relationLabel
						});
						list.items = [];
						for (const field_cs of group_cs.fields) {
							list.items.push(this.buildItem(field_cs, fieldMap_ds, optionsMap));
						}
					}
				} else {
					const fieldMap_ds = entity_ds.fieldMap;
					let list = {};
					entityGroup.lists.push(list);
					list.items = [];
					for (const field_cs of group_cs.fields) {
						list.items.push(this.buildItem(field_cs, fieldMap_ds, optionsMap));
					}
				}
			}
			return detail_entity;
		},
		async getEmptyBaseEnityOfGroup(options) {
			let dtmplConfigKey = await hcServer.getDtmplConfig(options);
			let dtmplConfig_cs = uni.getStorageSync(dtmplConfigKey);
			let optionsMap = await this.getOptionsMap(dtmplConfig_cs);
			let fieldGroupId = options.fieldGroupId_ref;
			console.log("dtmplConfig_cs", dtmplConfig_cs);
			console.log("optionsMap:", optionsMap);
			let base_entity = {};
			for (const group_cs of dtmplConfig_cs.dtmpl.dtmpl.groups) {
				if (group_cs.id == fieldGroupId) {
					base_entity.title = group_cs.title;
					base_entity.relationSubdomain = group_cs.relationSubdomain;
					base_entity.items = [];
					for (const field_cs of group_cs.fields) {
						base_entity.items.push(this.buildItem(field_cs, {}, optionsMap));
					}
					break;
				}
			}
			return base_entity;
		},
		async unshiftGroupEntity2DetailEnity(options) {
			let dtmplConfigKey = await hcServer.getDtmplConfig(options);
			let dtmplConfig_cs = uni.getStorageSync(dtmplConfigKey);
			console.log("dtmplConfig_cs", dtmplConfig_cs);
			let optionsMap = await this.getOptionsMap(dtmplConfig_cs);
			let unshiftEntitys = options.editedEntitys;
			let fieldGroupId_ref = options.fieldGroupId_ref;
			let detailEntity = options.detailEntity;
			//先找到对应的group
			let neededGroup_cs;
			for (const group of dtmplConfig_cs.dtmpl.dtmpl.groups) {
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
					const fieldMap_ds = groupData_ds.byDfieldIds;
					let list = {};
					if (!needGroup_de.lists) {
						needGroup_de.lists = [];
					}
					if (!needGroup_de.relatedCodes) {
						needGroup_de.relatedCodes = [];
					}
					needGroup_de.lists.unshift(list);
					list.code = groupData_ds["唯一编码"];
					needGroup_de.relatedCodes.unshift({ //暂时只能支持一组一个关系类型
						code: list.code,
						relationLabel: neededGroup_cs.mStrucFieldGroup.relationTypeNames[0],
					});
					list.items = [];
					for (const field_cs of neededGroup_cs.fields) {
						list.items.push(this.buildItem(field_cs, fieldMap_ds, optionsMap));
					}
				}
			}
		},
		async refreshGroupEntity2DetailEnity(options) {
			let dtmplConfigKey = await hcServer.getDtmplConfig(options);
			let dtmplConfig_cs = uni.getStorageSync(dtmplConfigKey);
			let optionsMap = await this.getOptionsMap(dtmplConfig_cs);
			console.log("dtmplConfig_cs", dtmplConfig_cs);
			let editedEntitys = options.editedEntitys;
			console.log("editedEntitys", editedEntitys);
			let fieldGroupId_ref = options.fieldGroupId_ref;
			let detailEntity = options.detailEntity;
			//先找到对应的group
			let neededGroup_cs;
			for (const group of dtmplConfig_cs.dtmpl.dtmpl.groups) {
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
					const fieldMap_ds = groupData_ds.byDfieldIds;
					let list = {};

					if (!needGroup_de.lists) {
						needGroup_de.lists = [];
					}
					if (!needGroup_de.relatedCodes) {
						needGroup_de.relatedCodes = [];
					}
					let lists = needGroup_de.lists
					list.code = groupData_ds["唯一编码"];
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
							relationLabel: neededGroup_cs.mStrucFieldGroup.relationTypeNames[0],
						});
					}
					list.items = [];
					for (const field_cs of neededGroup_cs.fields) {
						list.items.push(this.buildItem(field_cs, fieldMap_ds, optionsMap));
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
			//let dtmplConfig_cs = uni.getStorageSync(options.dtmplConfigKey);
			//let fieldGroupId = options.fieldGroupId;
			let detailEntity = options.detailEntity;
			let formData = options.formData;
			let baseEditFormData = options.baseEditFormData;
			let commitFormData = {};
			if (detailEntity.code) { //处理唯一编码
				commitFormData['唯一编码'] = detailEntity.code;
			}
			//添加操作
			if (formData['%actionId%']) {
				commitFormData['%actionId%'] = formData['%actionId%'];
			}
			if (formData['%leftCode%']) {
				commitFormData['%leftCode%'] = formData['%leftCode%'];
			}
			for (const group of detailEntity.groups) {
				if (!group.isArray) {
					for (const list of group.lists) {
						for (const item of list.items) {
							if ((item.value || formData[item.id]) && formData[item.id] != item.value) {
								//处理文件
								if (formData[item.id].fileValue && formData[item.id].fileValue.indexOf('$blob:') >=
									0) {
									commitFormData[item.title] = formData[item.id].fileValue;
								} else {
									commitFormData[item.title] = formData[item.id];
								}

							}
						}
					}
				} else {
					commitFormData[group.msTitle + '.$$flag$$'] = true;
					let editFormData_ = null;
					for (let index in group.relatedCodes) {
						let relatedCode = group.relatedCodes[index];
						commitFormData[`${group.msTitle}[${index}].$$relation$$`] = relatedCode.relationLabel;
						if (relatedCode.code.indexOf('-new') < 0) {
							commitFormData[`${group.msTitle}[${index}].唯一编码`] = relatedCode.code;
						}
						//追加baseEditFormData
						if (baseEditFormData.has(relatedCode.code)) {
							editFormData_ = baseEditFormData.get(relatedCode.code).byDfieldIds;
							for (const item1 of group.lists[index].items) {
								if (editFormData_[item1.id]) {
									//处理文件
									if (editFormData_[item1.id].fileValue && editFormData_[item1.id].fileValue.indexOf(
											'$blob:') >= 0) {
										commitFormData[`${group.msTitle}[${index}].${item1.title}`] = editFormData_[item1
												.id]
											.fileValue;
									} else {
										commitFormData[`${group.msTitle}[${index}].${item1.title}`] = editFormData_[item1
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
		buildItem(field_cs, fieldMap_ds, optionsMap) {
			return this.buildItem_value(field_cs, fieldMap_ds[field_cs.id], optionsMap ? optionsMap[field_cs
				.mStrucFieldId] : null);
		},
		buildItem_value(field_cs, value, optionValue) {
			let item = {};
			//const validators = field_cs.validators ? field_cs.validators.split(';') : [];
			item.id = field_cs.id;
			item.title = field_cs.title;
			item.readOnly = (field_cs.access == '读') ? true : false;
			item.required = (field_cs.required=='1')? true : false;
			item.available = field_cs.fieldAvailable;
			item.optionView = field_cs.type;
			item.instruction=field_cs.instruction;
			item.value = this.getDetailValue(value?value:field_cs.defaultValue, field_cs.type);
			item.optionValue = optionValue //枚举
			return item;
		},
		buildCriteriaItem(criteria, valueMap, optionsMap) {
			let item = {};
			item.id = "criteria_" + criteria.id;
			item.title = criteria.title;
			item.optionView = criteria.inputType;
			item.value = this.getDetailValue(valueMap[criteria.id], criteria.inputType);
			item.optionValue = optionsMap[criteria.mStrucFieldId] //枚举
			return item;
		},
		buildCriteriaItems(criterias, valueMap, optionsMap) {
			let items = [];
			for (const criteria of criterias) {
				items.push(this.buildCriteriaItem(criteria, valueMap, optionsMap));
			}
			return items;
		},
		buildCriteriaFormData(criteriaItems) {
			let formData = {};
			for (const criteria of criteriaItems) {
				//if (valueMap[criteria.id]) {
					formData[criteria.id] = criteria.value;
				// } else {
				// 	formData["criteria_" + criteria.id] = criteria.defaultValue
				// }
				// formData.push(item);
			}
			return formData;
		},
		async getOptionsMap(dtmplConfig_cs) {
			let requestSelectArr = [];
			let optionsMap;
			dtmplConfig_cs.dtmpl.dtmpl.groups.forEach((item) => {
				item.fields.forEach((it) => {
					if (it.type === "select" || it.type === "multiselect" || it.type ===
						"preselect") {
						requestSelectArr.push(it.mStrucFieldId)
					}
				})
			})
			if (requestSelectArr.length > 0) {
				optionsMap = await hcServer.getSelect(requestSelectArr);
			}
			return optionsMap;
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
				if (typeof(value) == 'string') {
					value = JSON.parse(value);
					console.log('fileValue', value);
					value = {
						name: value.base.fileName,
						extname: value.base.type,
						url: uni.getStorageSync("serverUrl") + "v2/files/" + value.base.path +
							`?@token=${uni.getStorageSync("hydrocarbon-token")}`,
					}
				} else if (!value.name) {
					value = null;
				}
			} else if (optionView == 'multiselect' && value && typeof(value) == 'string') {
				value = value.split(",");
			} else {
				let vin = value.indexOf('@R@');
				if (vin >= 0) {
					value = value.substr(vin + 3);
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

			let res = await hcServer.uploadFile(file.path);
			console.log('uploadFile res', res);
			if (res.status == 'suc') {
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
