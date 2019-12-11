<template>
  <div>
  <router-link to='/pages/device_summary'>诱捕器情况</router-link>
        >设备维护信息


    <div id="tool-row">
      <div>

        <el-date-picker
          v-model="maintenanceData.startDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="起始日期"
        ></el-date-picker>
        <el-date-picker
          v-model="maintenanceData.endDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="终止日期"
        ></el-date-picker>
        <el-button type="primary" @click="loadMaintenanceData">搜索</el-button>

      </div>
      <div>
        <!-- <el-button type="primary" @click="showAdd">添加</el-button> -->
        <!-- <el-button
          type="primary"
          @click="showEdit"
          :disabled="maintenanceData.selectedIndex == -1"
        >修改</el-button>
        <el-button
          type="primary"
          :disabled="maintenanceData.selectedIndex == -1"
          @click="handleDelete"
        >删除</el-button>
        <el-button
          type="primary"
          @click="handleReportMaintenanceData"
          v-if="this.$store.state.user.role == 3 "
        >上报</el-button>-->
        <el-button type="primary" @click="exportExcel">导出</el-button>
      </div>
    </div>

    <div style="padding-top:5px">
      <el-table
        border
        :data="maintenanceData.list"
        style="width: 100%"
        height="600"

        @selection-change="handleMaintenanceDataSelectionChange"
      >
        <!-- <el-table-column label width="50" align="center" fixed="left">
          <template scope="scope">
            <el-radio
              :label="scope.$index"
              v-model="maintenanceData.selectedIndex"
              @change.native="getCurrentRow(scope.$index)"
            >&nbsp</el-radio>
          </template>
        </el-table-column>-->

        <el-table-column type="selection" width="55" fixed="left"></el-table-column>
        <el-table-column prop="deviceId" label="诱捕器编号"></el-table-column>
        <el-table-column prop="num" label="松墨天牛总数"></el-table-column>

        <el-table-column prop="longitude" label="经度"></el-table-column>
        <el-table-column prop="latitude" label="纬度"></el-table-column>
        <el-table-column prop="altitude" label="海拔"></el-table-column>
        <el-table-column label="行政区域" width="200px">
          <template
            slot-scope="scope"
          >{{scope.row.province + scope.row.city + scope.row.area + scope.row.town}}</template>
        </el-table-column>
        <el-table-column prop="username" label="工人"></el-table-column>

        <el-table-column
          label="操作"
          align="center"
          width="150px"
          fixed="right"

        >
          <template slot-scope="scope">

              <el-button
                size="mini"
                type="primary"
                @click="showEditMaintenanceDataDialog(scope.row)"

              >查看</el-button>

          </template>
        </el-table-column>

      </el-table>
      <div class="block">
        <el-pagination
          background
          @current-change="handleMaintenanceDataCurrentPageChanged"
          :current-page.sync="maintenanceData.page"
          :page-size="10"
          layout="total, prev, pager, next"
          :total="maintenanceData.total"
        ></el-pagination>
      </div>
    </div>

    <el-dialog title="现场照片" :visible.sync="PhotoDialog.visible" width="700px">
      <div style="overflow-y:scroll;height: 300px">
        <img v-bind:src="PhotoDialog.pic" style="width: 600px; ">
      </div>
    </el-dialog>
    <el-dialog title="现场照片" :visible.sync="PhotoDialog.visible" width="700px">
      <div style="overflow-y:scroll;height: 300px">
        <img v-bind:src="PhotoDialog.pic" style="width: 600px; ">
      </div>
    </el-dialog>
    <!-- 编辑维护信息对话框 -->
    <el-dialog title="编辑维护信息" :visible.sync="EditMaintenanceDialog.visible" width="30%">
      <el-form label-width="120px">
        <el-form-item label="松墨天牛数量">
          <el-input-number :min="0" v-model="EditMaintenanceDialog.form.num"></el-input-number>
        </el-form-item>
        <el-form-item label="其他天牛类型">
          <!-- <el-input-number :min="0"></el-input-number> -->
          <el-select v-model="EditMaintenanceDialog.form.otherType">
            <el-option :label="无" value :key="无">无</el-option>
            <el-option
              v-for="item in otherBeetleList"
              :value="item.id"
              :label="item.name"
              :key="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="其他天牛数量">
          <el-input-number :min="0" v-model="EditMaintenanceDialog.form.otherNum"></el-input-number>
        </el-form-item>
        <el-form-item label="药剂类型">
          <el-select v-model="EditMaintenanceDialog.form.drug">
            <el-option label="APF-I持久增强型" value="APF-I持久增强型">APF-I持久增强型</el-option>
            <el-option label="APF-I持久型" value="APF-I持久型">APF-I持久型</el-option>
            <el-option label="APF-I普通型" value="APF-I普通型">APF-I普通型</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="工作内容">
          <el-select v-model="EditMaintenanceDialog.form.workingContent">
            <el-option :value="0" label="首次悬挂诱捕器">首次悬挂诱捕器</el-option>
            <el-option :value="1" label="换药+收虫">换药+收虫</el-option>
            <el-option :value="2" label="收虫">收虫</el-option>
            <el-option :value="3" label="其他">其他</el-option>
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="EditMaintenanceDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click.native.prevent="handleEditMaintenanceDataSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import http from "../../utils/http";
export default {
  data() {
    return {
      searchText: "",
      otherBeetleList: [],
      otherBeetleDict: {},

      getstartDate: null,
      getendDate: null,
      startDate: null,
      endDate: null,
      maintenanceData: {
        list: [],
        selectedIndex: -1,
        page: 1,
        limit: 10,
        total: 0,
        startDate: null,
        endDate: null,
        selection: [],
        workingContentDict: ["首次悬挂诱捕器", "换药+收虫", "收虫", "其他"]
      },
      PhotoDialog: {
        visible: false,
        pic: ""
      },
      EditMaintenanceDialog: {
        visible: false,
        form: {
          id: 0,
          num: 0,
          otherNum: 0,
          otherType: "",
          longitude: "",
          latitude: "",
          workingContent: 0,
          drug: ""
        }
      }
    };
  },
  methods: {
    setSearchText(searchText) {
      this.searchText = searchText;
    },
    returnlast(){
        this.$router.push({ path: '/pages/device_summary' });
    },
    // 表格相关
    loadMaintenanceData() {
      this.startDate=this.getstartDate;
      this.endDate=this.getendDate
      if(this.maintenanceData.startDate!=null && this.maintenanceData.startDate!=""){
          this.startDate=this.maintenanceData.startDate;
      }
      if(this.maintenanceData.endDate!=null && this.maintenanceData.endDate!=""){
                this.endDate=this.maintenanceData.endDate;
      }
      this.loadOtherBeetleType();
      http.requestWithToken(
        "/auth_api/maintenance2",
        "get",
        {
          condition: this.searchText,
          page: this.maintenanceData.page,
          limit: this.maintenanceData.limit,
          startDate: this.startDate,
          endDate: this.endDate
        },
        res => {
          this.maintenanceData.list = res.data.data;
          this.maintenanceData.total = res.data.totalNum;

        },
        () => {}
      );
    },
    handleMaintenanceDataCurrentPageChanged(val) {
      this.maintenanceData.page = val;
      this.loadMaintenanceData();
    },
    //
    showPhotoDialog(id) {
      this.PhotoDialog.visible = true;
     // let BASE_URL = "http://47.103.66.70:8081";
    let BASE_URL = "http://39.108.184.47:8081";
      this.PhotoDialog.pic = BASE_URL + "/device_img?imgName=" + id;
    },
    handleMaintenanceDataSelectionChange(val) {
      this.maintenanceData.selection = val;
      console.log(val);
    },
    showEditMaintenanceDataDialog(data) {


      this.EditMaintenanceDialog.visible = true;
      this.EditMaintenanceDialog.form = {
        id: 0,
        num: 0,
        otherNum: 0,
        otherType: "",
        longitude: "",
        latitude: "",
        workingContent: 0,
        drug: ""
      };
      this.EditMaintenanceDialog.form.longitude = data.longitude;
      this.EditMaintenanceDialog.form.latitude = data.latitude;
      this.EditMaintenanceDialog.form.workingContent = data.workingContent;
      this.EditMaintenanceDialog.form.drug = data.drug;
      this.EditMaintenanceDialog.form.num = data.num;
      this.EditMaintenanceDialog.form.id = data.id;
      this.EditMaintenanceDialog.form.otherNum = data.otherNum;
      this.EditMaintenanceDialog.form.otherType = data.otherType;

      sessionStorage.setItem('deviceID', data.deviceId);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('startDate',this.startDate);
      sessionStorage.setItem('endDate',this.endDate);
            this.$router.push({ path: '/pages/device_message' });
    },
    handleEditMaintenanceDataSubmit() {
      http.requestWithTokenJson(
        "/auth_api/maintenance",
        "put",
        this.EditMaintenanceDialog.form,
        res => {
          this.$message.success("修改成功");
          this.EditMaintenanceDialog.visible = false;
          this.loadMaintenanceData();
        },
        () => {}
      );
    },
    loadOtherBeetleType() {
      http.requestWithToken(
        "/auth_api/other_beetle",
        "get",
        {},
        res => {
          this.otherBeetleList = res.data.data;
          for (let i = 0; i < this.otherBeetleList.length; ++i) {
            this.otherBeetleDict[
              "t" + this.otherBeetleList[i].id
            ] = this.otherBeetleList[i].name;
          }
        },
        () => {}
      );
    },
    handleReportMaintenanceData() {

      let data = [];
      for (let i = 0; i < this.maintenanceData.selection.length; ++i) {
        data.push(this.maintenanceData.selection[i].id);
      }
      http.requestWithTokenJson(
        "/auth_api/maintenance/report",
        "post",
        { list: data },
        res => {
          if (!res.data.error) {
            this.$message.success("上报成功");
            // this.maintenanceData.page = 1;
            this.loadMaintenanceData();
          }
        },
        () => {}
      );
    },
    exportExcel() {
      window.location =
        http.getBaseUrl() +
        "/maintenance/export?startDate=" +
        this.startDate +
        "&endDate=" +
        this.endDate +
        "&condition="+
        this.searchText+
        "&token=" +
        sessionStorage["token"];
    }
  },
  mounted() {

    if(sessionStorage.getItem('SearchText')){
                this.searchText =sessionStorage.getItem('SearchText');
                this.getstartDate =sessionStorage.getItem('startDate');
                this.getendDate =sessionStorage.getItem('endDate');

                }
                this.loadMaintenanceData();
    // this.loadOtherBeetleType();
  }
};
</script>
<style>
#tool-row {
  display: flex;
  justify-content: space-between;
}
#userInfoDialogData {
  display: flex;
  justify-content: space-around;
}
</style>


