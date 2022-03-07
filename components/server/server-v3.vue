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
		findUnloadEnumMstrucIdOfFields(fields) {
			let enumMap = uni.getStorageSync('enumMap');
		    const mstrucIds = [];
		    if (fields) {
		        fields.forEach((item) => {
		            if (item.controlType == "select" || item.controlType == "multiselect" || item.controlType ==
						"preselect" || item.controlType == "steps") {
		                if(!enumMap[item.mstrucId]){
		                    mstrucIds.push(item.mstrucId);
		                }
		            }
		        });
		    }
		    return mstrucIds;
		},
		async loadEnumOfDtmplConfig(selectConfig){
		    const mstrucIds = [];
		    if(selectConfig.groups){
		        selectConfig.groups.forEach(group=>{
		            let subs= this.findUnloadEnumMstrucIdOfFields(group.fields);
		            this.concat(mstrucIds,subs);
		        })
		    }
		    await this.loadEnum(mstrucIds);
		},
		async loadEnumOfSelectConfig(selectConfig){
		    const mstrucIds = [];
		   let subs= this.findUnloadEnumMstrucIdOfFields(selectConfig.columns);
		    this.concat(mstrucIds,subs);
		    subs= this.findUnloadEnumMstrucIdOfFields(selectConfig.criterias);
		    this.concat(mstrucIds,subs);
		    await this.loadEnum(mstrucIds);
		},
		concat(mstrucIds,sub){
		    if(sub){
		        sub.forEach((id)=>{
		            if(!mstrucIds.includes(id)){
		                mstrucIds.push(id);
		            }
		        })
		    }
		    return mstrucIds;
		},
		getEnum(mstrucId) {
			let enumMap = uni.getStorageSync('enumMap');
			if(!enumMap){
				enumMap={};
				uni.setStorageSync('enumMap',enumMap)
			}
			return enumMap[mstrucId];
		},
		async putEnums(enumMap_) {
			if(enumMap_){
				let enumMap = uni.getStorageSync('enumMap');
				if(!enumMap){
					enumMap={};	
				} 
				uni.setStorageSync('enumMap',{...enumMap_,...enumMap});
			}
		},
		async loadEnum(mstrucIds) {
			let enumMap = {};
			if (mstrucIds && mstrucIds.length > 0) {
				let res = await request.request({
					url: `v3/field/enum`,
					data: {
						mstrucIds
					},
				});
				console.log('res.enumMap ：', res.enumMap);
				
				for (let key in res.enumMap) {
					let enums=res.enumMap[key];
					enumMap[key]=[];
					for (let e of enums){
						enumMap[key].push({...e,text:e.title});
					}
				}
				console.log('枚举：', enumMap);
				this.putEnums(enumMap);
			}
			
			return enumMap;
		},
		async getDtmplConfig(options) {
			return await this.requestDtmplConfig(options.sourceName,options.sourceId);
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
		async requestDtmplConfig(sourceName,sourceId, type) {
			let configs = uni.getStorageSync('dtmplConfig');
			if(!configs){
				configs={};
			}
			let config=configs[sourceId];
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
				await this.loadEnumOfSelectConfig(res.dtmplConfig);
				configs[sourceId]=config;
				uni.setStorageSync('dtmplConfig',configs);
			}
			return config;
		},
		async getStmplConfig(sourceName,sourceId) {
			let configs = uni.getStorageSync('stmplConfig');
			if(!configs){
				configs={};
				//uni.setStorageSync('stmplConfig',configs);
			}
			let config=configs[sourceId];
			if(!config){
				config=await this.requestStmplConfig(sourceName,sourceId);
				configs[sourceId]=config;
				uni.setStorageSync('stmplConfig',configs);
			}
			return config;
		},
		async requestStmplConfig(sourceName,sourceId) {
			let url = `/v3/${sourceName}/select/config`;
			let res = await request.request({
				url,
				method: "GET",
				data:{sourceId}
			})
			let config = {};
			if (res.selectConfig) {
				let ltmpl = {}
				config.ltmpl = res.selectConfig;
				await this.loadEnumOfSelectConfig(res.selectConfig);
			}
			return {...config};
		},
		async requestLtmplConfig(sourceName,sourceId) {
			let configs = uni.getStorageSync('ltmplConfig');
			if(!configs){
				configs={};
				// uni.setStorageSync('ltmplConfig',configs);
			}
			let config=configs[sourceId];
			if(!config){
				let url = `/v3/${sourceName}/ltmpl/config`;
				let res = await request.request({
					url,
					data:{sourceId},
					method: "GET",
				})
				config = {};
				let ltmpl=res.ltmplConfig;
				config.ltmpl = ltmpl;
				await this.loadEnumOfSelectConfig(res.ltmplConfig);
				configs[sourceId]=config;
				uni.setStorageSync('ltmplConfig',configs);
			}
			return config;
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
			return this.postDtmplData(dtmplConfig.sourceName,dtmplConfig.sourceId,options
						.formData);
		},

		async postDtmplData(sourceName,sourceId,formData) {
			formData['%sourceId%']=sourceId;
			let url = `/v3/${sourceName}/dtmpl/data`;
			let res = await request.request({
				url: url,
				data: formData,
				method: 'POST'
			}, 'formdata')
			let code = null;
			if (res) {
				if (res.status == "success") {
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
		// async getDtmplEntity(dtmplConfig, entityCode, versionId) {	
		// 	return this.requestDtmplData(dtmplConfig.sourceName,dtmplConfig.sourceId,entityCode, versionId);
		// },
		async getUserDtmplEntity() {
			let url = `v3/user/dtmpl/data`;
			let res = await request.request({
				url: url,
				method: 'GET'
			})
			if (res.status === "success") {
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
			if (res.status === "success") {
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
			if (res.status === "success") {
				return res.entities;
			} else {
				message.error("实体不存在！")
				return null;
			}
		},
		async getGroupLtmplQuery(options) {
			let queryInfo;
			let exceptCodes = options.exceptCodes;
			let condition = options.condition;
			queryInfo = await this.requestLtmplQuery(options.sourceName, options.sourceId, {
				exceptCodes,
				...condition,
			}); 
			return queryInfo;
		},
		async getLtmplQuery(options) {
			let queryInfo=await this.requestLtmplQuery(options.sourceName,options.sourceId, options.condition);
			return queryInfo;
		},

		async requestLtmplQuery(souceName,sourceId, condition) {
			let url = `v3/${souceName}/ltmpl/query/key`
			let res = await request.request({
				url,
				method: 'GET',
				data:{...condition,sourceId }
			})
			let queryInfo = {};
			queryInfo.criteriaValueMap = res.criteriaValueMap;
			queryInfo.queryKey = res.key;
			queryInfo.drillingColIds = res.drillingColIds;
			return queryInfo;
		},
		async requestLtmplCount_menu(sourceId) {
			let url = `v3/menu/ltmpl/data/count`;
			let res = await request.request({
				url: url,
				method: 'GET',
				data:{sourceId}
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
			if (res.status === "success") {
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
			if (res.status === "success") {
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
			if (res.status === "success") {
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
