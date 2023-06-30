import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
//Vue.prototype.serverUrl="http://121.196.184.205:208/hydrogen/"
//Vue.prototype.serverUrl="http://localhost:8383/hydrogen/"
Vue.prototype.serverUrl="/"
//Vue.prototype.serverUrl="https://121.196.184.205:107/hydrogen/"
//Vue.prototype.serverUrl="http://121.196.184.205:203/hydrogen/"
// 索发
//Vue.prototype.serverUrl="http://222.174.44.38:90/hydrogen/"
// 齐力
//Vue.prototype.serverUrl="http://219.146.165.26:90/hydrogen/"
//创新
//Vue.prototype.serverUrl="http://112.6.41.8:90/hydrogen/"
//Vue.prototype.serverUrl="https://192.168.10.33/hydrogen/"
App.mpType = 'app' 

const app = new Vue({
    ...App
})
app.$mount()


