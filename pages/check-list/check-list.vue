<template>
	<view>
		<view v-if="dataList.length>0" class='list-content'>
			<checkbox-group v-if='options.maxDataCount>1'  @change="checkboxChange">
				<uni-card v-for="(items,index1) in dataList" :key="items.code" isShadow>
					<checkbox :value="items.code" :checked="items.checked" />
					<text>{{(pageInfo.pageSize * (pageInfo.pageNo-1))+index1+1}}</text>
					<ItemListView :dataItem="items"></ItemListView>
				</uni-card>
			</checkbox-group>
			<radio-group v-else @change="radioChange">
				<uni-card v-for="(items,index1) in dataList" :key="items.code" isShadow>
					<radio :value="items.code" :checked="items.checked" />
					<text>{{(pageInfo.pageSize * (pageInfo.pageNo-1))+index1+1}}</text>
					<ItemListView :dataItem="items"></ItemListView>
				</uni-card>
			</radio-group>
		</view>
		<Empty v-else></Empty>
		<view class='list-tabbar'>
			<view v-if="totalCount==null">
				<text style="line-height:30px;font-size: 14px;padding-left: 5px;" @click="clickShowMore">点击查看更多</text>
			</view>
			<view v-else>
				<!-- 底部导航 -->
				<uni-row class="demo-uni-row" :gutter=5>
					<uni-col :span="6">
						<text
							style="line-height:30px;font-size: 13px;padding-left: 5px;text-align: center;">共{{totalCount}}条</text>
					</uni-col>
					<uni-col :span="18">
						<uni-pagination :pageSize="pageInfo.pageSize" :current="pageInfo.pageNo" :total="totalCount"
							@change="changePage" />
					</uni-col>
				</uni-row>
			</view>
			<uni-row class="demo-uni-row">
				<uni-col :span="12">
					<button class="button" @click.stop="clickToSelect">筛 选</button>
				</uni-col>
				<uni-col :span="12">
					<view class="button uni-padding-wrap ">
						<view class="uni-btn-v">
							<button @click.stop="clickToSelected()">确 定</button>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
	</view>
</template>

<script>
	import server from '@/components/server/server-v3.vue';
	export default {
		data() {
			return {
				buttonRect: {},
				// menuId: "",
				totalCount: null,
				queryKey: {},
				dataList: {},
				// colMap:{},
				pageInfo: {
					pageNo: 1,
					pageSize: 10,
				},
				options: {},
				condition:null,
				stmplConfig: {},
				needReload: false,
				options: {},
				selectedCodes: null,
			}
		},
		async onLoad(options) {
			console.log("checkList参数:", options);
			this.options = options;
			let stmpl_config = await server.getStmplConfig(options);
			console.log("checkList stmpl_config:", stmpl_config);
			let query_key = await server.getGroupLtmplQueryKey({...options,condition:this.condition});
			console.log("checkList query_key:", query_key);
			await this.initData(stmpl_config, query_key.queryKey, this.pageInfo);
			this.queryKey = query_key;
			this.stmplConfig = stmpl_config;
		},
		async onShow() {
			if (!this.needReload) {
				return;
			}
			console.log("reload:", this.options);
			this.pageInfo.pageNo = 1;
			let query_key = await server.getGroupLtmplQueryKey({...this.options,condition:this.condition});
			this.initData(this.stmplConfig, query_key.queryKey, this.pageInfo);
			this.queryKey = query_key;
			this.totalCount = null;
			this.needReload = false;
		},
		methods: {
			async initData(stmplConfig, queryKey, pageInfo) {
				let query_list = await this.queryList(queryKey, pageInfo);
				console.log("checkList query_list:", query_list);

				let data_list = [];
				query_list.list.forEach((item, index) => {
					let dataItem = {
						items: []
					};
					data_list.push(dataItem);
					dataItem.code = item.code;
					dataItem.checked = false;
					stmplConfig.config.ltmpl.columns.forEach((col, index) => {
						if (col && col.title != '操作' && col.title != '序号') {
							dataItem.items.push({
								title: col.title,
								viewOption: col.viewOption,
								value: item[col.id],
							});
						}
					});
				});
				this.dataList = data_list;
				this.selectedCodes = null;
				console.log(this.dataList);

			},
			async queryList(queryKey, pageInfo) {
				let statePageInfo = this.pageInfo
				if (pageInfo) {
					statePageInfo = pageInfo
				}
				let res = await server.requestQueryEntities(queryKey, statePageInfo);
				// Storage[`queryKey`] = res
				// const {isSeeTotal} = this.state
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
			async clickShowMore() {
				//查询总量
				this.totalCount = await server.requestTotalCount(this.queryKey.queryKey);
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
			checkboxChange: function(e) {
				console.log(e.detail);
				if(e.detail.value.length<=0){
					this.selectedCodes=null;
				}else{
					this.selectedCodes=e.detail.value;
				}
			},
			radioChange: function(e) {
				console.log(e.detail);
				if(e.detail.value.length<=0){
					this.selectedCodes=null;
				}else{
					this.selectedCodes=[e.detail.value];
				}
			},
			clickToSelected() {
				if (!this.selectedCodes) {
					uni.showToast({
						title: "请选择一条数据！",
						icon: 'none'
					})
				}else{
					//给上一页赋值并返回
					let pages = getCurrentPages(); //获取所有页面栈实例列表
					let prevPage = pages[pages.length - 2]; //上一页页面实例
					prevPage.$vm.newGroupSelected={
						...this.options,
						selectedCodes:this.selectedCodes,
					};
					uni.navigateBack({
						delta:1,
					})
				}
			},
			async clickShowMore() {
				this.totalCount = await server.requestTotalCount(this.queryKey.queryKey);
			},
			async changePage(options) {
				this.pageInfo.pageNo = options.current;
				await this.initData(this.stmplConfig, this.queryKey.queryKey, this.pageInfo);
			},
			clickToSelect() {
				let url = `../criteria/criteria?key=${this.stmplConfig.key}`;
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
	/* 	@import url("list.css"); */
	.uni-list-cell {
		justify-content: flex-start
	}
	.slot-title-text {
		flex: 1;
		font-size: 15px;
		color: #666666;
		word-break: break-all;
		/* padding-bottom: 6px; */
	}
	.slot-text {
		flex: 1;
		font-size: 16px;
		color: #000000;
		margin-right: 10px;
		word-break: break-all;
	}
</style>
