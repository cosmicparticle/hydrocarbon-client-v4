<template>
	<view>

	</view>
</template>

<script>
	import hcRequest from './hcRequest.vue';
	import moment from 'moment';
	import JSEncrypt from 'jsencrypt';
	export default {
		name: "hcServer",
		data() {
			return {

			};
		},
		async getSelect(selectMSFieldIdArray) {

			let selectMSFieldIdMap = uni.getStorageSync('selectMSFieldIdMap');
			selectMSFieldIdMap = await this.requestSelect(selectMSFieldIdMap, selectMSFieldIdArray);
			if (!uni.getStorageSync('selectMSFieldIdMap')) {
				uni.setStorageSync('selectMSFieldIdMap', selectMSFieldIdMap);
			}
			return selectMSFieldIdMap;
		},
		async requestSelectS(selectMSFieldIdArray) {
			let selectMSFieldIds = ""
			selectMSFieldIdArray.forEach((item) => {
				selectMSFieldIds += item + ","
			})
			if (selectMSFieldIdArray.length > 0) {
				let res = await hcRequest.request({
					url: `v2/meta/dict/field_options`,
					data: {
						selectMSFieldIds
					},
				});
				let sourceOptionsMap = res.optionsMap;
				//let targetOptionsMap=new Map();
				//console.log('枚举：', sourceOptionsMap);
				for (let key in sourceOptionsMap) {
					console.log('arr：', sourceOptionsMap[key]);
					for (let ar of sourceOptionsMap[key]) {
						ar.text = ar.title
					}
				}
				console.log('枚举：', res.optionsMap);
				return res.optionsMap;
			} else {
				return new Map();
			}
		},

		async requestSelect(requestedMap, selectMSFieldIdArray) {
			//先从当前状态从中找，没有的才去查
			//后续可以放在缓存里，但需要一些策略和技巧
			if (!requestedMap) {
				requestedMap = await this.requestSelectS(selectMSFieldIdArray);
			} else {
				let needRequest = []
				selectMSFieldIdArray.forEach(function(item, index, arr) {
					if (!requestedMap[item]) {
						needRequest.push(item);
					}
				})
				let subOptionsMap = await this.requestSelectS(needRequest);
				for (let key in subOptionsMap) {
					requestedMap[key] = subOptionsMap[key];
				}
			}
			return requestedMap;
		},
		async getDtmplConfig(options) {
			let key;
			let type = options.type;
			if (type == "menu") {
				key = await this.requestDtmplConfig_menu(options.menuId, type);
			} else if (type == "menu_group") {
				key = await this.requestGroupDtmplConfig_menu(options.menuId, options.fieldGroupId, type)
			} else if (type == "ratmpl") {
				key = await this.requestDtmplConfig_ratmpl(options.ratmplId, type);
			} else if (type == "ratmpl_group") {
				key = await this.requestGroupDtmplConfig_ratmpl(options.ratmplId, options.fieldGroupId, type);
			}
			return key;
		},
		async getUserDtmplConfig() {
			let key = "userDtmplConfig";
			let dtmplConfig = uni.getStorageSync(key)
			//console.log(dtmplConfig123);
			if (!dtmplConfig) {
				let url = `v2/user/dtmpl-config`
				let dtmpl = await this.requestDtmplConfig(url);
				if (dtmpl) {
					uni.setStorageSync(key, {
						dtmpl,
						type: "user",
						key,
					});
				}
			}
			return key;
		},
		getGroupType(type) {
			if (type.indexOf("group") > 0) {
				return type;
			} else {
				return type + "_group";
			}
		},
		getGroupStmplType(type) {
			if (type.indexOf("stmpl") > 0) {
				return type;
			} else if (type.indexOf("group") > 0) {
				return type + "_stmpl";
			} else {
				return type + "_group_stmpl";
			}
		},
		async requestDtmplConfig_menu(menuId, type) {
			let key = menuId + "dtmplConfig";
			let dtmplConfig = uni.getStorageSync(key)
			//console.log(dtmplConfig123);
			if (!dtmplConfig) {
				let url = `v2/menu/${menuId}/dtmpl-config`
				let dtmpl = await this.requestDtmplConfig(url);
				uni.setStorageSync(key, {
					dtmpl,
					menuId,
					type,
					key,
				});
			}
			return key;
		},

		async requestGroupDtmplConfig_menu(menuId, fieldGroupId, type) {
			let key = menuId + fieldGroupId + "fgDtmplConfig";
			let dtmplConfig = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!dtmplConfig) {
				let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/dtmpl-config`
				let dtmpl = await this.requestDtmplConfig(url);
				uni.setStorageSync(key, {
					dtmpl,
					menuId,
					fieldGroupId,
					type,
					key,
				});
			}
			return key;
		},

		async requestDtmplConfig_ratmpl(ratmplId, type) {
			let key = ratmplId + "ratmplDtmplConfig";
			let dtmplConfig = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!dtmplConfig) {
				let url = `v2/ratmpl/${ratmplId}/dtmpl-config`
				let dtmpl = await this.requestDtmplConfig(url);
				uni.setStorageSync(key, {
					dtmpl,
					ratmplId,
					type,
					key,
				});
			}
			return key;
		},

		async requestGroupDtmplConfig_ratmpl(ratmplId, fieldGroupId, type) {
			return this.requestDtmplConfig(url);
			let key = ratmplId + fieldGroupId + "ratmplDtmplConfig";
			let dtmplConfig = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!dtmplConfig) {
				let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/dtmpl-config`
				let dtmpl = await this.requestDtmplConfig(url);
				uni.setStorageSync(key, {
					dtmpl,
					ratmplId,
					fieldGroupId,
					type,
					key,
				});
			}
			return key;
		},

		async requestDtmplConfig(url) {
			let res = await hcRequest.request({
				url,
				method: "GET",
			})
			return res.dtmplConfig;
		},
		async requestGroupStmplConfig_menu(menuId, fieldGroupId) {
			let key = menuId + fieldGroupId + "menuStmplConfig";
			let config = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!config) {
				let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/stmpl-config`
				let config = await this.requestStmplConfig(url);
				uni.setStorageSync(key, {
					config,
					menuId,
					fieldGroupId,
					type: "menu_group_stmpl",
					key,
				});
			}
			return key;
		},
		async requestGroupStmplConfig_ratmpl(ratmplId, fieldGroupId) {
			let key = ratmplId + fieldGroupId + "ratmplStmplConfig";
			let config = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!config) {
				let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/stmpl-config`
				let config = await this.requestStmplConfig(url);
				uni.setStorageSync(key, {
					config,
					ratmplId,
					fieldGroupId,
					type: "ratmpl_group_stmpl",
					key,
				});
			}
			return key;
		},
		async requestRfieldStmplConfig_menu(menuId, fieldId) {
			let key = ratmplId + fieldGroupId + "menuFieldStmplConfig";
			let config = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!config) {
				let url = `v2/menu/${menuId}/rfield/${fieldId}/stmpl-config`
				let config = await this.requestStmplConfig(url);
				uni.setStorageSync(key, {
					config,
					menuId,
					fieldId,
					type: "menufield_group_stmpl",
					key,
				});
			}
			return key;
		},
		//{type:[menu_group_stmpl|ratmpl_group_stmpl|menufield_group_stmpl],menuId,fieldGroupId,fieldId,ratmplId}
		async getStmplConfig(options) {
			let key
			if (options.type == "menu_group_stmpl") {
				key = await this.requestGroupStmplConfig_menu(options.menuId, options.fieldGroupId);
			} else if (options.type == "ratmpl_group_stmpl") {
				key = await this.requestGroupStmplConfig_ratmpl(options.ratmplId, options.fieldGroupId);
			} else if (options.type == "menufield_group_stmpl") {
				key = await this.requestRfieldStmplConfig_menu(options.menuId, options.fieldId);
			}
			return uni.getStorageSync(key);
		},
		async requestStmplConfig(url) {
			let res = await hcRequest.request({
				url,
				method: "GET",
			})
			let config = {};
			if (res.config) {
				let ltmpl = {}
				ltmpl.columns = res.config.columns
				ltmpl.criterias = res.config.criterias
				config.ltmpl = ltmpl;
				config.selectMSFieldIdArray = this.getselectMSFieldIdArray(ltmpl.criterias, ltmpl.columns);
			}
			return config;
		},
		async requestLtmplConfig(url) {
			let res = await hcRequest.request({
				url,
				method: "GET",
			})
			let config = {};
			let ltmpl = res.ltmpl;
			config.ltmpl = res.ltmpl;
			config.tmplGroup = res.tmplGroup;
			config.statView = res.statView;
			config.selectMSFieldIdArray = this.getselectMSFieldIdArray(ltmpl.criterias, ltmpl.columns);
			return config;
		},
		async requestLtmplConfig_menu(menuId) {
			let key = menuId + "menuLtmplConfig";
			let config = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!config) {
				let url = `v2/menu/${menuId}/ltmpl-config`
				let config = await this.requestLtmplConfig(url);
				console.log("config", config);
				uni.setStorageSync(key, {
					config,
					menuId,
					type: "menu_ltmpl",
					key,
				});
			}
			return key;
		},
		async requestLtmplConfig_ratmpl(ratmplId) {
			let key = ratmplId + "ratmplLtmplConfig";
			let config = uni.getStorageSync(key)
			//console.log(dtmplConfig);
			if (!config) {
				let url = `v2/ratmpl/${ratmplId}/ltmpl-config`
				let config = await this.requestLtmplConfig(url);
				uni.setStorageSync(key, {
					config,
					ratmplId,
					type: "ratmpl_ltmpl",
					key,
				});
			}
			return key;
		},
		async getLtmplConfig(options) {
			let key;
			if (options.menuId) {
				key = await this.requestLtmplConfig_menu(options.menuId);
			} else {
				key = await this.requestLtmplConfig_ratmpl(options.ratmplId);
			}
			return uni.getStorageSync(key);
		},
		async requestVersionList_menu(menuId, code) {
			let res = await hcRequest.request({
				url: `v2/menu/${menuId}/entities/${code}/versions`,
				data: {
					pageNo: 1,
				},
				method: 'GET'
			})
			return res.versions;
		},

		async requestVersionList_ratmpl(ratmplId, code) {
			let res = await hcRequest.request({
				url: `v2/ratmpl/${ratmplId}/entities/${code}/versions`,
				data: {
					pageNo: 1,
				},
				method: 'GET'
			})
			return res.versions;
		},

		async requestDtmplEntity_menu(menuId, code, versionId) {
			let url = `v2/menu/${menuId}/dtmpl/entities`;
			return await this.requestDtmplEntity(url, {
				code,
				versionId: versionId ? versionId : ""
			});
		},
		//leftCode 用于权限控制
		async requestDtmplEntity_ratmpl(ratmplId, leftCode, code, versionId) {
			let url = `v2/ratmpl/${ratmplId}/dtmpl/entities`;
			return await this.requestDtmplEntity(url, {
				leftCode,
				code,
				versionId
			});
		},
		async postDtmplEntity(options) {
			console.log("post options", options)
			let dtmplConfigKey = await this.getDtmplConfig(options);
			let dtmplConfig = uni.getStorageSync(dtmplConfigKey);
			console.log("post dtmplConfig", dtmplConfig)
			let code;
			if (dtmplConfig.type == "menu") {
				code = await this.postDtmplEntity_menu(dtmplConfig.menuId, options.formData);
			} else if (dtmplConfig.type == "menu_group") {
				code = await this.postGroupDtmplEntity_menu(dtmplConfig.menuId, dtmplConfig.fieldGroupId, options
					.formData);
			} else if (dtmplConfig.type == "ratmpl") {
				code = await this.postDtmplEntity_ratmpl(dtmplConfig.ratmplId, options.formData);
			} else if (dtmplConfig.type == "ratmpl_group") {
				code = await this.postGroupDtmplEntity_ratmpl(dtmplConfig.ratmplId, dtmplConfig.fieldGroupId, options
					.formData);
			}
			return code;
		},
		async postDtmplEntity_menu(menuId, formData) {
			let url = `v2/menu/${menuId}/dtmpl/entities`;
			return this.postDtmplEntity_(url, formData);
		},
		async postDtmplEntity_ratmpl(ratmplId, formData) {
			let url = `v2/ratmpl/${ratmplId}/dtmpl/entities`;
			// formData.leftCode=leftCode;
			return this.postDtmplEntity_(url, formData);
		},
		async postGroupDtmplEntity_menu(menuId, fieldGroupId, formData) {
			let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/dtmpl/entities`;
			return this.postDtmplEntity_(url, formData);
		},
		async postGroupDtmplEntity_ratmpl(ratmplId, fieldGroupId, formData) {
			let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/dtmpl/entities`;
			return this.postDtmplEntity_(url, formData);
		},
		async postDtmplEntity_(url, formData) {
			let res = await hcRequest.request({
				url: url,
				data: formData,
				method: 'POST'
			}, 'formdata')
			let code = null;
			if (res) {
				if (res.status == "suc") {
					let msg = ""
					if (res.message) {
						msg = res.message;
					}
					uni.showToast({
						title: "保存成功! " + msg,
					})
					code = res.entityCode ? res.entityCode : res.code;
				} else {
					uni.showToast({
						title: res.message,
						icon: "none",
						duration: 3000,
					})
				}
			} else {
				message.error("保存失败!")
			}
			return code;
		},
		async uploadFile(filePath) {
			let res = await hcRequest.uploadFile(filePath);
			return res;
		},
		async getDtmplEntity(dtmplConfigKey, leftCode, entityCode, versionId) {
			let dtmplConfig = uni.getStorageSync(dtmplConfigKey);
			if (dtmplConfig.type == "menu") {
				return this.requestDtmplEntity_menu(dtmplConfig.menuId, entityCode, versionId);
			} else if (dtmplConfig.type == "menu_group") {
				return this.requestGroupDtmplEntity_menu(dtmplConfig.menuId, dtmplConfig.fieldGroupId, entityCode);
			} else if (dtmplConfig.type == "ratmpl") {
				return this.requestDtmplEntity_ratmpl(dtmplConfig.ratmplId, leftCode, entityCode, versionId);
			} else if (dtmplConfig.type == "ratmpl_group") {
				return this.requestGroupDtmplEntity_ratmpl(dtmplConfig.ratmplId, dtmplConfig.fieldGroupId, entityCode);
			}
		},
		async getUserDtmplEntity() {
			let url = `v2/user/dtmpl/entities`;
			return await this.requestDtmplEntity(url, {});
		},
		async requestGroupDtmplEntity_menu(menuId, fieldGroupId, groupEntityCode) {
			let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/dtmpl/entities`;
			return await this.requestDtmplEntity(url, {
				code: groupEntityCode
			});
		},

		async requestGroupDtmplEntity_ratmpl(ratmplId, fieldGroupId, groupEntityCode) {
			let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/dtmpl/entities`;
			return await this.requestDtmplEntity(url, {
				code: groupEntityCode
			});
		},

		async requestDtmplEntity(url, params) {

			let res = await hcRequest.request({
				url: url,
				data: params,
				method: 'GET'
			})
			if (res.status === "suc") {
				return res.entity;
			} else {
				message.error("实体不存在！")
				return null;
			}
		},
		async getFieldGroupEntities(queryInfo) {
			console.log("FieldGroupEntities options", queryInfo);
			// let options = queryInfo.options;
			let selectedCodes = queryInfo.selectedCodes.join(",");
			if (queryInfo.type == 'menu_group_stmpl') {
				return await this.requestFieldGroupEntities_menu(queryInfo.menuId, queryInfo.fieldGroupId,
					selectedCodes)
			} else if (queryInfo.type == 'ratmpl_group_stmpl') {
				return await this.requestFieldGroupEntities_ratmpl(queryInfo.ratmplId, queryInfo.fieldGroupId,
					selectedCodes)
			}
			return null;

		},
		async requestFieldGroupEntities_menu(menuId, fieldGroupId, groupEntityCodes) {
			if (!groupEntityCodes) {
				return null;
			}
			let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/entities`;
			return await this.requestFieldGroupEntities(url, {
				codes: groupEntityCodes
			});
		},
		async requestFieldGroupEntities_ratmpl(ratmplId, fieldGroupId, groupEntityCodes) {
			if (!groupEntityCodes) {
				return null;
			}
			let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/entities`;
			return await this.requestFieldGroupEntities(url, {
				codes: groupEntityCodes
			});
		},

		async requestFieldGroupEntities(url, params) {
			let res = await hcRequest.request({
				url: url,
				data: params,
				method: 'GET'
			})
			if (res.status === "suc") {
				return res.entities;
			} else {
				message.error("实体不存在！")
				return null;
			}
		},
		async requestGroupLtmplQueryKey_menu(menuId, fieldGroupId, condition) {
			let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/ltmpl/query/key`
			let res = await hcRequest.request({
				url: url,
				method: 'GET',
				data: condition
			})
			return res;
		},
		async requestGroupLtmplQueryKey_ratmpl(ratmplId, fieldGroupId, condition) {
			let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/ltmpl/query/key`
			let res = await hcRequest.request({
				url: url,
				method: 'GET',
				data: condition
			})
			return res;
		},
		async getGroupLtmplQueryKey(options) {
			let queryKey
			if (options.type == "menu_group_stmpl") {
				let exceptCodes = options.exceptCodes;
				let condition = options.condition;
				queryKey = await this.requestGroupLtmplQueryKey_menu(options.menuId, options.fieldGroupId, {
					exceptCodes,
					...condition,
				});
			} else if (options.type == "ratmpl_group_stmpl") {
				queryKey = await this.requestGroupLtmplQueryKey_ratmpl(options.ratmplId, options.fieldGroupId, options
					.condition);
			} else if (options.type == "menufield_group_stmpl") {
				//key=await this.requestRfieldStmplConfig_menu(options.menuId, options.fieldId);
			}
			return queryKey;
		},
		async getLtmplQueryKey(options) {
			let queryKey
			if (options.menuId) {
				queryKey = await this.requestLtmplQueryKey_menu(options.menuId, options.condition);
			} else {
				queryKey = await this.requestLtmplQueryKey_ratmpl(options.ratmplId, options.leftCode, options
					.condition);
			}
			return queryKey;
		},
		async requestLtmplQueryKey_ratmpl(ratmplId, leftCode, condition) {
			let url_ = `v2/ratmpl/${ratmplId}/ltmpl/query/key`
			return this.requestLtmplQueryKey(url_, {
				...condition,
				leftCode
			});
		},
		async requestLtmplQueryKey_menu(menuId, condition) {
			let url_ = `v2/menu/${menuId}/ltmpl/query/key`
			return this.requestLtmplQueryKey(url_, condition)
		},
		async requestLtmplCount_menu(menuId) {
			let url = `v2/menu/${menuId}/ltmpl/count`;
			let res = await hcRequest.request({
				url: url,
				method: 'GET',
			})
			return res.count;
		},
		async requestLtmplQueryKey(url, condition) {
			let res = await hcRequest.request({
				url: url,
				method: 'GET',
				data: condition
			})
			let queryInfo = {};

			//const selectMSFieldIdArray = this.getselectMSFieldIdArray(res.ltmpl.criterias, res.ltmpl.columns);

			//this.setCriteriasValue(res.ltmpl.criterias, res.criteriaValueMap);
			queryInfo.criteriaValueMap = res.criteriaValueMap;
			queryInfo.queryKey = res.queryKey;
			//queryInfo.moduleTitle = res.statView ? res.statView.title : res.tmplGroup.title;
			queryInfo.disabledColIds = res.disabledColIds;
			//queryInfo.selectMSFieldIdArray = selectMSFieldIdArray;
			return queryInfo;
		},
		setCriteriasValue(criterias, criteriaValueMap) {
			criterias.forEach((item) => {
				for (let k in criteriaValueMap) {
					if (k === item.id.toString()) {
						item.value = criteriaValueMap[k]
					}
				}
			})
			return criterias;
		},

		getselectMSFieldIdArray(criterias, columns) {
			const selectMSFieldIdArray = [];
			if (criterias) {
				criterias.forEach((item) => {
					if (item.inputType === "select" || item.inputType === "multiselect") {
						selectMSFieldIdArray.push(item.mStrucFieldId)
					}
				})
			}
			if (columns) {
				columns.forEach((item) => {
					if (item.viewOption === "select" || item.viewOption === "multiselect") {
						selectMSFieldIdArray.push(item.mStrucFieldId)
					}
				})
			}
			return selectMSFieldIdArray;
		},

		async requestQueryEntities(queryKey, pageInfo) {
			let res = await hcRequest.request({
				showLoading: true,
				url: `v2/query/${queryKey}/entities`,
				method: 'GET',
				data: pageInfo
			})
			return res;
		},
		async deleteEntities(options) {
			if (options.menuId) {
				return await this.deleteEntities_menu(options.menuId, options.codes);
			} else {
				return await this.deleteEntities_ratmpl(options.ratmplId, options.leftCode, options.codes)
			}

		},
		async deleteEntities_menu(menuId, codes) {
			let res = await hcRequest.request({
				url: `v2/menu/${menuId}/dtmpl/entities`,
				data: {
					codes
				},
				method: 'DELETE',
			})
			return res.status;
		},

		async deleteEntities_ratmpl(ratmplId, leftCode, codes) {
			let res = await hcRequest.request({
				url: `v2/ratmpl/${ratmplId}/dtmpl/entities`,
				data: {
					codes,
					leftCode
				},
				method: 'DELETE',
			})
			return res.status;
		},

		async requestTotalCount(queryKey) {
			let res = await hcRequest.request({
				url: `v2/query/${queryKey}/total_count`,
				method: "GET"
			})
			return res.count;
		},

		async requestFile(path) {
			let res = await hcRequest.request({
				url: "v2/files/" + path,
				method: "GET"
			})
			return res;
		},
		async postActions(options) {
			let type = options.type;
			if (type.indexOf('menu') >= 0) {
				return await this.postActions_menu(options.menuId, options.actionId, options.selectCodes);
			} else if (type.indexOf('ratmpl') >= 0) {
				return await this.postActions_ratmpl(options.ratmpl, options.leftCode, options.actionId, options
					.selectCodes);
			}
		},

		async postActions_menu(menuId, actionId, selectCodes) {
			let res = await hcRequest.request({
				url: `v2/menu/${menuId}/atmpl/${actionId}`,
				data: {
					codes: selectCodes
				},
				method: "POST",
			})
			let result = {};
			result.status = res.status;
			result.message = res.message;
			return result;
		},

		async postActions_ratmpl(ratmplId, leftCode, actionId, selectCodes) {
			let res = await hcRequest.request({
				url: `v2/ratmpl/${ratmplId}/atmpl/${actionId}`,
				data: {
					codes: selectCodes,
					leftCode,
				},
				method: "POST",
			})
			let result = {};
			result.status = res.status;
			result.message = res.message;
			return result;
		},

		async postJumps_ratmpl(ratmplId, leftCode, jtmplId, selectCodes) {
			let res = await hcRequest.request({
				url: `v2/ratmpl/${ratmplId}/jtmpl/${jtmplId}`,
				data: {
					codes: selectCodes,
					leftCode,
				},
				method: "GET",
			})
			return res;
		},

		async postJumps_menu(menuId, jtmplId, selectCodes) {
			let res = await hcRequest.request({
				url: `v2/menu/${menuId}/jtmpl/${jtmplId}`,
				data: {
					codes: selectCodes
				},
				method: "GET",
			})
			return res;
		},

		async recalc_menu(menuId) {
			let res = await hcRequest.request({
				url: `v2/menu/${menuId}/statistician/recalc`,
				method: "POST",
			})
			return res;
		},

		downloadDetailExcel_menu(menuId, entityCode) {
			const hydrocarbonToken = Units.getLocalStorge("hydrocarbonToken")
			let url = Units.api() + `v2/menu/${menuId}/dtmpl/entities/excels?code=${entityCode}&@token=${hydrocarbonToken}`
			Units.downloadFile(url);
		},

		download(path) {
			let vars = path.split("/");
			let fileName = vars[vars.length - 1]
			Units.downloadFile(this.getFileUrl(path), fileName)
		},

		getFileUrl(path) {
			const hydrocarbonToken = Units.getLocalStorge("hydrocarbonToken")
			let url = Units.api() + "v2/files/" + path + `?@token=${hydrocarbonToken}`;
			return url;
		},

		async loadTxt(path) {
			let res = await hcRequest.request({
				url: "v2/files/text/" + path,
				method: "GET",
			})
			return res.text;
		},

		async requestFaceplate_menu() {
			let url = `v2/meta/menu/faceplate`
			let res = await hcRequest.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},

		async requestFaceplateStatistic_menu() {
			let url = `v2/meta/menu/faceplate-statistic`
			let res = await hcRequest.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},

		async requestBlocks() {
			let url = `v2/meta/menu/blocks`
			let res = await hcRequest.request({
				url: url,
				method: "GET",
			})
			return res;
		},

		async logout() {
			hcRequest.request({
				url: 'v2/auth/token',
				method: 'DELETE'
			}).then((res) => {
				window.location.hash = "#/login";
			})
		},
		async login1(username, password) {
			let res = await hcRequest.request({
				url: 'v2/auth/token',
				data: {
					username: username,
					password: password
				},
				method: "GET"
			})
			return res;
		},
		async login(username, password, kaptchaToken, kaptchaText, pubkey) {

			let datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
			let json = {
				username,
				password,
				datetime
			}
			let userInfo = this.rsaEncrypt(JSON.stringify(json), pubkey);
			let res = await hcRequest.request({
				url: 'v2/auth/hctoken',
				data: {
					userInfo,
					kaptchaToken,
					kaptchaText
				},
				method: "GET"
			})

			return res;
		},
		async getKaptchaToken() {
			let res = await hcRequest.request({
				url: 'v2/auth/kaptcha',
				method: "POST"
			})
			if (res.status === 'suc') {
				return res
			} else {
				return null;
			}
		},

		async getVerifyCode(verfyToken) {
			let res = await hcRequest.request({
				url: 'v2/auth/verify/code',
				data: {
					verfyToken
				},
				method: "GET"
			})

			return res;
		},

		async verify(verfyToken, verfyCode) {
			let res = await hcRequest.request({
				url: 'v2/auth/verify/token',
				data: {
					verfyToken,
					verfyCode
				},
				method: "GET"
			})
			if (res.status === 'suc') {
				window.location.hash = "#/home";
				Units.setLocalStorge("hydrocarbonToken", res.token)
			}
			return res;
		},

		async getUser() {
			let res = await hcRequest.request({
				url: 'v2/meta/user/current_user',
			});
			let result = {};
			result.userName = res.user.username;
			result.id = res.user.id;
			return result;

		},

		async requestMessagebar_menu() {
			let url = `v2/meta/menu/messagebar`
			let res = await hcRequest.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},

		async requestSimpleCharts_menu() {
			let url = `v2/meta/menu/simple_charts`
			let res = await hcRequest.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},
		async requestSimpleChartsEntities_menu(menuId) {
			let url = `v2/menu/${menuId}/ltmpl/top_thousand_entities`
			let res = await hcRequest.request({
				url: url,
				method: "GET",
			})
			let entities = res.entities;
			if (!res.entities || res.entities.length < 1 || !res.ltmpl || !res.ltmpl.columns || res.ltmpl.columns
				.length < 3) {
				return undefined;
			}
			let columns = res.ltmpl.columns;
			let data = [];
			for (const entity of entities) {
				let item = {};
				item.type = entity.fieldMap[columns[1].id]
				item.value = parseInt(entity.fieldMap[columns[2].id])
				data.push(item);
			}
			return data;
		},
		async getRasPubkey() {
			let res = await hcRequest.request({
				url: 'v2/auth/ras-pubkey',
				method: "GET"
			})
			if (res.status === 'suc') {
				return res.rasPubkey;
			} else {
				return null;
			}
		},
		rsaEncrypt(word, keyStr) {
			const encrypt = new JSEncrypt();
			encrypt.setPublicKey(keyStr);
			return encrypt.encrypt(word);
		}
	}
</script>

<style>

</style>
