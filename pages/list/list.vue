<template>
	<view>
		<view v-if="dataList.length>0" class='list-content'>
			<view v-for="(items,index1) in dataList">
				<uni-card isShadow>
					<text>{{(pageInfo.pageSize * (pageInfo.pageNo-1))+index1+1}}</text>
					<!-- < :dataItem="items"></item-list-view> -->
					<item-list-view :dataItem="items" ></item-list-view>
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
		<empty name='empty' v-else></empty>
		<view class='list-tabbar'>
			<view v-if="totalCount==null">
				<text class="mini-button-iconfont">&#xe679;</text>
				<text class="show-more-button"
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
			<view class='button-only-tabbar'>
			<uni-row>
				<uni-col :span="12">
					<view class="button uni-btn-v ">
						<button type="primary" plain="true" :disabled="!operates.queryBtn" @click.stop="clickToSelect()">
							<text class="normal-button-iconfont">&#xe67d;</text>
							<text >筛 选</text>
							</button>
					</view>
				</uni-col>
				<uni-col :span="12">
						<view class="button uni-btn-v">
							<button type="primary" plain="true" :disabled="!operates.createBtn" @click.stop="clickToEdit()">添 加</button>
						</view>
				</uni-col>
			</uni-row>
			</view>
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
	//import itemListView from '@/components/item-list-view/item-list-view.vue'
	import server from '@/components/server/server-v3.vue';
	import dataTransUtils from '@/components/server/data-trans-utils.vue';
	export default {
		data() {
			return {
				popupMessageType: 'info',
				popupMessageText: "默认消息",
				buttonRect: {},
				deletingEntityCode: null,
				totalCount: null,
				queryInfo: {},
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
			let ltmpl_config = await server.getLtmplConfig(options);
			let query_info = await server.getLtmplQuery({
				...options,
				condition: this.condition,
			});
			console.log("ltmpl_config", ltmpl_config);
			console.log("query_info", query_info);
			await this.initData(ltmpl_config, query_info, this.pageInfo);
			this.queryInfo = query_info;
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
			async initData(ltmplConfig, queryInfo, pageInfo) {
				if (!ltmplConfig) {
					ltmplConfig = this.ltmplConfig;
				}
				if (!queryInfo) {
					queryInfo = this.queryInfo;
				}
				if (!pageInfo) {
					pageInfo = this.pageInfo;
				}
				let query_list = await this.queryList(queryInfo.queryKey, pageInfo);
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
					ltmplConfig.ltmpl.columns.forEach((col, index) => {
						let value = dataTransUtils.getDetailValue(item[col.id],col.controlType);
						if (col && col.title != '操作' && col.title != '序号') {
							dataItem.items.push({
								title: col.title,
								optionView: col.controlType,
								value,
							});
						}
					});
				});

				const {buttons,actions,ractions}=ltmplConfig.ltmpl;
				if (!buttons.includes('delete')) {
					operates_.deleteBtn = false;
				}
				if (!buttons.includes('dtmplAdd')) {
					operates_.createBtn = false;
				}
				if (!buttons.includes('query')) {
					operates_.queryBtn = false;
				}
				if (buttons.includes("detail")) {
					operates_.detailBtn = true;
				} 
				if (buttons.includes("dtmplEdit")) {
					operates_.editBtn = true;
				}
				for (let act of actions) {
						let action = {};
						action.id = act.id;
						action.title = act.title;
						operates_.actions.push(action);
				}
				for (let ract of ractions) {
						let raction = {};
						raction.id = ract.id;
						raction.title = ract.title;
						operates_.ractions.push(raction);
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
					// title: '操 作',
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
							
							if(result.status=="success"){
								this.popupMessageType = 'success'
								this.popupMessageText = `执行成功！`
							}else{
								this.popupMessageType = 'error';
								this.popupMessageText = result.message;
							}
							this.$refs.message.open();
							
							await that.reLoad();
						}else{ 
							let ratmplId= that.operates.ractions[e.tapIndex-that.operates.actions.length].id;
							// uni.showToast({
							// 	title: '点击了关系操作',
							// 	icon: 'none'
							// });
							let menuId = this.menuId;
							let url;
							url = `../list/list?sourceName=ratmpl&sourceId=${ratmplId}&leftCode=${that.actioningEntityCode}`;
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
					}
				})
			},
			async reLoad() {
				uni.showLoading({
					title: "数据加载中..."
				});
				console.log("reload:", this.options);
				this.pageInfo.pageNo = 1;
				let query_info = await server.getLtmplQuery({
				...this.options,
				condition: this.condition,
			});
				this.initData(this.ltmplConfig, query_info, this.pageInfo);
				this.queryInfo = query_info;
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
					url: `../detail/detail?sourceName=${this.options.sourceName}&entityCode=${entityCode}&sourceId=${this.options.sourceId}&leftCode=${this.options.leftCode}`,
				})
			},
			async clickToEdit(entityCode) {
				let menuId = this.menuId;
				let url;
				//if (entityCode) { //编辑 或 添加
				url = `../edit/edit?sourceName=${this.options.sourceName}&entityCode=${entityCode}&sourceId=${this.options.sourceId}&leftCode=${this.options.leftCode}`;
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
				if (status == "success") {
					let query_info = await server.getLtmplQuery(this.options);
					this.initData(null, query_info);
					this.queryInfo = query_info;
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
			async clickShowMore() {
				this.totalCount = await server.requestTotalCount(this.queryInfo.queryKey);
			},
			async changePage(options) {
				this.pageInfo.pageNo = options.current;
				await this.initData(this.ltmplConfig, this.queryInfo, this.pageInfo);
			},
			clickToSelect() {
				let url = `../criteria/criteria?sourceName=${this.options.sourceName}&sourceId=${this.options.sourceId}`;
				let criteriaValueMap = this.queryInfo.criteriaValueMap;
				let criteriaStr = "&";
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
