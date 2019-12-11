<template>
  <div>
    <div>
      <!-- <el-select placeholder="省" v-if="this.$store.state.user.role == 1"></el-select> -->
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

      <el-date-picker v-model="startDate" type="date" value-format="yyyy-MM-dd" placeholder="起始日期"></el-date-picker>
      <el-date-picker v-model="endDate" type="date" value-format="yyyy-MM-dd" placeholder="终止日期"></el-date-picker>
      <el-button type="primary" @click="query()">查询</el-button>
      <el-button type="primary" @click="exportExcel()">保存表格</el-button>
    </div>
    <el-tabs id="statistics-tabs" v-model="tabPage" type="card">
      <el-tab-pane label="描述性统计分析" name="first">
        <el-card header="描述性统计分析表" style="padding:5px">
          <el-table :data="summaryList" :row-style="tableRowStyle">
            <el-table-column :label="contentLabelDict[contentLabelIndex]" prop="name"></el-table-column>
            <el-table-column label="诱捕器数量" prop="count"></el-table-column>
            <el-table-column label="总诱虫量" prop="sum"></el-table-column>
            <el-table-column label="平均" prop="mean"></el-table-column>
            <el-table-column label="标准差" prop="std"></el-table-column>
            <el-table-column label="最大值" prop="max"></el-table-column>
            <el-table-column label="最小值" prop="min"></el-table-column>
            <el-table-column label="置信区间">
              <template slot-scope="scope">{{scope.row.confidenceLo + "~" + scope.row.confidenceHi}}</template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-card style="padding: 5px">
          <div style="width: 100%;height:300px;" ref="echartsArea"></div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="方差分析" name="second">
        <el-card>
          <el-table :data="analysisList">
            <el-table-column label="差异源" prop="0"></el-table-column>
            <el-table-column label="平方和SS" prop="1"></el-table-column>
            <el-table-column label="自由度DF" prop="2"></el-table-column>
            <el-table-column label="方差MS" prop="3"></el-table-column>
            <el-table-column label="统计量F" prop="4"></el-table-column>
            <el-table-column label="临界值F crit" prop="5"></el-table-column>
            <el-table-column label="相关系数R" prop="6"></el-table-column>
          </el-table>
          <label>备注：当统计量F>临界值F时，方差分析达到显著差异</label>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="多重比较" name="third">
        <el-card header="差异性分析" style="width:100%; padding: 5px">
          <el-select v-model="mcType">
            <el-option value="0" key="LSD" label="LSD">LSD</el-option>
            <el-option value="1" key="SCHEFFE" label="SCHEFFE">SCHEFFE</el-option>
          </el-select>
          <el-table :data="mcList" v-if="mcType == 0">
            <el-table-column :label="'(i)' + contentLabelDict[contentLabelIndex]" prop="labelA"></el-table-column>
            <el-table-column :label="'(j)' + contentLabelDict[contentLabelIndex]" prop="labelB"></el-table-column>
            <el-table-column label="均值差值" prop="dv"></el-table-column>
            <el-table-column label="标准误" prop="standardError"></el-table-column>
            <el-table-column label="置信下限" prop="lsdConfidenceLo"></el-table-column>
            <el-table-column label="置信上限" prop="lsdConfidenceHi"></el-table-column>
            <el-table-column label="LSD值" prop="lsd"></el-table-column>
            <el-table-column label="差异显著">
              <template slot-scope="scope">{{scope.row.lsdSignificance ? '是': '否'}}</template>
            </el-table-column>
          </el-table>
          <el-table :data="mcList" v-if="mcType == 1">
            <el-table-column :label="'(i)' + contentLabelDict[contentLabelIndex]" prop="labelA"></el-table-column>
            <el-table-column :label="'(j)' + contentLabelDict[contentLabelIndex]" prop="labelB"></el-table-column>
            <el-table-column label="均值差值" prop="dv"></el-table-column>
            <el-table-column label="标准误" prop="standardError"></el-table-column>
            <el-table-column label="置信下限" prop="scheffeConfidenceLo"></el-table-column>
            <el-table-column label="置信上限" prop="scheffeConfidenceHi"></el-table-column>
            <el-table-column label="D值" prop="scheffe"></el-table-column>
            <el-table-column label="差异显著">
              <template slot-scope="scope">{{scope.row.scheffeSignificance ? '是': '否'}}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
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
      provinces: [],
      province: "",
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
      summaryList: [],
      analysisList: [],
      mcList: [],
      tabPage: "first",
      mcType: "0"
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
    exportExcel() {

      let role = this.$store.state.user.role;
      if (role == 4) {
        window.location =
          http.getBaseUrl() +
          "/statistics/export?manager=" +
          this.manager +
          "&startDate=" +
          this.startDate +
          "&endDate=" +
          this.endDate +
          "&type=3&token=" +
          sessionStorage["token"];
      }
      if (role == 3) {
        if (this.manager == "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?adcode=" +
            this.area +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=2&token=" +
            sessionStorage["token"];
        } else {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?manager=" +
            this.manager +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=3&token=" +
            sessionStorage["token"];
        }
      }
      if (role == 2) {
        if (this.area == "" && this.manager == "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?adcode=" +
            this.city +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=1&token=" +
            sessionStorage["token"];
        }
        if (this.area != "" && this.manager == "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?adcode=" +
            this.area +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=2&token=" +
            sessionStorage["token"];
        }
        if (this.area != "" && this.manager != "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?manager=" +
            this.manager +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=3&token=" +
            sessionStorage["token"];
        }
      }
      if (role == 1) {
        if (this.city == "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?adcode=" +
            this.province +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=0&token=" +
            sessionStorage["token"];
        }
        if (this.city != "" && this.area == "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?adcode=" +
            this.city +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=1&token=" +
            sessionStorage["token"];
        }
        if (this.city != "" && this.area != "" && this.manager == "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?adcode=" +
            this.area +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=2&token=" +
            sessionStorage["token"];
        }
        if (this.city != "" && this.area != "" && this.manager != "") {
          window.location =
            http.getBaseUrl() +
            "/statistics/export?manager=" +
            this.manager +
            "&startDate=" +
            this.startDate +
            "&endDate=" +
            this.endDate +
            "&type=3&token=" +
            sessionStorage["token"];
        }
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
      http.requestWithToken(
        "/auth_api/statistics/worker",
        "get",
        {
          manager: this.manager,
          startDate: this.startDate,
          endDate: this.endDate
        },
        res => {
          if (res.data.error) {
            this.$message.error("无数据");
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data.summaryList;
            this.mcList = [];
            if (res.data.data.multipleComparisonsList.length > 2) {
              this.mcList = res.data.data.multipleComparisonsList;
            } else {
              this.$message.error("数据量不足");
            }

            this.makeAnalysisData(res.data.data.analysisEntity);
          }
          this.drawChart();
        },
        () => {}
      );
    },
    queryTownData() {
      this.contentLabelIndex = 2;
      http.requestWithToken(
        "/auth_api/statistics/town",
        "get",
        { adcode: this.area, startDate: this.startDate, endDate: this.endDate },
        res => {
          if (res.data.error) {
            this.$message.error("无数据");
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data.summaryList;
            this.mcList = [];
            if (res.data.data.multipleComparisonsList.length > 2) {
              this.mcList = res.data.data.multipleComparisonsList;
            } else {
              this.$message.error("数据量不足");
            }
            this.makeAnalysisData(res.data.data.analysisEntity);
          }
          this.drawChart();
        },
        () => {}
      );
    },
    queryAreaData() {
      this.contentLabelIndex = 1;
      http.requestWithToken(
        "/auth_api/statistics/area",
        "get",
        { adcode: this.city, startDate: this.startDate, endDate: this.endDate },
        res => {
          if (res.data.error) {
            this.$message.error("无数据");
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data.summaryList;
            this.mcList = [];
            if (res.data.data.multipleComparisonsList.length > 2) {
              this.mcList = res.data.data.multipleComparisonsList;
            } else {
              this.$message.error("数据量不足");
            }
            this.makeAnalysisData(res.data.data.analysisEntity);
          }
          this.drawChart();
        },
        () => {}
      );
    },
    queryCityData() {
      this.contentLabelIndex = 0;
      http.requestWithToken(
        "/auth_api/statistics/city",
        "get",
        {
          adcode: this.province,
          startDate: this.startDate,
          endDate: this.endDate
        },
        res => {
          if (res.data.error) {
            this.$message.error("无数据");
            this.summaryList = [];
            this.mcList = [];
            this.makeAnalysisData([]);
          } else {
            this.summaryList = res.data.data.summaryList;
            this.mcList = [];
            if (res.data.data.multipleComparisonsList.length > 2) {
              this.mcList = res.data.data.multipleComparisonsList;
            } else {
              this.$message.error("数据量不足");
            }
            this.makeAnalysisData(res.data.data.analysisEntity);
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
        for (let i = 0; i < this.summaryList.length; ++i) {
          xLabel.push(this.summaryList[i].name);
          yData.push(this.summaryList[i].mean);
          errorData.push([
            i,
            this.summaryList[i].mean - this.summaryList[i].std,
            this.summaryList[i].mean + this.summaryList[i].std
          ]);
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

          title: {
            text: "统计分析图",
            x: "center",
            y: "top",
            textAlign: "center"
          },
          tooltip: {
            show: false
          },
          xAxis: {
            name: this.contentLabelDict[this.contentLabelIndex],
            nameLocation: "center",
            nameTextStyle: {
              padding: [20, 0, 0, 0]
            },
            data: xLabel
          },
          yAxis: {
            name: "诱虫量",
            nameLocation: "center",
            nameTextStyle: {
              padding: [0, 0, 20, 0]
            }
          },
          series: [
            {
              name: "均值",
              type: "bar",
              data: yData,
              itemStyle: {
                normal: {
                  color: "#77bef7"
                }
              }
            },
            {
              type: "custom",
              name: "标准差",
              itemStyle: {
                normal: {
                  borderWidth: 1.5,
                  color: "#000000"
                }
              },
              renderItem: renderItem,
              encode: {
                x: 0,
                y: [1, 2]
              },
              data: errorData,
              z: 100
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


