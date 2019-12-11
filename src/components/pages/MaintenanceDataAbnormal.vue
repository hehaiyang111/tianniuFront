<template>
  <div>
    <div id="tool-row">
      <div>
        <el-input v-model="searchText" placeholder="搜索" style="width: 150px"></el-input>
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
      <el-button
                type="primary"
                @click="handleReportMaintenanceData"
                v-if="this.$store.state.user.role == 3"
              >上报</el-button>
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
        <el-table-column prop="deviceId" label="设备ID"></el-table-column>
        <el-table-column prop="batch" label="批次"></el-table-column>
        <el-table-column prop="num" label="松墨天牛数量"></el-table-column>
        <el-table-column label="其他天牛类型">
          <template slot-scope="scope">
            {{otherBeetleDict["t" + scope.row.otherType]}}
          </template>
        </el-table-column>
        <el-table-column prop="otherNum" label="其他天牛数量"></el-table-column>
        <el-table-column prop="longitude" label="经度"></el-table-column>
        <el-table-column prop="latitude" label="纬度"></el-table-column>
        <el-table-column prop="altitude" label="海拔"></el-table-column>
        <el-table-column label="位置" width="200px">
          <template
            slot-scope="scope"
          >{{scope.row.province + scope.row.city + scope.row.area + scope.row.town}}</template>
        </el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="date" label="日期"></el-table-column>
        <el-table-column label="工作内容">
          <template
            slot-scope="scope"
          >{{maintenanceData.workingContentDict[scope.row.workingContent]}}</template>
        </el-table-column>
        <el-table-column prop="drug" label="药剂类型"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="现场照片" width="100px" align="center">
          <template slot-scope="scope">
            <el-button
              @click="showPhotoDialog(scope.row.imageId)"
              v-if="scope.row.imageId != null && scope.row.imageId !=''"
              size="mini"
            >显示</el-button>
          </template>
        </el-table-column>
        <el-table-column
                  label="操作"
                  align="center"
                  width="150px"
                  fixed="right"
                  v-if="this.$store.state.user.role == 6 || this.$store.state.user.role == 3"
                >
                  <template slot-scope="scope">
                    <div v-if="!scope.row.reported">
                      <el-button
                        size="mini"
                        type="primary"
                        @click="showEditMaintenanceDataDialog(scope.row)"
                        v-if="!scope.row.reported"
                      >编辑</el-button>
                      <el-button
                          size="mini"
                          type="danger"
                          @click="handleDelete(scope.row)"
                          v-if="!scope.row.reported"
                      >删除</el-button>

                    </div>
                    <div v-if="scope.row.reported">不可操作</div>
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

        <el-form-item label="经度">
          <el-input style="width:150px" v-model="EditMaintenanceDialog.form.longitude"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input style="width:150px" v-model="EditMaintenanceDialog.form.latitude"></el-input>
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
      checkBoxData: [],
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

  handleUserDelete(){
      let data = [];
        for (let i = 0; i < this.maintenanceData.selection.length; ++i) {
          data.push(this.maintenanceData.selection[i].id);
        }
        http.requestWithTokenJson(
          "/auth_api/maintenance/abnormal",
          "post",
          { list: data },
          res => {
            if (!res.data.error) {

              this.$message.success("上报成功");
              // this.maintenanceData.page = 1;

            }else{
            this.$message.error("上报失败");
            }

            },

          () => {}
        );
loadMaintenanceData();
     },
    setSearchText(searchText) {
      this.searchText = searchText;
    },
    handleDelete(row){
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(() => {
                    http.requestWithToken(
                             "/auth_api/maintenance/abnormal",
                             "delete",
                             {
                               id:row.id,
                               deviceID:row.deviceId
                             },
                             res => {
                  if (!res.data.error) {
                  this.loadMaintenanceData();
                        this.$message({
                          type: 'success',
                          message: '删除成功!'
                      });
                      }else{
                      this.$message({
                                            type: 'error',
                                            message: '删除失败!'
                                        });
                      }
                             },
                             () => {}
                           );

                    }).catch(() => {
                      this.$message({
                        type: 'info',
                        message: '已取消删除'
                      });
                    });
    this.loadMaintenanceData();
        },
    // 表格相关
    loadMaintenanceData() {
      this.loadOtherBeetleType();
      http.requestWithToken(
        "/auth_api/maintenance/abnormal",
        "get",
        {
          condition: this.searchText,
          page: this.maintenanceData.page,
          limit: this.maintenanceData.limit,
          startDate: this.maintenanceData.startDate,
          endDate: this.maintenanceData.endDate
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
      //let BASE_URL = "http://47.103.66.70:8081";
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
    },
    handleEditMaintenanceDataSubmit() {
      http.requestWithTokenJson(
        "/auth_api/maintenance/abnormal",
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
        "/auth_api/maintenance/abnormal/report",
        "post",
        { list: data },
        res => {
          if (!res.data.error) {
            this.$message.success("上报成功");
            this.loadMaintenanceData();
            // this.maintenanceData.page = 1;

          }else{
          this.$message.error("上报存在失败");
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
        this.maintenanceData.startDate +
        "&endDate=" +
        this.maintenanceData.endDate +
        "&token=" +
        sessionStorage["token"];
    }
  },
  mounted() {
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


