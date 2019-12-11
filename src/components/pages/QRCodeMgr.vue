<template>
  <div>
    <div id="tool-row">
      <div></div>
      <div>
        <el-button
          type="primary"
          @click="showQRDataInfoDialog"
          v-if="this.$store.state.user.role == 3"
        >添加</el-button>
        <el-button
          type="primary"
          @click="showAssignQRCodeDialog()"
          v-if="this.$store.state.user.role == 4"
        >分配二维码</el-button>
        <el-button
          type="primary"
          @click="showQRWorkerDialog()"
          v-if="this.$store.state.user.role == 4"
        >编辑二维码分配</el-button>
        <el-button type="primary" @click="handleDownloadID">ID下载</el-button>
        <el-button type="primary" @click="handleDownload">二维码下载</el-button>
      </div>
    </div>
    <div style="padding-top:5px">
      <el-table border :data="QRData.list" style="width: 100%" height="600">
        <el-table-column prop="id" label="id" align="center"></el-table-column>
        <el-table-column prop="province" label="省" align="center"></el-table-column>
        <el-table-column prop="city" label="市" align="center"></el-table-column>
        <el-table-column prop="area" label="县" align="center"></el-table-column>
        <el-table-column
          prop="manager"
          label="管理员"
          align="center"
          v-if="this.$store.state.user.role == 3"
        ></el-table-column>
      </el-table>
    </div>
    <div class="block">
      <el-pagination
        background
        @current-change="handleQRDataCurrentPageChanged"
        :current-page.sync="QRData.page"
        :page-size="10"
        layout="total, prev, pager, next"
        :total="QRData.total"
      ></el-pagination>
    </div>
    <el-dialog title="编辑二维码分配" :visible.sync="QRWorkerDialog.visible">
      <el-tabs v-model="QRWorkerDialog.tabName">
        <el-tab-pane label="工人-设备关联" name="0">
          <div style="display:flex; justify-content: space-between;">
            <div>
              <el-form>
                <el-form-item label="工人" label-width="80px">
                  <el-select
                    v-model="QRWorkerDialog.workerSide.selectedWorker"
                    @change="workerSideLoadAssociatedDevices"
                  >
                    <el-option
                      v-for="item in QRWorkerDialog.workerSide.workerList"
                      :key="item.username"
                      :value="item.username"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div>
              <el-transfer
                :titles="['可分配', '已分配']"
                :data="QRWorkerDialog.workerSide.deviceList"
                v-model="QRWorkerDialog.workerSide.selectedDevices"
              ></el-transfer>
            </div>
          </div>
        </el-tab-pane>

        <!-- 由于现在是工人与设备一对多，所以下面这个也去掉 -->
        <!-- <el-tab-pane label="设备-工人关联" name="1">
          <div style="display:flex; justify-content: space-between;">
            <div>
              <el-form>
                <el-form-item label="设备" label-width="80px">
                  <el-select>
                    <option
                      v-for="item in QRWorkerDialog.workerSide.workerList"
                      :key="item.username"
                      :value="item.username"
                    ></option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div>
              <el-transfer :titles="['可分配', '已分配']"></el-transfer>
            </div>
          </div>
        </el-tab-pane>-->
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button @click="QRWorkerDialog.visible = false">取 消</el-button> -->
        <el-button
          type="primary"
          @click.native.prevent="handleQRWorkerDialogSubmit"
          :loading="QRWorkerDialog.saving"
        >保 存</el-button>
      </div>
    </el-dialog>

    <!-- 添加二维码对话框 -->
    <el-dialog title="批量添加二维码" :visible.sync="QRDataInfoDialog.visible" width="30%">
      <div style="overflow-y: scroll; height: 300px">
        <el-table :data="QRDataInfoDialog.managerList">
          <el-table-column prop="username" label="管理员"></el-table-column>
          <el-table-column label="分配数量">
            <template slot-scope="scope">
              <el-input-number
                size="mini"
                v-model="QRDataInfoDialog.numList[scope.$index]"
                :min="0"
              ></el-input-number>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="QRDataInfoDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click.native.prevent="handleAddQRCodeDataSubmit"
        :loading="assignCode"
        >确 定</el-button>
      </div>
    </el-dialog>

    <!-- 为工人分配二维码对话框 -->
    <el-dialog title="分配二维码" :visible.sync="AssignQRCodeDialog.visible" width="30%">
      <div>当前可分配设备数量:{{AssignQRCodeDialog.availableNum}}</div>
      <div style="overflow-y: scroll; height: 300px">
        <el-table :data="AssignQRCodeDialog.workerList">
          <el-table-column prop="username" label="工人"></el-table-column>
          <el-table-column label="分配数量">
            <template slot-scope="scope">
              <el-input-number
                size="mini"
                v-model="AssignQRCodeDialog.numList[scope.$index]"
                v-bind:value="AssignQRCodeDialog.numList[scope.$index]"
                :min="0"
                @change="handleAssiagnQRCodeNumChange(scope.$index)"
              ></el-input-number>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="AssignQRCodeDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click.native.prevent="handleAssignQRCodeDataSubmit"
        :loading="assignQRCode"
        >确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import http from "../../utils/http";
export default {
  data() {
    return {
          assignCode: false,
          assignQRCode: false,
      // 为管理员生成二维码对话框
      QRDataInfoDialog: {
        visible: false,
        form: {
          num: 0,
          username: ""
        },
        managerList: [],
        numList: []
      },
      QRWorkerDialog: {
        tabName: "0",
        visible: false,
        saving: false,
        workerSide: {
          workerList: [],
          deviceList: [],
          selectedDevices: [],
          selectedWorker: ""
        },
        deviceSide: {
          workerList: [],
          deviceList: []
        }
      },
      // 分配二维码对话框
      AssignQRCodeDialog: {
        totalAvailableCount: 0,
        availableNum: 0,
        visible: false,
        workerList: [],
        numList: []
      },
      searchText: "",
      QRData: {
        selectedIndex: -1,
        list: [],
        page: 1,
        limit: 10,
        total: 0
      }
    };
  },
  methods: {
    // 下载
    handleDownload() {
      let BASE_URL = "";
      if (window.location.toString().indexOf("39.108.184.47") > -1) {
        //BASE_URL = "http://47.103.66.70:8081";
       // BASE_URL = "http://47.103.66.70:8081";
        BASE_URL = "http://39.108.184.47:8081";
      } else {
        BASE_URL = "http://localhost:8081";
      }
      window.location = BASE_URL + "/QRCode?token=" + sessionStorage['token'] 
    },
    handleDownloadID() {
          window.location =
                      http.getBaseUrl() +
                      "/export/QRCodeList?adcode=" +
                      this.area +
                      "&token=" +
                      sessionStorage["token"];
        },
    showQRDataInfoDialog() {
      this.QRDataInfoDialog.visible = true;
      this.loadManagers();
    },
    loadCanDevices() {
          this.QRWorkerDialog.workerSide.deviceList = [];

              http.requestWithToken(
                "/auth_api/device_can_associate",
                "get",
                {},
                res => {
                  this.QRWorkerDialog.workerSide.deviceList = [];
                  for (let i = 0; i < res.data.data.length; ++i) {
                    this.QRWorkerDialog.workerSide.deviceList.push({
                      key: res.data.data[i],
                      label: res.data.data[i]
                    });
                  }
                  for (
                    let i = 0;
                    i < this.QRWorkerDialog.workerSide.selectedDevices.length;
                    ++i
                  ) {
                    this.QRWorkerDialog.workerSide.deviceList.push({
                      key: this.QRWorkerDialog.workerSide.selectedDevices[i],
                      label: this.QRWorkerDialog.workerSide.selectedDevices[i]
                    });
                  }
                },
                () => {}
              );

        },
    loadDevice() {
      http.requestWithToken(
        "/auth_api/device_list",
        "get",
        { page: this.QRData.page, limit: this.QRData.limit },
        res => {
          this.QRData.list = res.data.data;
          this.QRData.total = res.data.totalNum;

        },
        () => {}
      );
    },
    loadManagers() {
      http.requestWithToken(
        "/auth_api/user_list",
        "get",
        { roleType: 4, page: 1, limit: 9999, searchText: "" },
        res => {
          this.QRDataInfoDialog.managerList = res.data.data;
          this.QRDataInfoDialog.numList = [];
          for (let i = 0; i < res.data.data.length; ++i) {
            this.QRDataInfoDialog.numList[i] = 0;
          }
        },
        () => {}
      );
    },
    handleQRDataCurrentPageChanged(val) {
      this.QRData.page = val;
      this.loadDevice();
    },
    handleAddQRCodeDataSubmit() {
      let data = [];
      this.assignCode=true;
      for (let i = 0; i < this.QRDataInfoDialog.managerList.length; ++i) {
        data.push({
          username: this.QRDataInfoDialog.managerList[i].username,
          num: this.QRDataInfoDialog.numList[i]
        });
      }
      http.requestWithTokenJson(
        "/auth_api/QRcode",
        "post",
        data,
        res => {
          if (!res.data.error) {
          this.assignCode=false;
            alert("成功");

          }
          this.assignCode=false;
          this.loadDevice();
          this.QRDataInfoDialog.visible = false;
        },
        () => {}
      );

    },
    handleQRDataCurrentPageChanged() {
      this.loadDevice();
    },
    // 分配二维码对话框
    showQRWorkerDialog() {
      this.QRWorkerDialog.visible = true;
      // this.workerSideLoadDevices();

      // 清空根据工人分配的
      this.QRWorkerDialog.workerSide.selectedWorker = "";
      this.QRWorkerDialog.workerSide.selectedDevices = [];
      this.workerSideLoadWorkerList();
      this.loadCanDevices()
    },

    // 编辑工人-诱捕器加载诱捕器
    workerSideLoadAssociatedDevices() {
      this.QRWorkerDialog.workerSide.deviceList = [];
      http.requestWithToken(
        "/auth_api/device_relation",
        "get",
        { worker: this.QRWorkerDialog.workerSide.selectedWorker },
        res => {
          this.QRWorkerDialog.workerSide.selectedDevices = res.data.data;
          http.requestWithToken(
            "/auth_api/device_can_associate",
            "get",
            {},
            res => {
              this.QRWorkerDialog.workerSide.deviceList = [];
              for (let i = 0; i < res.data.data.length; ++i) {
                this.QRWorkerDialog.workerSide.deviceList.push({
                  key: res.data.data[i],
                  label: res.data.data[i]
                });
              }
              for (
                let i = 0;
                i < this.QRWorkerDialog.workerSide.selectedDevices.length;
                ++i
              ) {
                this.QRWorkerDialog.workerSide.deviceList.push({
                  key: this.QRWorkerDialog.workerSide.selectedDevices[i],
                  label: this.QRWorkerDialog.workerSide.selectedDevices[i]
                });
              }
            },
            () => {}
          );
        },
        () => {}
      );
    },
    workerSideLoadWorkerList() {
      http.requestWithToken(
        "/auth_api/user_list",
        "get",
        { page: 1, limit: 9999, searchText: "" },
        res => {
          this.QRWorkerDialog.workerSide.workerList = res.data.data;
        },
        () => {}
      );
    },
    handleQRWorkerDialogSubmit() {
      console.log(this.QRWorkerDialog.workerSide.selectedDevices);
      let myWorker=this.QRWorkerDialog.workerSide.selectedWorker;
      if(myWorker==null || myWorker==""){
            alert("请先选择用户");
      }
      else if (this.QRWorkerDialog.tabName == "0" && myWorker!=null && myWorker!="") {
        this.QRWorkerDialog.saving = true;
        http.requestWithTokenJson(
          "/auth_api/device_relation",
          "put",
          {
            deviceIds: this.QRWorkerDialog.workerSide.selectedDevices,
            userId: this.QRWorkerDialog.workerSide.selectedWorker
          },
          res => {
            this.$message({
              message: "保存成功",
              type: "success"
            });
            this.QRWorkerDialog.saving = false;
          },
          () => {}
        );
      }
    },
    // 分配二维码对话框
    showAssignQRCodeDialog() {
      this.AssignQRCodeDialog.visible = true;
      // 加载工人列表
      http.requestWithToken(
        "/auth_api/user_list",
        "get",
        { page: 1, limit: 9999, searchText: "" },
        res => {
          this.AssignQRCodeDialog.workerList = res.data.data;
          this.AssignQRCodeDialog.numList = [];
          for (let i = 0; i < res.data.data.length; ++i) {
            this.AssignQRCodeDialog.numList[i] = 0;
          }
        },
        () => {}
      );
      http.requestWithToken(
        "/auth_api/device_can_associate",
        "get",
        {},
        res => {
          this.AssignQRCodeDialog.totalAvailableCount = res.data.data.length;
          this.AssignQRCodeDialog.availableNum = this.AssignQRCodeDialog.totalAvailableCount;
        },
        () => {}
      );
    },
    handleAssiagnQRCodeNumChange(index) {
      // 这里计算当前可分配的数量
      let sum = 0;
      for (let i = 0; i < this.AssignQRCodeDialog.numList.length; ++i) {
        sum += this.AssignQRCodeDialog.numList[i];
      }
      let currentAvailable = this.AssignQRCodeDialog.totalAvailableCount - sum;
      // 如果可分配数量小于0
      if (currentAvailable < 0) {
        let tmp = this.AssignQRCodeDialog.numList[index] + currentAvailable;
        let sum = 0;
        for (let i = 0; i < this.AssignQRCodeDialog.numList.length; ++i) {
          if (i != index) sum += this.AssignQRCodeDialog.numList[i];
          else sum += tmp;
        }
        this.AssignQRCodeDialog.availableNum =
          this.AssignQRCodeDialog.totalAvailableCount - sum;
        console.log(
          "now:" +
            tmp +
            " available:" +
            this.AssignQRCodeDialog.availableNum +
            "sum:" +
            sum
        );
        this.$nextTick(() => {
          this.$set(this.AssignQRCodeDialog.numList, index, tmp);
          // console.log(this.$refs["AssignQRCodeInputNumber" + index]);
        });
        // this.$forceUpdate();
      } else {
        this.AssignQRCodeDialog.availableNum = currentAvailable;
      }
    },
    handleAssignQRCodeDataSubmit() {
      let data = [];
      this.assignQRCode=true;
      for (let i = 0; i < this.AssignQRCodeDialog.numList.length; ++i) {
        if (this.AssignQRCodeDialog.numList[i] > 0) {
          data.push({
            worker: this.AssignQRCodeDialog.workerList[i].username,
            num: this.AssignQRCodeDialog.numList[i]
          });
        }
      }
      console.log(data);
      http.requestWithTokenJson(
        "/auth_api/device_relation",
        "post",
        data,
        res => {
          if (!res.data.error) {
            this.assignQRCode=false;
            this.$message({
              message: "分配成功",
              type: "success"
            });
            this.AssignQRCodeDialog.visible = false;
          }
          this.assignQRCode=false;
        },
        () => {}
      );
    }
  },
  mounted() {
    this.loadDevice();
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


