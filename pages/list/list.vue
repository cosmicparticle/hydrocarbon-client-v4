<template>
	<view>
		<view v-if="dataList.length>0" class='list-content'>
			<view v-for="(items,index1) in dataList">
				<uni-card isShadow>
					<text>{{(pageInfo.pageSize * (pageInfo.pageNo-1))+index1+1}}</text>
					<ItemListView :dataItem="items"></ItemListView>
					<view class="list-footer-box">
						<button v-if="operates.detailBtn" size="mini" @click.stop="clickToDetail(items.code)">
							<text class="mini-button-iconfont">&#xe63b;</text>
							<text class="footer-box__item">详情</text></button>
						<button v-if="operates.editBtn" size="mini" @click.stop="clickToEdit(items.code)">
							<text class="mini-button-iconfont">&#xe66f;</text>
							<text class="footer-box__item">编辑</text></button>
						<button v-if="operates.deleteBtn" size="mini" @click.stop="clickToDelete(items.code)">
							<text class="mini-button-iconfont">&#xe666;</text>
							<text class="footer-box__item">删除</text>
						</button>
						<button :disabled="operates.actions.length==0" size="mini" @tap="actionSheetTap(items.code)">
							<text class="mini-button-iconfont">&#xe679;</text>
							<text class="footer-box__item">更多</text>
						</button>
					</view>
				</uni-card>
			</view>
		</view>
		<Empty v-else></Empty>
		<view class='list-tabbar'>
			<view v-if="totalCount==null">
				<text class="mini-button-iconfont">&#xe679;</text>
				<text style="line-height:35px;font-size: 16px;padding-left: 5px;color: #007AFF;"
					@click="clickShowMore">点击查看更多</text>
			</view>
			<!-- 底部导航 -->
			<uni-row v-else :gutter=5>
				<uni-col :span="6">
					<text
						style="line-height:30px;font-size: 13px;padding-left: 5px;text-align: center;">共{{totalCount}}条</text>
				</uni-col>
				<uni-col :span="18">
					<uni-pagination :pageSize="pageInfo.pageSize" :current="pageInfo.pageNo" :total="totalCount"
						@change="changePage" />
				</uni-col>
			</uni-row>
			<uni-row>
				<uni-col :span="12">
					<view class="button">
						<button :disabled="!operates.queryBtn" @click.stop="clickToSelect()">筛 选</button>
					</view>
				</uni-col>
				<uni-col :span="12">
					<view class="button uni-padding-wrap ">
						<view class="uni-btn-v">
							<button :disabled="!operates.createBtn" @click.stop="clickToEdit()">添 加</button>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		<view>
			<!-- 提示信息弹窗 -->
			<uni-popup ref="message" type="message">
				<uni-popup-message :type="popupMessageType" :message="popupMessageText" :duration="2000">
				</uni-popup-message>
			</uni-popup>
		</view>
		<view>
			<!-- 提示窗示例 -->
			<uni-popup ref="deleteAlertDialog" type="dialog">
				<uni-popup-dialog type="warn" title="删除提示" content="您确定删除这条数据吗？" @close="deleteCancel"
					@confirm="deleteConfirm"></uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import server from '@/components/server/server-v3.vue';
	import dataTransUtils from '@/components/server/data-trans-utils.vue';
	export default {
		data() {
			return {
				popupMessageType: 'info',
				popupMessageText: "默认消息",
				buttonRect: {},
				menuId: "",
				deletingEntityCode: null,
				totalCount: null,
				queryKey: {},
				editedData:{},
				ltmplConfig: {},
				dataList: {},
				options: {},
				conditon: null,
				operates: {},
				actioningEntityCode: null,
				pageInfo: {
					pageNo: 1,
					pageSize: 10,
				},
			}
		},
		// props:["menuId"],
		async onLoad(options) {
			console.log("list onLoad options",options);
			this.menuId = options.menuId;
			let ltmpl_config = await server.getLtmplConfig(options);
			let query_key = await server.getLtmplQueryKey({
				...options,
				condition: this.condition,
			});
			console.log("ltmpl_config", ltmpl_config);
			console.log("query_key", query_key);
			await this.initData(ltmpl_config, query_key, this.pageInfo);
			this.queryKey = query_key;
			this.ltmplConfig = ltmpl_config;
			this.options = options;
		},
		async onShow(){
			if (!this.needReload && !this.editedData.status) {
				return;
			}else{
				this.needReload=false;
				this.editedData={};
			}
			await this.reLoad();
		},
		methods: {
			//用加载列表数据
			async initData(ltmplConfig, queryKey, pageInfo) {
				if (!ltmplConfig) {
					ltmplConfig = this.ltmplConfig;
				}
				if (!queryKey) {
					queryKey = this.queryKey;
				}
				if (!pageInfo) {
					pageInfo = this.pageInfo;
				}
				let query_list = await this.queryList(queryKey.queryKey, pageInfo);
				console.log(query_list);
				let data_list = [];
				//设置operates
				let operates_ = {
					deleteBtn: true,
					queryBtn: true,
					createBtn: true,
					detailBtn: false,
					editBtn: false,
					actions: [],
					ractions:[],
				};
				query_list.list.forEach((item, index) => {
					let dataItem = {
						items: []
					};
					data_list.push(dataItem);
					dataItem.code = item.code;
					ltmplConfig.config.ltmpl.columns.forEach((col, index) => {
						let value = dataTransUtils.getDetailValue(item[col.id],col.viewOption);
						if (col && col.title != '操作' && col.title != '序号') {
							dataItem.items.push({
								title: col.title,
								optionView: col.viewOption,
								value,
							});
						}
					});
				});

				let tmplGroup_cs = ltmplConfig.config.tmplGroup;
				if (tmplGroup_cs.hideDeleteButton == 1) {
					operates_.deleteBtn = false;
				}
				if (tmplGroup_cs.hideCreateButton == 1) {
					operates_.createBtn = false;
				}
				if (tmplGroup_cs.hideQueryButton == 1) {
					operates_.queryBtn = false;
				}
				for (let act of tmplGroup_cs.actions) {
					if (act.face.indexOf("list") >= 0) {
						let action = {};
						action.id = act.id;
						action.title = act.title;
						operates_.actions.push(action);
					}
				}
				for (let ract of tmplGroup_cs.ractions) {
					if (ract.face.indexOf("list") >= 0) {
						let raction = {};
						raction.id = ract.id;
						raction.title = ract.title;
						raction.ratmplId=ract.ratmplId;
						operates_.ractions.push(raction);
					}
				}
				let opt_cs = ltmplConfig.config.ltmpl.operates;
				for (const opt of opt_cs) {
					if (opt == "detail") {
						operates_.detailBtn = true;
					} else if (opt == "update") {
						operates_.editBtn = true;
					}
				}
				// this.colMap = col_map;
				this.operates = operates_;
				this.dataList = data_list;
				console.log(this.dataList);
			},
			async queryList(queryKey, pageInfo) {
				let statePageInfo = this.pageInfo
				if (pageInfo) {
					statePageInfo = pageInfo
				}
				let res = await server.requestQueryEntities(queryKey, statePageInfo);
				const dataSource = []
				res.entities.forEach((item, index) => {
					item.fieldMap.key = index
					item.fieldMap.code = item.code //增加code,为了删除操作
					dataSource.push(item.fieldMap)
				})
				const noSeeTotal = res.pageInfo.pageSize * res.pageInfo.virtualEndPageNo
				return {
					list: dataSource,
					pageInfo: res.pageInfo,
				}
			},
			async actionSheetTap(entityCode) {
				const that = this
				let itemList = [];
				for (let action of that.operates.actions) {
					itemList.push(action.title);
				}
				for (let raction of that.operates.ractions) {
					itemList.push(raction.title);
				}
				that.actioningEntityCode = entityCode;
				uni.showActionSheet({
					title: '操 作',
					itemList,
					popover: {
						top: that.buttonRect.top * 2 + that.buttonRect.height,
						left: that.buttonRect.left + that.buttonRect.width / 2
					},
					success: async (e) => {
						//console.log("点击了", that.operates.actions[e.tapIndex]);
						//先从action里面找 找不到再从raction里面找
						if(e.tapIndex<that.operates.actions.length){
							let result = await server.postActions({
								...that.options,
								selectCodes: that.actioningEntityCode,
								actionId: that.operates.actions[e.tapIndex].id,
							});
							
							if(result.status=='suc'){
								this.popupMessageType = 'success'
								this.popupMessageText = `执行成功！`
							}else{
								this.popupMessageType = 'error';
								this.popupMessageText = result.message;
							}
							this.$refs.message.open();
							
							await that.reLoad();
						}else{ 
							let ratmplId= that.operates.ractions[e.tapIndex-that.operates.actions.length].ratmplId;
							// uni.showToast({
							// 	title: '点击了关系操作',
							// 	icon: 'none'
							// });
							let menuId = this.menuId;
							let url;
							url = `../list/list?type=ratmpl&ratmplId=${ratmplId}&leftCode=${that.actioningEntityCode}`;
							uni.navigateTo({
								url,
							})
						}
						

					},
					fail: function(res) {
						console.log(res.errMsg);
					},
					complete: async () => {
						that.actioningEntityCode = null;


						// uni.showToast({
						// 	title: "重置了"+that.actioningEntityCode,
						// 	icon: "none"
						// })
					}
				})
			},
			async reLoad() {
				uni.showLoading({
					title: "数据加载中..."
				});
				console.log("reload:", this.options);
				this.pageInfo.pageNo = 1;
				let query_key = await server.getLtmplQueryKey({
				...this.options,
				condition: this.condition,
			});
				this.initData(this.ltmplConfig, query_key, this.pageInfo);
				this.queryKey = query_key;
				this.totalCount = null;
				uni.hideLoading();
			},
			async clickToDetail(entityCode) {
				// uni.showToast({
				// 	title: entityCode,
				// 	icon: 'none'
				// })
				let menuId = this.menuId;
				uni.navigateTo({
					url: `../detail/detail??type=${this.options.type}&entityCode=${entityCode}&menuId=${this.options.menuId}&ratmplId=${this.options.ratmplId}&leftCode=${this.options.leftCode}`,
				})
			},
			async clickToEdit(entityCode) {
				let menuId = this.menuId;
				let url;
				//if (entityCode) { //编辑 或 添加
				url = `../edit/edit?type=${this.options.type}&entityCode=${entityCode}&menuId=${this.options.menuId}&ratmplId=${this.options.ratmplId}&leftCode=${this.options.leftCode}`;
				uni.navigateTo({
					url,
				})
			},
			async clickToDelete(entityCode) {
				this.deletingEntityCode = entityCode;
				this.$refs.deleteAlertDialog.open()
			},
			async deleteConfirm() {
				this.$refs.deleteAlertDialog.close();
				console.log("删除的entityCode", this.deletingEntityCode);
				await this.doDelete(this.deletingEntityCode);
				this.deletingEntityCode = null;
			},
			deleteCancel() {
				this.deletingEntityCode = null;
			},
			async doDelete(entityCode) {
				let status = await server.deleteEntities({
					...this.options,codes:entityCode
				});
				if (status == 'suc') {
					let query_key = await server.getLtmplQueryKey(this.options);
					this.initData(null, query_key);
					this.queryKey = query_key;
					this.totalCount = null;

					this.popupMessageType = 'success'
					this.popupMessageText = `删除成功！`
					this.$refs.message.open();
				} else {
					this.popupMessageType = 'error'
					this.popupMessageText = `删除失败！`
					this.$refs.message.open()
				}
			},
			async footerClick(options) {
				uni.showToast({
					title: options,
					icon: 'none'
				})
				let menuId = this.menuId;
				let dtmplConfigKey = await server.requestDtmplConfig_menu(menuId);
				uni.navigateTo({
					url: `../editTest/editTest?entityCode=${options}&dtmplConfigKey=${dtmplConfigKey}`,
				})
			},
			async clickShowMore() {
				this.totalCount = await server.requestTotalCount(this.queryKey.queryKey);
			},
			async changePage(options) {
				//let toPageNo;
				// if(options.type=="prev"){
				// 	toPageNo=options.current-1;
				// }else{
				// 	toPageNo=options.current+1;
				// }
				this.pageInfo.pageNo = options.current;
				await this.initData(this.ltmplConfig, this.queryKey, this.pageInfo);
			},
			clickToSelect() {
				let url = `../criteria/criteria?key=${this.ltmplConfig.key}`;
				let criteriaValueMap = this.queryKey.criteriaValueMap;
				let criteriaStr = "";
				for (let key in criteriaValueMap) {
					if (criteriaValueMap[key]) {
						criteriaStr = criteriaStr + "&" + key + "=" + criteriaValueMap[key];
					}
				}
				url = url + criteriaStr;

				uni.navigateTo({
					url,
				})
			},
		}
	}
</script>

<style>
	@import url("list.css");

	

	
</style>
