<template>
  <div>
    <div id="tool-row">
      <div>
        <el-input v-model="searchText" placeholder="搜索" style="width: 120px"></el-input>
        <el-input v-model="searchBatch" placeholder="批次" style="width: 120px"></el-input>
        <el-input v-model="searchTown" placeholder="城镇" style="width: 120px" v-if="this.$store.state.user.role == 3"></el-input>
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
        <el-button type="primary" @click="buttonLoadMaintenanceData">搜索</el-button>
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
        >删除</el-button>-->
        <el-button
          type="primary"
          @click="handleReportMaintenanceData"
          v-if="this.$store.state.user.role == 3"
        >上报</el-button>
        <el-button
          type="primary"
          @click="handleDeleteSome"
          
        >批量删除</el-button>
        <el-button type="primary" @click="exportExcel">导出</el-button>
        <!--<el-button type="primary" @click="someExportExcel">批量导出</el-button>-->
        
        <!--<el-button type="primary" @click="importExcel(scope.$index)">导入</el-button>-->
        <el-upload  class="upload-demo" ref="upload"
        :action="uploadUrl"
        :on-success="loadMaintenanceData">
          <el-button type="primary" >点击上传</el-button>
        </el-upload>
      </div>
    </div>
    <div style="padding-top:5px">
      <el-table
        ref="table"
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
          <template slot-scope="scope">{{otherBeetleDict["t" + scope.row.otherType]}}</template>
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
        <el-table-column label="是否上报">
          <template slot-scope="scope">{{scope.row.reported ? '是': '否'}}</template>
        </el-table-column>
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
          v-if="this.$store.state.user.role == 3 || this.$store.state.user.role == 4"
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
        <el-form-item label="松墨天牛数量">
          <el-input-number :min="0" v-model="EditMaintenanceDialog.form.num"></el-input-number>
        </el-form-item>
        <el-form-item label="经度">
                  <el-input  v-model="EditMaintenanceDialog.form.longitude"></el-input>
                </el-form-item>
                <el-form-item label="纬度">
                          <el-input v-model="EditMaintenanceDialog.form.latitude"></el-input>
                        </el-form-item>
                        <el-form-item label="海拔">
                                  <el-input v-model="EditMaintenanceDialog.form.altitude"></el-input>
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
      searchBatch: "",
      searchTown: "",
      uploadUrl: "",
      otherBeetleList: [],
      otherBeetleDict: {},
      maintenanceData: {
        list: [],
        selectedIndex: -1,
        page: 1,
        limit: 10,
        total: 0,
        startDate: "",
        endDate: "",
        selection: [],
        mulitpleSelection: [],
        multipleSelectionAll: [],
        triggeredByPageChange : false,
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
          batch:0,
          num: 0,
          otherNum: 0,
          otherType: "",
          longitude: "",
          latitude: "",
          altitude:"",
          workingContent: 0,
          deviceId:"",
          drug: ""
        }
      }
    };
  },
  methods: {
    handleDeleteSome() {
      let data = [];
      for (let i = 0; i < this.maintenanceData.selection.length; ++i) {
        data.push(this.maintenanceData.selection[i].id);
      }
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
      http.requestWithTokenJson(
        "/auth_api/maintenance/deleteSmoe",
        "delete",
        { list: data },
        res => {
          if (!res.data.error) {
            this.$message.success("删除成功");
            // this.maintenanceData.page = 1;
            this.loadMaintenanceData();
          }else {
            this.$message.success("删除存在错误");
            // this.maintenanceData.page = 1;
            this.loadMaintenanceData();
          }
        },
        () => {}
      );
      })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      this.loadMaintenanceData();
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          http.requestWithToken(
            "/auth_api/maintenance",
            "delete",
            {
              id: row.id,
              deviceID: row.deviceId
            },
            res => {
              if (!res.data.error) {
                this.loadMaintenanceData();
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
                this.clearMultipleSelection();
              } else {
                this.$message({
                  type: "error",
                  message: "删除失败!"
                });
              }
            },
            () => {}
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      this.loadMaintenanceData();
    },
    setSearchText(searchText) {
      this.searchText = searchText;
    },
    // 表格相关
    loadMaintenanceData() {
      this.loadOtherBeetleType();
      http.requestWithToken(
        "/auth_api/maintenance1",
        "get",
        {
          condition: this.searchText,
          batch: this.searchBatch,
          town: this.searchTown,
          page: this.maintenanceData.page,
          limit: this.maintenanceData.limit,
          startDate: this.maintenanceData.startDate,
          endDate: this.maintenanceData.endDate
        },
        res => {
          this.maintenanceData.list = res.data.data;
          this.maintenanceData.total = res.data.totalNum;
          this.checkMultipleSelection();
          this.triggeredByPageChange = true;
        },
        () => {}
      );
    },
    clearMultipleSelection() {
      this.maintenanceData.multipleSelectionAll = [];
      this.maintenanceData.multipleSelection = [];
    },
    buttonLoadMaintenanceData() {
      this.maintenanceData.selection = [];
      this.clearMultipleSelection();
      this.loadMaintenanceData();
    },
    handleMaintenanceDataCurrentPageChanged(val) {
      this.triggeredByPageChange = true;
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
      //if (this.maintenanceData.multipleSelection[this.maintenanceData.page + ""].length > 0) {
        
      //}
     //alert("change")
     //alert(this.triggeredByPageChange)
      if (!this.triggeredByPageChange && this.maintenanceData.page > -1) {
        
        this.maintenanceData.mulitpleSelection[this.maintenanceData.page + ""] = val;
        setTimeout(()=> {
          //alert(JSON.stringify(this.maintenanceData.mulitpleSelection))
          this.calculateMultipleSelection();

        }, 500)
     // console.log(val);
      }
      this.triggeredByPageChange = false;
    },
    checkMultipleSelection() {
      this.maintenanceData.list.forEach((row, index) => {
        if (this.maintenanceData.multipleSelectionAll.indexOf(row["id"]) > -1) {
         this.$refs.table.toggleRowSelection(this.maintenanceData.list[index], true);
        }
      })
    },
    calculateMultipleSelection() {
      let tmp = [];
      for (var i = 0; i < this.maintenanceData.mulitpleSelection.length; ++i) {
        if (this.maintenanceData.mulitpleSelection[i] != null)
          tmp = tmp.concat(this.maintenanceData.mulitpleSelection[i])
      }
      //alert(tmp.length)
      //alert(JSON.stringify(tmp))
      this.maintenanceData.multipleSelectionAll = [];
      tmp.forEach(row => {
        this.maintenanceData.multipleSelectionAll =  this.maintenanceData.multipleSelectionAll.concat(row['id'])
      })
    //  alert(this.maintenanceData.multipleSelectionAll[1])
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
        batch:0,
        deviceId:"",
        workingContent: 0,
        drug: ""
      };
      this.EditMaintenanceDialog.form.longitude = data.longitude;
      this.EditMaintenanceDialog.form.deviceId = data.deviceId;
      this.EditMaintenanceDialog.form.batch = data.batch;
      this.EditMaintenanceDialog.form.altitude = data.altitude;
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
    // someExportExcel() {
    //   let data = [];

    //   for (let i = 0; i < this.maintenanceData.multipleSelectionAll.length; ++i) {

    //             data.push(this.maintenanceData.multipleSelectionAll[i]);
    //   }

    //   window.location =
    //     http.getBaseUrl() +
    //     "/maintenance/exportSome?data=" +
    //     data +
    //     "&token=" +
    //     sessionStorage["token"];


    //     this.loadMaintenanceData();
    //     this.clearMultipleSelection();

    // },
    someExportExcel() {
          window.location =
                  http.getBaseUrl() +
                  "/maintenance/export?startDate=" +
                  this.maintenanceData.startDate +
                  "&endDate=" +
                  this.maintenanceData.endDate +
                  "&token=" +
                  sessionStorage["token"];

      
    },
    exportExcel() {
              this.buttonLoadMaintenanceData();
//alert(this.maintenanceData.startDate);

      window.location =
        http.getBaseUrl() +
        "/maintenance/export?startDate=" +
        this.maintenanceData.startDate +
        "&endDate=" +
        this.maintenanceData.endDate +
        "&condition=" +
        this.searchText +
        "&batch=" +
        this.searchBatch +
        "&town=" +
        this.searchTown +
        "&token=" +
        sessionStorage["token"];

    },
    importExcel1(){

              alert("已上传，请更新");
        this.loadMaintenanceData();

    }
  },
  mounted() {
    this.loadMaintenanceData();
this.uploadUrl =
              http.getBaseUrl() +
              "/maintenance/import1?token=" +
              sessionStorage["token"];

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


