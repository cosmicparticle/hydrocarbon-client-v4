<template>
	<view>

	</view>
</template>

<script>
	import request from './request.vue';
	import moment from 'moment';
	import JSEncrypt from 'jsencrypt';
	export default {
		name: "server",
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
			let mstrucIds = ""
			selectMSFieldIdArray.forEach((item) => {
				mstrucIds += item + ","
			})
			if (selectMSFieldIdArray.length > 0) {
				let res = await request.request({
					url: `v3/field/enum`,
					data: {
						mstrucIds
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
			return  this.requestDtmplConfig(options.sourceName,options.sourceId);
		},
		async getUserDtmplConfig() {
			let key = "userDtmplConfig";
			let dtmplConfig = uni.getStorageSync(key)
			//console.log(dtmplConfig123);
			if (!dtmplConfig) {
				let url = `v3/user/dtmpl/config`
				let res = await request.request({
					url,
					method: "GET",
				})
				if (res) {
					uni.setStorageSync(key, {
						dtmpl:res.dtmplConfig,
						sourceName: "user",
					});
				}
			}
			return key;
		},
		// getGroupType(type) {
		// 	if (type.indexOf("group") > 0) {
		// 		return type;
		// 	} else {
		// 		return type + "_group";
		// 	}
		// },
		// getGroupStmplType(type) {
		// 	if (type.indexOf("stmpl") > 0) {
		// 		return type;
		// 	} else if (type.indexOf("group") > 0) {
		// 		return type + "_stmpl";
		// 	} else {
		// 		return type + "_group_stmpl";
		// 	}
		// },
		async requestDtmplConfig(sourceName,sourceId, type) {
			let configs = uni.getStorageSync('dtmplConfig');
			if(!configs){
				configs=new Map();
				uni.setStorageSync('dtmplConfig',configs);
			}
			let config=configs.get(sourceId);
			if(!config){
				let url = `v3/${sourceName}/dtmpl/config`
				let res = await request.request({
					url,
					method: "GET",
					data:{
						sourceId
					},
					
				})
				 config={
					dtmpl:res.dtmplConfig,
					sourceName,
					sourceId
				};
				configs.set(sourceId,config);
			}
			return {...config};
		},


		// async requestGroupStmplConfig_menu(menuId, fieldGroupId) {
		// 	let key = menuId + fieldGroupId + "menuStmplConfig";
		// 	let config = uni.getStorageSync(key)
		// 	//console.log(dtmplConfig);
		// 	if (!config) {
		// 		let url = `v2/menu/${menuId}/field-group/${fieldGroupId}/stmpl-config`
		// 		let config = await this.requestStmplConfig(url);
		// 		uni.setStorageSync(key, {
		// 			config,
		// 			menuId,
		// 			fieldGroupId,
		// 			type: "filed-group-stmpl",
		// 			key,
		// 		});
		// 	}
		// 	return key;
		// },
		// async requestGroupStmplConfig_ratmpl(ratmplId, fieldGroupId) {
		// 	let key = ratmplId + fieldGroupId + "ratmplStmplConfig";
		// 	let config = uni.getStorageSync(key)
		// 	//console.log(dtmplConfig);
		// 	if (!config) {
		// 		let url = `v2/ratmpl/${ratmplId}/field-group/${fieldGroupId}/stmpl-config`
		// 		let config = await this.requestStmplConfig(url);
		// 		uni.setStorageSync(key, {
		// 			config,
		// 			ratmplId,
		// 			fieldGroupId,
		// 			type: "ratmpl_group_stmpl",
		// 			key,
		// 		});
		// 	}
		// 	return key;
		// },
		// async requestRfieldStmplConfig_menu(menuId, fieldId) {
		// 	let key = fieldId + "rFieldStmplConfig";
		// 	let config = uni.getStorageSync(key)
		// 	//console.log(dtmplConfig);
		// 	if (!config) {
		// 		let url = `v2/menu/${menuId}/rfield/${fieldId}/stmpl-config`
		// 		let config = await this.requestStmplConfig(url);
		// 		uni.setStorageSync(key, {
		// 			config,
		// 			menuId,
		// 			fieldId,
		// 			type: "rfield-stmpl",
		// 			key,
		// 		});
		// 	}
		// 	return key;
		// },
		//{type:[menu_group_stmpl|ratmpl_group_stmpl|menufield_group_stmpl],menuId,fieldGroupId,fieldId,ratmplId}
		async getStmplConfig(sourceName,sourceId) {
			let configs = uni.getStorageSync('stmplConfig');
			if(!configs){
				configs=new Map();
				uni.setStorageSync('stmplConfig',configs);
			}
			let config=configs.get(sourceId);
			if(!config){
				config=this.requestStmplConfig(sourceName,sourceId);
				configs.set(sourceId,config);
			}
			return {...config};
			// if (options.type == "menu-group-stmpl") {
			// 	key = await this.requestGroupStmplConfig_menu(options.menuId, options.fieldGroupId);
			// } else if (options.type == "ratmpl_group_stmpl") {
			// 	key = await this.requestGroupStmplConfig_ratmpl(options.ratmplId, options.fieldGroupId);
			// } else if (options.type == "rfield-group-stmpl") {
			// 	key = await this.requestRfieldStmplConfig_menu(options.menuId, options.fieldId);
			// }
			// return uni.getStorageSync(key);
		},
		async requestStmplConfig(sourceName,sourceId) {
			let url = `/v3/${sourceName}/select/config`;
			let res = await request.request({
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
		async requestLtmplConfig(sourceName,sourceId) {
			let configs = uni.getStorageSync('dtmplConfig');
			if(!configs){
				configs=new Map();
				uni.setStorageSync('dtmplConfig',configs);
			}
			let config=configs.get(sourceId);
			if(!config){
				let res = await request.request({
					url,
					method: "GET",
				})
				config = {};
				let ltmpl = res.ltmpl;
				config.ltmpl = res.ltmpl;
				config.tmplGroup = res.tmplGroup;
				config.statView = res.statView;
				config.selectMSFieldIdArray = this.getselectMSFieldIdArray(ltmpl.criterias, ltmpl.columns);
				configs.set(sourceId,config);
			}
			
		},
		async getLtmplConfig(options) {
			return await this.requestLtmplConfig(options.sourceName,options.sourceId);
		},
		async requestVersionList(sourceName,sourceId, code) {
			let res = await request.request({
				url: `/v3/${sourceName}/data/versions`,
				data: {
					pageNo: 1,
					sourceId,
					code
				},
				method: 'GET'
			})
			return res.versions;
		},
		async postDtmplEntity(options) {
			console.log("post options", options)
			let dtmplConfig = await this.getDtmplConfig(options);
			// console.log("post dtmplConfig", dtmplConfig)
			// let sourceId=undefined;
			// if (dtmplConfig.type == "menu") {
			// 	sourceId=dtmplConfig.menuId;
			// } else if (dtmplConfig.type == "field-group") {
			// 	sourceId=dtmplConfig.fieldGroupId;
			// } else if (dtmplConfig.type == "ratmpl") {
			// 	sourceId=dtmplConfig.ratmplId;
			// }else if (dtmplConfig.type == "rfield") {
			// 	sourceId=dtmplConfig.rfieldId;
			// } 
			// if(sourceId){
			return postDtmplData(dtmplConfig.sourceName,dtmplConfig.sourceId,options
						.formData);
			// }else{
			// 	return undefined;
			// }
			
		},

		async postDtmplData(sourceName,sourceId,formData) {
			let url = `/v3/${sourceName}/dtmpl/data`;
			let res = await request.request({
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
			let res = await request.uploadFile(filePath);
			return res;
		},
		// async getDtmplEntity(dtmplConfigKey, entityCode, versionId) {
		// 	let dtmplConfig = uni.getStorageSync(dtmplConfigKey);
		// 	let sourceId=undefined;
		// 	if (dtmplConfig.type == "menu") {
		// 		sourceId=dtmplConfig.menuId;
		// 	} else if (dtmplConfig.type == "field-group") {
		// 		sourceId=dtmplConfig.fieldGroupId;
		// 	} else if (dtmplConfig.type == "ratmpl") {
		// 		sourceId=dtmplConfig.ratmplId;
		// 	}
		// 	if(sourceId){
		// 		return this.requestDtmplData(dtmplConfig.type,sourceId,entityCode, versionId);
		// 	}else{
		// 		return undefined;
		// 	}
			
		// },
		async getDtmplEntity(dtmplConfig, entityCode, versionId) {	
			return this.requestDtmplData(dtmplConfig.sourceName,dtmplConfig.sourceId,entityCode, versionId);
		},
		async getUserDtmplEntity() {
			let url = `v3/user/dtmpl/data`;
			let res = await request.request({
				url: url,
				method: 'GET'
			})
			if (res.status === "suc") {
				return res.entity;
			} else {
				message.error("实体不存在！")
				return null;
			}
		},
		async requestDtmplData(sourceName,sourceId, code,versionId) {
			let url = `/v3/${sourceName}/dtmpl/data`;
			let res = await request.request({
				url: url,
				data: {
						code,versionId,sourceId
					},
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
			return requestSelectedData('field-group',queryInfo.fieldGroupId, queryInfo.selectedCodes)
		},
		async requestSelectedData(sourceName,sourceId, codes) {
			let url = `/v3/${sourceName}/data/selected`
			let res = await request.request({
				url: url,
				data: {codes,sourceId},
				method: 'GET'
			})
			if (res.status === "suc") {
				return res.entities;
			} else {
				message.error("实体不存在！")
				return null;
			}
		},
		async getGroupLtmplQueryKey(options) {
			let queryKey
			if (options.type == "menu-group-stmpl" || options.type == "ratmpl_group_stmpl") {
				let exceptCodes = options.exceptCodes;
				let condition = options.condition;
				queryKey = await this.requestLtmplQueryKey('field-group', options.fieldGroupId, {
					exceptCodes,
					...condition,
				});
			} else if (options.type == "rfield-stmpl") {
				//key=await this.requestRfieldStmplConfig_menu(options.menuId, options.fieldId);
				let exceptCodes = options.exceptCodes;
				let condition = options.condition;
				queryKey = await this.requestLtmplQueryKey('rfield', options.fieldId, {
					exceptCodes,
					...condition,
				});
			}
			return queryKey;
		},
		async getLtmplQueryKey(options) {
			let queryKey
			if (options.menuId) {
				queryKey = await this.requestLtmplQueryKey('menu',options.menuId, options.condition);
			} else {
				queryKey = await this.requestLtmplQueryKey('ratmpl',options.ratmplId, options
					.condition);
			}
			return queryKey;
		},

		async requestLtmplQueryKey(souceName,sourceId, condition) {
			let url_ = `v3/${souceName}/ltmpl/query/key`
			let res = await request.request({
				url: url,
				method: 'GET',
				data:{...condition,sourceId }
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
		async requestLtmplCount_menu(sourceId) {
			let url = `v3/menu/ltmpl/data/count`;
			let res = await request.request({
				url: url,
				method: 'GET',
				data:{sourceId	
				}
			})
			return res.count;
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
			let res = await request.request({
				showLoading: true,
				url: `/v3/ltmpl/query/data`,
				method: 'GET',
				data: {queryKey,...pageInfo}
				
			})
			return res;
		},
		async deleteEntities(options) {
			if (options.menuId) {
				return await this.deleteEntities('menu',options.menuId, options.codes);
			} else {
				return await this.deleteEntities('ratmpl',options.ratmplId, options.codes)
			}

		},
		async deleteEntities(sourceName,sourceId, codes) {
			let res = await request.request({
				url: `v3/${sourceName}/data`,
				data: {
					codes,
					leftCode
				},
				method: 'DELETE',
			})
			return res.status;
		},

		async requestTotalCount(queryKey) {
			let res = await request.request({
				url: `v3/ltmpl/query/count`,
				method: "GET",
				data:{
					queryKey
				}
			})
			return res.count;
		},

		async requestFile(path) {
			let res = await request.request({
				url: "v3/files/" + path,
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
		}
		,
		
		async postActions(sourceName,sourceId, actionId, selectCodes) {
			let res = await request.request({
				url: `v3/${sourceName}/action`,
				data: {
					codes: selectCodes,
					actionId,
					sourceId
				},
				method: "POST",
			})
			let result = {};
			result.status = res.status;
			result.message = res.message;
			return result;
		},

		async postActions_menu(menuId, actionId, selectCodes) {
			return this.postActions('menu',menuId, actionId, selectCodes);
		},

		async postActions_ratmpl(ratmplId, actionId, selectCodes) {
			return this.postActions('ratmpl',ratmplId, actionId, selectCodes);
		},

// //服务端暂不支持
// 		async postJumps_ratmpl(ratmplId, leftCode, jumpId, selectCodes) {
// 			let res = await request.request({
// 				url: `v3/ratmpl/jump`,
// 				data: {
// 					codes: selectCodes,
// 					jumpId,
// 					sourceId,
// 				},
// 				method: "GET",
// 			})
// 			return res;
// 		},

		async postJumps_menu(sourceId, jumpId, selectCodes) {
			let res = await request.request({
				url: `v3/menu/jump`,
				data: {
					codes: selectCodes,
					jumpId,
					sourceId,
				},
				method: "GET",
			})
			return res;
		},

		async recalc_menu(sourceId) {
			let res = await request.request({
				url: `v3/menu/stat/recalc`,
				method: "POST",
				data:{
					sourceId
				}
			})
			return res;
		},

		async incRecalc_menu(sourceId) {
			let res = await request.request({
				url: `v3/menu/stat/increcalc`,
				method: "POST",
				data:{
					sourceId
				}
			})
			return res;
		},

		downloadDetailExcel_menu(sourceId, entityCode) {
			const hydrocarbonToken = Units.getLocalStorge("hydrocarbonToken")
			let url = Units.api() + `v3/menu/dtmpl/excel?sourceId=
		${sourceId}&&code=${entityCode}&@token=${hydrocarbonToken}`
			Units.downloadFile(url);
		},

		download(path) {
			let vars = path.split("/");
			let fileName = vars[vars.length - 1]
			Units.downloadFile(this.getFileUrl(path), fileName)
		},

		getFileUrl(path) {
			const hydrocarbonToken = Units.getLocalStorge("hydrocarbonToken")
			let url = Units.api() + "v3/files/" + path + `?@token=${hydrocarbonToken}`;
			return url;
		},

		async loadTxt(path) {
			let res = await request.request({
				url: "v2/files/text/" + path,
				method: "GET",
			})
			return res.text;
		},

		async requestFaceplate_menu() {
			let url = `v3/menu/faceplate`
			let res = await request.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},

		async requestFaceplateStatistic_menu() {
			let url = `v3/menu/faceplate-statistic`
			let res = await request.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},

		async requestBlocks() {
			let url = `v3/menu/blocks`
			let res = await request.request({
				url: url,
				method: "GET",
			})
			return res;
		},

		async logout() {
			request.request({
				url: 'v3/auth/token',
				method: 'DELETE'
			}).then((res) => {
				window.location.hash = "#/login";
			})
		},
		async login1(username, password) {
			let res = await request.request({
				url: 'v3/auth/token',
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
			let res = await request.request({
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
			let res = await request.request({
				url: 'v3/auth/kaptcha',
				method: "POST"
			})
			if (res.status === 'suc') {
				return res
			} else {
				return null;
			}
		},

		async getVerifyCode(verfyToken) {
			let res = await request.request({
				url: 'v3/auth/verify/code',
				data: {
					verfyToken
				},
				method: "GET"
			})

			return res;
		},

		async verify(verfyToken, verfyCode) {
			let res = await request.request({
				url: 'v3/auth/verify/token',
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
			let res = await request.request({
				url: 'v3/user/current-user',
			});
			let result = {};
			result.userName = res.user.username;
			result.id = res.user.id;
			return result;

		},

		async requestMessagebar_menu() {
			let url = `v3/menu/messagebar`
			let res = await request.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},

		async requestSimpleCharts_menu() {
			let url = `v3/menu/simple-charts`
			let res = await request.request({
				url: url,
				method: "GET",
			})
			return res.l2Menus;
		},
		async requestSimpleChartsEntities_menu(menuId) {
			let url = `v3/menu/${menuId}/ltmpl/top_thousand_entities`
			let res = await request.request({
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
			let res = await request.request({
				url: 'v3/auth/ras-pubkey',
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
