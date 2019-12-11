<template>
  <div>
    <div id="tool-row">
      <div>
        <el-select placeholder="省份" style="width: 150px" v-model="province" @change="loadCity" >
<el-option
            v-for="item in provinces"
            :key="item.code"
            :label="item.name"
            :value="item.code"

          ></el-option>
        </el-select>
        <el-select placeholder="市" style="width: 150px" v-model="city" @change="loadArea">
          <el-option v-for="item in cities" :key="item.code" :label="item.name" :value="item.code"></el-option>
        </el-select>
        <el-select placeholder="县" style="width: 150px" v-model="area">
          <el-option v-for="item in areas" :key="item.code" :label="item.name" :value="item.code"></el-option>
        </el-select>
        <el-date-picker
          v-model="startDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="起始日期"

        ></el-date-picker>
        <el-date-picker v-model="endDate" type="date" value-format="yyyy-MM-dd" placeholder="终止日期"
        ></el-date-picker>
        <el-button type="primary" @click="query()">搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="download()">下载</el-button>
      </div>
    </div>
    <div style="padding-top:5px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="每日天气" name="first">
          <el-table border :data="list" style="width: 100%" height="600">
            <el-table-column prop="tempMean" label="平均温度  ℃"></el-table-column>
            <el-table-column prop="tempMin" label="最低温  ℃"></el-table-column>
            <el-table-column prop="tempMax" label="最高温  ℃"></el-table-column>
            <el-table-column prop="hum" label="相对湿度 %"></el-table-column>
            <el-table-column prop="date" label="日期"></el-table-column>
          </el-table>
          <div class="block">
            <el-pagination
              background
              @current-change="handleCurrentPageChanged"
              :current-page.sync="page"
              :page-size="10"
              layout="total, prev, pager, next"
              :total="total"
            ></el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="逐小时天气" name="second">
          <el-table border :data="hourlyList" style="width: 100%" height="600">
            <el-table-column prop="tmp" label="温度  ℃"></el-table-column>
            <el-table-column prop="fl" label="体感温度  ℃"></el-table-column>
            <el-table-column prop="hum" label="湿度 %"></el-table-column>
            <el-table-column prop="condTxt" label="天气"></el-table-column>
            <el-table-column prop="pcpn" label="降水量 mm"></el-table-column>
            <el-table-column prop="pres" label="大气压 KPa"></el-table-column>
            <el-table-column prop="vis" label="能见度 km"></el-table-column>
            <el-table-column prop="windDeg" label="风向角度 ° "></el-table-column>
            <el-table-column prop="windDir" label="风向"></el-table-column>            
            <el-table-column prop="windSc" label="风力 级"></el-table-column>
            <el-table-column prop="windSpd" label="风速 m/s"></el-table-column>
            <el-table-column prop="date" label="日期"></el-table-column>
          </el-table>
          <div class="block">
            <el-pagination
              background
              @current-change="handleHourlyWeatherCurrentPageChanged"
              :current-page.sync="hourlyPage"
              :page-size="10"
              layout="total, prev, pager, next"
              :total="hourlyTotal"
            ></el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="每月天气" name="third">
                  <el-table border :data="monthlyList" style="width: 100%" height="600">
                    <el-table-column prop="tempMean" label="平均温度  ℃"></el-table-column>
                    <el-table-column prop="tempMin" label="最低温  ℃"></el-table-column>
                    <el-table-column prop="tempMax" label="最高温  ℃"></el-table-column>
                    <el-table-column prop="hum" label="相对湿度 %"></el-table-column>
                    <el-table-column prop="date" label="月份"></el-table-column>
                  </el-table>
                  <div class="block">
                    <el-pagination
                                  background
                                  @current-change="handleMonthlyWeatherCurrentPageChanged"
                                  :current-page.sync="monthlyPage"
                                  :page-size="10"
                                  layout="total, prev, pager, next"
                                  :total="monthlyTotal"
                                ></el-pagination>
                  </div>
                </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import http from "../../utils/http";
export default {
  data() {
    return {
      activeTab: 'first',
      startDate: "",
      endDate: "",
      list: [],
      page: 1,
      total: 0,
      provinces: [],
      cities: [],
      areas: [],
      province: "",
      city: "",
      area: "",
      hourlyList: [],
      monthlyList: [],
      monthReceList:[],
      hourlyPage: 1,
      monthlyPage: 1,
      hourlyTotal: 0,
      monthlyTotal: 0
    };
  },
  methods: {
    download() {
      if (this.activeTab == 'first') {
        window.location =
            http.getBaseUrl() +
            "/weather/export?adcode=" +
            this.area +
            "&lo=" +
            this.startDate +
            "&hi=" +
            this.endDate +
            "&token=" +
            sessionStorage["token"];
      } else if (this.activeTab == 'second') {
        window.location =
            http.getBaseUrl() +
            "/weather/export/hourly?adcode=" +
            this.area +
            "&lo=" +
            this.startDate +
            "&hi=" +
            this.endDate +
            "&token=" +
            sessionStorage["token"];
      }
      else if (this.activeTab == 'third') {
              window.location =
                  http.getBaseUrl() +
                  "/weather/export/monthly?adcode=" +
                  this.area +
                  "&lo=" +
                  this.startDate +
                  "&hi=" +
                  this.endDate +
                  "&token=" +
                  sessionStorage["token"];
            }
    },
    query() {
      if (this.activeTab == 'first') {
        this.loadWeatherInfo();
      } else if (this.activeTab == 'second') {
        this.loadHourlyWeaherInfo();
      }else if (this.activeTab == 'third') {
               this.loadMonthlyWeaherInfo();
             }
    },
    handleCurrentPageChanged(val) {
      this.page = val;
      this.loadWeatherInfo();
    },
    handleHourlyWeatherCurrentPageChanged(val) {
      alert();
      this.hourlyPage = val;
      this.loadHourlyWeaherInfo();
    },
    handleMonthlyWeatherCurrentPageChanged(val) {
          alert();
          this.monthlyPage = val;
          this.loadMonthlyWeaherInfo();
        },
    loadProvince() {
      http.requestWithToken(
        "/auth_api/dist/provinces",
        "get",
        {},
        res => {
          console.log(res.data);
          this.provinces = res.data;
          this.province = "";
          this.city = "";
          this.area = "";
          this.cities = [];
          this.areas = [];
          // this.userInfoDialog.form.area = ''
        },
        () => {}
      );
    },
    loadCity() {
      http.requestWithToken(
        "/auth_api/dist/cities",
        "get",
        { id: this.province },
        res => {
          this.cities = res.data;
          this.city = "";
          this.area = "";
          this.areas = [];

        },
        () => {}
      );
    },
    loadArea() {
      http.requestWithToken(
        "/auth_api/dist/areas",
        "get",
        { id: this.city },
        res => {
          this.area = "";
          this.areas = res.data;
        },
        () => {}
      );
    },
    loadWeatherInfo() {
      http.requestWithToken(
        "/weather/list",
        "get",
        {
          adcode: this.area,
          lo: this.startDate,
          hi: this.endDate,
          page: this.page,
          limit: 10
        },
        res => {
        if(res.data.data.totalNum>0){
          (this.list = res.data.data.data),
            (this.total = res.data.data.totalNum);
            }else{
                  this.list=[];
            }
        },
        () => {}
      );
    },
    loadHourlyWeaherInfo() {
      http.requestWithToken("/weather/hourly/list", "get", {
        adcode: this.area,
        lo: this.startDate,
        hi: this.endDate,
        page: this.hourlyPage,
        limit: 10
      },
      res => {


          this.hourlyTotal = res.data.data.totalNum;
          if(this.hourlyTotal>0){
              this.hourlyList = res.data.data.data;
          }else{
                this.hourlyList=[];
          }
      },
      () => {});
    },
    loadMonthlyWeaherInfo() {
          http.requestWithToken("/weather/monthly/list", "get", {
            adcode: this.area,
            lo: this.startDate,
            hi: this.endDate,
            page: this.monthlyPage,
            limit: 1000
          },
          res => {

              this.monthlyTotal = res.data.data.totalNum;

              if(this.monthlyTotal>0){
                  this.monthReceList = res.data.data.data;

                  for (let i = 0; i < this.monthReceList.length; ++i) {
                        this.monthReceList[i].date='';
                        this.monthReceList[i].date=this.monthReceList[i].year+'年'+this.monthReceList[i].month+'月';

                  }
                                    this.monthlyList=this.monthReceList;

                  }else{
                          this.monthlyList  =[];
                  }

          },
          () => {});
        }
  },
  mounted() {
    this.loadProvince();
  }
};
</script>
<style>
#tool-row {
  display: flex;
  justify-content: space-between;
}
</style>


