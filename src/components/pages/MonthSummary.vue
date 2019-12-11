<template>
  <div>
    <!--el-select placeholder="省" v-if="this.$store.state.user.role == 1"></el-select-->

    <el-select
      placeholder="市"
      v-if="this.$store.state.user.role < 2 && showCity"
      v-model="city"
      @change="cityChanged"
    >
      <el-option value>全部</el-option>
      <el-option v-for="item in cities" :value="item.code" :key="item.code" :label="item.name"></el-option>
    </el-select>
    <el-select
      placeholder="县"
      v-if="this.$store.state.user.role < 3 && showArea"
      v-model="area"
      @change="areaChanged()"
    >
      <el-option value>全部</el-option>
      <el-option v-for="item in areas" :value="item.code" :key="item.code" :label="item.name"></el-option>
    </el-select>

    <el-date-picker v-model="startYear" type="date" value-format="yyyy-MM-dd" placeholder="起始日期"></el-date-picker>
    <el-date-picker v-model="endYear" type="date" value-format="yyyy-MM-dd" placeholder="终止日期"></el-date-picker>

    <el-button type="primary" @click="query()">查询</el-button>

    <el-card style="padding: 5px">
      <div style="width: 100%;height:300px;" ref="echartsArea"></div>
    </el-card>
  </div>
</template>
<script>
import http from "../../utils/http";
import echarts from "echarts";
export default {
  data() {
    return {
      showCity: true,
      showArea: true,
      provincesname: [],
      provincename: "",
      cityname: "",
      areaname: "",
      citiesname: [],
      areasname: [],
      provinces: [],
      province: "",
      provincename: "",
      cities: [],
      city: "",
      areas: [],
      area: "",
      towns: [],
      town: "",
      managers: [],
      manager: "",
      startDate: "",
      endDate: "",
      contentLabelDict: ["市", "县", "乡镇", "工人"],
      contentLabelIndex: 0,
      myarea: "",
      summaryList: [],
      analysisList: [],
      mcList: [],
      tabPage: "first",
      mcType: "0",
      startYear: "",
      endYear: ""
    };
  },
  methods: {
    init() {
      this.showCity = true;
      this.showArea = true;

      let role = this.$store.state.user.role;
      if (role == 1) {
        this.province = this.$store.state.user.adcode.substr(0, 2);
        this.loadCity();
      } else if (role == 2) {
        this.province = this.$store.state.user.adcode.substr(0, 2);
        this.city = this.$store.state.user.adcode.substr(0, 4);
        this.loadArea();
      } else if (role == 3) {
        this.province = this.$store.state.user.adcode.substr(0, 2);
        this.city = this.$store.state.user.adcode.substr(0, 4);
        this.area = this.$store.state.user.adcode;
        this.loadManagers();
      } else if (role == 4) {
        this.province = this.$store.state.user.adcode.substr(0, 2);
        this.city = this.$store.state.user.adcode.substr(0, 4);
        this.area = this.$store.state.user.adcode;
        this.manager = this.$store.state.user.username;
      }
    },

    query() {
      this.tabPage = "first";
      // 管理员只查看下级工人统计信息
      let role = this.$store.state.user.role;
      if (role == 4) {
        this.queryWorkerData();
      }
      if (role == 3) {
        if (this.manager == "") {
          this.queryTownData();
        } else {
          this.queryWorkerData();
        }
      }
      if (role == 2) {
        if (this.area == "" && this.manager == "") {
          this.queryAreaData();
        }
        if (this.area != "" && this.manager == "") {
          this.queryTownData();
        }
        if (this.area != "" && this.manager != "") {
          this.queryWorkerData();
        }
      }
      if (role == 1) {
        if (this.city == "") {
          this.queryCityData();
        }
        if (this.city != "" && this.area == "") {
          this.queryAreaData();
        }
        if (this.city != "" && this.area != "" && this.manager == "") {
          this.queryTownData();
        }
        if (this.city != "" && this.area != "" && this.manager != "") {
          this.queryWorkerData();
        }
      }
    },
    queryWorkerData() {
      this.contentLabelIndex = 3;

      if (this.$store.state.user.town != null) {
        this.provincename = this.$store.state.user.town;
      } else if (
        this.$store.state.user.town == null &&
        this.$store.state.user.area != null
      ) {
        this.provincename = this.$store.state.user.area;
      } else if (
        this.$store.state.user.area == null &&
        this.$store.state.user.city != null
      ) {
        this.provincename = this.$store.state.user.city;
      } else if (
        this.$store.state.user.city == null &&
        this.$store.state.user.province != null
      ) {
        this.provincename = this.$store.state.user.province;
      } else {
        this.provincename = "";
      }

      http.requestWithToken(
        "/auth_api/monthSummary/worker",
        "get",
        {
          adcode: this.manager,

          startYear: this.startYear,
          endYear: this.endYear
        },
        res => {
          if (res.data.error) {
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data;
          }
          this.drawChart();
        },
        () => {}
      );
    },
    queryTownData() {
      this.contentLabelIndex = 2;
      this.myarea = this.area;

      http.requestWithToken(
        "/auth_api/user/provinceName",
        "get",
        {
          adcode: this.myarea
        },
        res => {
          if (res.data.error) {
            this.$message({
              message: "失败",
              type: "error"
            });
          } else {
            this.provincesname = res.data.data;
            this.provincename = this.provincesname[2];
          }
          this.drawChart();
        },
        () => {}
      );
      http.requestWithToken(
        "/auth_api/monthSummary/town",
        "get",
        { adcode: this.area, startYear: this.startYear, endYear: this.endYear },
        res => {
          if (res.data.error) {
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data;
          }
          this.drawChart();
        },
        () => {}
      );
    },
    queryAreaData() {
      this.contentLabelIndex = 1;
      this.myarea = this.city;
      http.requestWithToken(
        "/auth_api/user/provinceName",
        "get",
        {
          adcode: this.myarea
        },
        res => {
          if (res.data.error) {
            this.$message({
              message: "失败",
              type: "error"
            });
          } else {
            this.provincesname = res.data.data;
            this.provincename = this.provincesname[1];
          }
          this.drawChart();
        },
        () => {}
      );
      http.requestWithToken(
        "/auth_api/monthSummary/area",
        "get",
        {
          adcode: this.city,

          startYear: this.startYear,
          endYear: this.endYear
        },
        res => {
          if (res.data.error) {
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data;
          }
          this.drawChart();
        },
        () => {}
      );
    },
    queryCityData() {
      this.contentLabelIndex = 0;
      this.myarea = this.province;

      http.requestWithToken(
        "/auth_api/user/provinceName",
        "get",
        {
          adcode: this.myarea
        },
        res => {
          if (res.data.error) {
            this.$message({
              message: "失败",
              type: "error"
            });
          } else {
            this.provincesname = res.data.data;
            this.provincename = this.provincesname[0];
          }
          this.drawChart();
        },
        () => {}
      );
      http.requestWithToken(
        "/auth_api/monthSummary/city",
        "get",
        {
          adcode: this.province,
          startYear: this.startYear,
          endYear: this.endYear
        },
        res => {
          if (res.data.error) {
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data;
          }
          this.drawChart();
        },
        () => {}
      );
    },
    drawChart() {
      function renderItem(params, api) {
        var xValue = api.value(0);
        var highPoint = api.coord([xValue, api.value(1)]);
        var lowPoint = api.coord([xValue, api.value(2)]);
        var halfWidth = api.size([1, 0])[0] * 0.1;
        var style = api.style({
          stroke: api.visual("color"),
          fill: null
        });

        return {
          type: "group",
          children: [
            {
              type: "line",
              shape: {
                x1: highPoint[0] - 5,
                y1: highPoint[1],
                x2: highPoint[0] + 5,
                y2: highPoint[1]
              },
              style: style
            },
            {
              type: "line",
              shape: {
                x1: highPoint[0],
                y1: highPoint[1],
                x2: lowPoint[0],
                y2: lowPoint[1]
              },
              style: style
            },
            {
              type: "line",
              shape: {
                x1: lowPoint[0] - 5,
                y1: lowPoint[1],
                x2: lowPoint[0] + 5,
                y2: lowPoint[1]
              },
              style: style
            }
          ]
        };
      }

      let myChart = echarts.init(this.$refs.echartsArea);
      let xLabel = [];
      let yData = [];
      let errorData = [];
      if (this.summaryList.length == 0) {
        myChart.clear();
      } else {
        if(this.$store.state.user.role==4){
            this.provincename=this.$store.state.user.username;
        }
        for (let i = 0; i < this.summaryList.length; ++i) {
          xLabel.push(this.summaryList[i].month + "月");
          yData.push(this.summaryList[i].num);
        }
        let option = {
          toolbox: {
            show: true,

            feature: {
              saveAsImage: {
                show: true,

                excludeComponents: ["toolbox"],

                pixelRatio: 2
              }
            }
          },

          tooltip: {
            show: false
          },
          xAxis: {
            name: this.provincename + "松墨天牛数量时间动态图",
            nameLocation: "center",
            nameTextStyle: {
              padding: [20, 0, 0, 0]
            },
            data: xLabel
          },
          yAxis: {
            name: "松墨天牛数量",
            nameLocation: "center",
            nameTextStyle: {
              padding: [0, 0, 20, 0]
            }
          },
          series: [
            {
              name: "数量",
              type: "bar",
              data: yData,
              itemStyle: {
                normal: {
                  color: "#77bef7",
                  label: {
                    show: true, //是否展示
                    textStyle: {
                      fontWeight: "bolder",
                      fontSize: "12",
                      fontFamily: "微软雅黑"
                    }
                  }
                }
              }
            }
          ]
        };

        myChart.setOption(option);
      }
    },
    makeAnalysisData(data) {
      console.log(data);
      let list = [];
      list.push({
        "0": this.contentLabelDict[this.contentLabelIndex] + "间",
        "1": data.ssa,
        "2": data.dfa,
        "3": data.msa,
        "4": data.f,
        "5": data.fcrit,
        "6": data.r
      });
      list.push({
        "0": this.contentLabelDict[this.contentLabelIndex] + "内",
        "1": data.sse,
        "2": data.dfe,
        "3": data.mse,
        "4": "",
        "5": "",
        "6": ""
      });
      list.push({
        "0": "总计",
        "1": data.sst,
        "2": data.dft,
        "3": "",
        "4": "",
        "5": "",
        "6": ""
      });
      this.analysisList = list;
      console.log(this.analysisList);
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
          this.citiesname = res.data;
          this.cityname = "";
          this.areaname = "";
          this.areasname = [];
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
    loadManagers() {
      http.requestWithToken(
        "/auth_api/manager_list",
        "get",
        { adcode: this.area },
        res => {
          this.managers = res.data.data;
          console.log(this.managers);
        },
        () => {}
      );
    },
    areaChanged() {
      this.manager = "";
      this.loadManagers();
    },

    cityChanged() {
      this.area = "";
      this.manager = "";
      this.loadArea();
    },

    tableRowStyle({ row, rowIndex }) {
      return "border: 0;border-top-color:white;";
    },
    // 修改table header的背景色
    tableHeaderColor({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0) {
        return "background-color: lightblue;color: #fff;font-weight: 500;";
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style>
#statistics-tabs .el-table thead {
  color: black;
  font-weight: 500;
}
#statistics-tabs .el-table__header-wrapper table {
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}
#statistics-tabs .el-table__body-wrapper {
  padding-bottom: 5px;
}
#statistics-tabs .el-table__body-wrapper table {
  border-bottom: 1px solid #000;
}
#statistics-tabs .el-table__body-wrapper tbody {
  border-top-color: white;
  border-bottom-color: white;
}
#statistics-tabs .el-table__body-wrapper tr {
  border-top-color: white;
  border-bottom-color: white;
}
</style>


