<template>
  <div style="height:100%; width:100%;">
    <div id="float-dropdown-menu">
      <el-dropdown split-button type="primary" @command="loadSpots">
        聚合级别
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="province" v-if="this.$store.state.user.role < 2">省</el-dropdown-item>
          <el-dropdown-item command="city" v-if="this.$store.state.user.role < 3">市</el-dropdown-item>
          <el-dropdown-item command="area" v-if="this.$store.state.user.role < 4">县</el-dropdown-item>
          <el-dropdown-item command="town" v-if="this.$store.state.user.role < 4">乡</el-dropdown-item>
          <el-dropdown-item command="device">设备</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div style="height:100%; width:100%;">
      <div id="allmap" ref="allmap"></div>
    </div>
    <el-dialog :title="'统计信息'" :visible.sync="dialogVisible">
      <t-statistics-view ref="statisticsView"></t-statistics-view>
    </el-dialog>
  </div>
</template>
<script>
import gps from "../../utils/gps";
import http from "../../utils/http";
import MapStatistics from "./MapStatistics.vue";
export default {
  components: {
    "t-statistics-view": MapStatistics
  },
  data() {
    return {
      map: undefined,
      dialogVisible: false
    };
  },
  methods: {
    loadSpots(val) {
      this.map.clearOverlays();
      if (val == "device") {
        console.log("device");
        var markers = [];
        http.requestWithToken(
          "/auth_api/device_list",
          "get",
          { page: 1, limit: 1000 },
          res => {
            console.log(res.data);
            let that = this;
            function addMarker(point, events) {
             //此处point不再需要了
                  var options = {
                    size: 30,
                    shape: 2,
                    color: '#d340c3'
                  }
 //  var marker = new BMap.Marker(point);
                  var markerClusterer = new BMap.PointCollection(markers,options);                        
              // marker.addEventListener("click", events);
             // that.map.addOverlay(marker);
             that.map.addOverlay(markerClusterer);           
            }
            function addText(text, point) {
              var opts = {
                position: point, // 指定文本标注所在的地理位置
                offset: new BMap.Size(5, -5) //设置文本偏移量
              };
              var label = new BMap.Label(text, opts); // 创建文本标注对象
              label.setStyle({
                color: "black",
                fontSize: "12px",
                height: "20px",
                lineHeight: "20px",
                fontFamily: "微软雅黑"
              });
              that.map.addOverlay(label);
            }
            let data = res.data.data;
            var flag = 1;
            for (let i = 0; i < data.length; ++i) {
              if (data[i].longitude && data[i].latitude) {
                var point = gps.convert(data[i].latitude, data[i].longitude);
                point = new BMap.Point(point[1], point[0]);
                markers.push(point); // addMarker(point, () => {//   this.dialogVisible = true;// });
                addText(data[i]["id"], point);
                
                let center = "";
                if (data[i].town != null) center = data[i].town + center;
                if (data[i].city != null) center = data[i].city + center;
                if (data[i].area != null) center = data[i].area + center;
                if (data[i].province != null)
                  center = data[i].province + center;
                if (center && flag){
                  this.map.centerAndZoom(center, 5)
                  flag = 0;
                  };
              }
            }
             addMarker(point, () => {
                  this.dialogVisible = true;
                });

          },
          () => {}
        );
      }
      if (val != "device") {
        var markers = [];
        console.log("!device");
        http.requestWithTokenJson(
          "/auth_api/statistics_map/" + val + "_spots",
          "get",
          {},
          res => {
            console.log(res.data);
            let that = this;
            function addMarker(point, events) {
              var options = {
                    size: 30,
                    shape: 2,
                    color: '#d340c3'
                  }
             // var marker = new BMap.Marker(point);
              var markerClusterer = new BMap.PointCollection(markers,options);
              // marker.addEventListener("click", events);
              //that.map.addOverlay(marker);
              that.map.addOverlay(markerClusterer);

              // var marker = new BMap.Marker(point);
              marker.addEventListener("click", events);
              that.map.addOverlay(markerClusterer);
            }
            function addText(text, point) {
              var opts = {
                position: point, // 指定文本标注所在的地理位置
                offset: new BMap.Size(5, -5) //设置文本偏移量
              };
              var label = new BMap.Label(text, opts); // 创建文本标注对象
              label.setStyle({
                color: "black",
                fontSize: "12px",
                height: "20px",
                lineHeight: "20px",
                fontFamily: "微软雅黑"
              });
              that.map.addOverlay(label);
            }
            let data = res.data;
            for (let i = 0; i < data.length; ++i) {
              if (data[i].longitude && data[i].latitude) {
                var point = gps.convert(data[i].latitude, data[i].longitude);
                point = new BMap.Point(point[1], point[0]);
                 markers.push(point);
                addText(data[i][val], point);
                let center = "";
                if (data[i].town != null) center = data[i].town + center;
                if (data[i].city != null) center = data[i].city + center;
                if (data[i].area != null) center = data[i].area + center;
                if (data[i].province != null)
                  center = data[i].province + center;
                if (center) this.map.centerAndZoom(center, 5);
              }
            }
                addMarker(point, () => {
                  if (val == "province") {
                    console.log("province");
                    this.dialogVisible = true;
                    setTimeout(() => {
                      this.$nextTick(() => {

                      this.$refs.statisticsView.startDate="";
                       this.$refs.statisticsView.endDate="";
                        //this.$refs.statisticsView.init();
                        this.$refs.statisticsView.city="";
                        this.$refs.statisticsView.area="";
                        this.$refs.statisticsView.query();
                      });
                    }, 10);
                  } else if (val == "city") {
                     console.log("city");
                    this.dialogVisible = true;
                    setTimeout(() => {
                      this.$nextTick(() => {

                      this.$refs.statisticsView.startDate="";
                                             this.$refs.statisticsView.endDate="";
                                             this.$refs.statisticsView.area="";
                        //this.$refs.statisticsView.init();
                        this.$refs.statisticsView.showCity = false;
                        this.$refs.statisticsView.city = data[
                          i
                        ].adcode.substring(0, 4);

                        this.$refs.statisticsView.query();
                        this.$refs.statisticsView.cityChanged();
                      });
                    }, 10);
                  } else if (val == "area") {
                    console.log("area");
                    this.dialogVisible = true;
                    setTimeout(() => {
                      this.$nextTick(() => {

                      this.$refs.statisticsView.startDate="";
                         this.$refs.statisticsView.endDate="";
                          this.$refs.statisticsView.town="";
                        this.$refs.statisticsView.showCity = false;
                        this.$refs.statisticsView.showArea = false;
                        //this.$refs.statisticsView.init();
                        this.$refs.statisticsView.city = data[
                          i
                        ].adcode.substring(0, 4);
                        this.$refs.statisticsView.area = data[i].adcode;
                        this.$refs.statisticsView.query();
                        //此处查ok的。。。里面点按钮什么
                        this.$refs.statisticsView.areaChanged();

                        this.$refs.statisticsView.area = data[i].adcode;
                      });
                    }, 10);
                  }
                });
            //     addText(data[i][val], point);
            //     let center = "";
            //     if (data[i].town != null) center = data[i].town + center;
            //     if (data[i].city != null) center = data[i].city + center;
            //     if (data[i].area != null) center = data[i].area + center;
            //     if (data[i].province != null)
            //       center = data[i].province + center;
            //     if (center) this.map.centerAndZoom(center, 5);
            //   }
            // }
          },
          () => {}
        );
      }
    }
  },
  mounted() {
    this.map = new BMap.Map(this.$refs.allmap); // 创建Map实例
    this.map.centerAndZoom("中国", 11); // 初始化地图,设置中心点坐标（经纬度/城市的名称）和地图级别
    this.map.addControl(
      new BMap.MapTypeControl({
        //添加地图类型控件
        mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
      })
    );
    this.map.setCurrentCity("北京");
    this.map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
    this.loadSpots("device");
  }
};
</script>
<style>
#allmap {
  height: 100%;
  overflow: hidden;
}
#float-dropdown-menu {
  position: absolute;
  z-index: 9;
}
</style>
