<template>
  <div>
    <div id="tool-row">
      <div>
        <el-input v-model="searchText" placeholder="用户名/姓名/地区" style="width: 150px"></el-input>
        <el-select v-model="roleType"   placeholder="用户类型" style="width: 150px">

          <el-option value="6" label="全部">全部</el-option>
          <el-option :value="1" label="省级用户" v-if="this.$store.state.user.role == 0">省级用户</el-option>
          <el-option :key="2" :value="2" label="市级用户" v-if="this.$store.state.user.role == 0">市级用户</el-option>
          <el-option :key="3" :value="3" label="县级用户" v-if="this.$store.state.user.role == 0">县级用户</el-option>
          <el-option
            :key="4"
            :value="4"
            label="管理员"
            v-if="this.$store.state.user.role == 3 || this.$store.state.user.role == 0 "
          >管理员</el-option>
          <el-option
            :key="5"
            :value="5"
            label="工人"
            v-if="this.$store.state.user.role == 4 || this.$store.state.user.role == 0"
          >工人</el-option>
        </el-select>
        <el-select v-model="activeType" placeholder="激活状态" style="width: 150px">
          <el-option value="2" label="全部">全部</el-option>
          <el-option value="1" label="是">是</el-option>
          <el-option value="0" label="否">否</el-option>
        </el-select>
        <el-button type="primary" @click="loadUser">搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="showAddUser">添加</el-button>
        <el-button type="primary" @click="showEditUser" :disabled="userData.selectedIndex == -1">修改</el-button>
        <el-button
          type="primary"
v-if="this.$store.state.user.role == 6"
          @click="handleUserDelete"

        >删除</el-button>

        <el-button type="primary" :disabled="userData.selectedIndex == -1" @click="handleRestPassword()">重置密码</el-button>
      </div>
    </div>
    <div style="padding-top:5px">
      <el-table border :data="userData.list" style="width: 100%" height="600">
        <el-table-column label width="50" align="center">
          <template scope="scope">
            <el-radio
              :label="scope.$index"
              v-model="userData.selectedIndex"
              @change.native="getCurrentRow(scope.$index)"
            >&nbsp</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" align="center"></el-table-column>
        <el-table-column label="用户类型" align="center">
          <template slot-scope="scope">{{userTypes[scope.row.role].label}}</template>
        </el-table-column>
        <el-table-column prop="province" label="省份" align="center"></el-table-column>
        <el-table-column prop="city" label="市区" align="center"></el-table-column>
        <el-table-column prop="area" label="县" align="center"></el-table-column>
        <el-table-column label="激活状态" align="center">
          <template slot-scope="scope">{{scope.row.active == 1 ? '激活' : '禁用'}}</template>
        </el-table-column>
        <!-- <el-table-column
          label="操作"
          align="center"
          v-if="this.$store.state.user.role == 0 || this.$store.state.user.role == 4"
        >
          <template slot-scope="scope">
            <el-button v-if="scope.row.role==5" size="mini">编辑关联</el-button>
          </template>
        </el-table-column> -->
      </el-table>
      <div class="block">
        <el-pagination
          background
          @current-change="handleUserDataCurrentPageChanged"
          :current-page.sync="userData.page"
          :page-size="10"
          layout="total, prev, pager, next"
          :total="userData.total"
        ></el-pagination>
      </div>
    </div>

    <!-- 用户添加&编辑对话框部分 -->
    <el-dialog :title="userInfoDialog.isAdd? '添加用户': '编辑用户'" :visible.sync="userInfoDialog.visible">
      <el-form
        :model="userInfoDialog.form"
        :label-position="labelposition"
        :rules="userInfoDialog.rules"
        ref="userInfoDialogForm"
      >
        <div id="userInfoDialogData">
          <div>
            <el-form-item
              label="用户名"
              label-width="80px"
              size="mini"
              prop="username"
              v-if="userInfoDialog.isAdd"
            >
              <el-input
                v-model="userInfoDialog.form.username"
                autocomplete="off"
                style="width: 150px"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="密码"
              label-width="80px"
              size="mini"
              prop="password"
              v-if="userInfoDialog.isAdd"
            >
              <el-input
                v-model="userInfoDialog.form.password"
                auto-complete="off"
                type="password"
                style="width: 150px"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="重复密码"
              label-width="80px"
              size="mini"
              prop="repeat_password"
              v-if="userInfoDialog.isAdd"
            >
              <el-input
                v-model="userInfoDialog.form.repeat_password"
                auto-complete="off"
                type="password"
                style="width: 150px"
              ></el-input>
            </el-form-item>
            <el-form-item label="姓名" label-width="80px" size="mini" prop="name">
              <el-input v-model="userInfoDialog.form.name" auto-complete="off" style="width: 150px"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" label-width="80px" size="mini" prop="email">
              <el-input
                v-model="userInfoDialog.form.email"
                auto-complete="off"
                style="width: 150px"
              ></el-input>
            </el-form-item>
            <el-form-item label="手机" label-width="80px" size="mini" prop="phone">
              <el-input
                v-model="userInfoDialog.form.phone"
                auto-complete="off"
                style="width: 150px"
              ></el-input>
            </el-form-item>
            <el-form-item label="激活" label-width="80px" size="mini" prop="active">
              <el-checkbox name="active" v-model="userInfoDialog.form.active"></el-checkbox>
            </el-form-item>
          </div>
          <div v-if="userInfoDialog.isAdd">
            <el-form-item label="角色" size="mini" label-width="80px" prop="role">
              <el-select v-model="userInfoDialog.form.role" placeholder="用户类型" style="width: 150px">
                <el-option
                  :key="1"
                  :value="1"
                  label="省级用户"
                  v-if="this.$store.state.user.role == 0"
                >省级用户</el-option>
                <el-option
                  :key="2"
                  :value="2"
                  label="市级用户"
                  v-if="this.$store.state.user.role == 0"
                >市级用户</el-option>
                <el-option
                  :key="3"
                  :value="3"
                  label="县级用户"
                  v-if="this.$store.state.user.role == 0"
                >县级用户</el-option>
                <el-option
                  :key="4"
                  :value="4"
                  label="管理员"
                  v-if="this.$store.state.user.role == 3 || this.$store.state.user.role == 0 "
                >管理员</el-option>
                <el-option
                  :key="5"
                  :value="5"
                  label="工人"
                  v-if="this.$store.state.user.role == 4"
                >工人</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="省" label-width="80px" size="mini" prop="provinceCode">
              <el-select
                placeholder="省份"
                style="width: 150px"
                v-model="userInfoDialog.form.provinceCode"
                @change="loadCity"
              >
                <el-option
                  v-for="item in userInfoDialog.provinces"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="市"
              label-width="80px"
              size="mini"
              prop="cityCode"
              v-if="userInfoDialog.form.role > 1"
            >
              <el-select
                placeholder="市"
                style="width: 150px"
                v-model="userInfoDialog.form.cityCode"
                @change="loadArea"
              >
                <el-option
                  v-for="item in userInfoDialog.cities"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="县"
              label-width="80px"
              size="mini"
              prop="areaCode"
              v-if="userInfoDialog.form.role > 2"
            >
              <el-select
                placeholder="县"
                style="width: 150px"
                v-model="userInfoDialog.form.areaCode"
              >
                <el-option
                  v-for="item in userInfoDialog.areas"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userInfoDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click.native.prevent="handleUserDataSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import http from "../../utils/http";
export default {
  name: "UserMgr",
  data() {
    return {
      labelposition: "left",
      searchText: "",
      userTypes: [
        { label: "超级用户", value: "0" },
        { label: "省级用户", value: "1" },
        { label: "市级用户", value: "2" },
        { label: "县级用户", value: "3" },
        { label: "管理员", value: "4" },
        { label: "工人", value: "5" }
      ],
      roleType: "",
      activeType: "",
      userData: {
        list: [],
        page: 1,
        limit: 10,
        total: 0,
        selectedIndex: -1

      },
      userInfoDialog: {
        isAdd: true,
        title: "",
        visible: false,
        form: {
          username: "",
          password: "",
          provinceCode: "",
          areaCode: "",
          cityCode: ""
        },
        provinces: [],
        cities: [],
        areas: [],
        rules: {
          username: [
            { required: true, message: "请输入用户名", trigger: "blur" }
          ],
          password: [
            { required: true, message: "请输入密码", trigger: "blur" }
          ],
          repeat_password: [
            { required: true, message: "请再次输入密码", trigger: "blur" },
            {
              validator: (rule, value, callback) => {
                if (value != this.userInfoDialog.form.password) {
                  return callback(new Error("两次输入的密码不一致"));
                } else {
                  callback();
                }
              }
            }
          ],
          role: [{ required: true, message: "请选择角色", trigger: "blur" }],
          provinceCode: [
            { required: true, message: "请选择省", trigger: "blur" }
          ],
          cityCode: [{ required: true, message: "请选择市", trigger: "blur" }],
          areaCode: [{ required: true, message: "请选择县", trigger: "blur" }]
        }
      }
    };
  },
  methods: {
    handleRestPassword() {
      let username = this.userData.list[this.userData.selectedIndex].username;
      http.requestWithToken('/auth_api/user/reset_password', 'post', {targetUsername: username}, (res) => {
        if (!res.data.error) {
          this.$message.success('重置密码成功')
        }
        if (res.data.error) {
          this.$message.error('重置密码失败')
        }
      })
    },
    handleUserDataSubmit() {
      if (!this.userInfoDialog.isAdd) {
        this.handleUserEdit()
        return;
      }
      let formData = this.userInfoDialog.form;
      let role = this.userInfoDialog.form.role;
      switch (role) {
        case 1:
          // 省级用户
          formData.adcode = formData.provinceCode;
          break;
        case 2:
          // 市级用户
          formData.adcode = formData.cityCode;
          break;
        case 3:
          // 县级用户
          formData.adcode = formData.areaCode;
          break;
        case 4:
          // 管理员
          formData.adcode = formData.areaCode;
          break;
        case 5:
          // 工人
          formData.adcode = formData.areaCode;
          break;
      }

      this.$refs.userInfoDialogForm.validate(valid => {
        if (valid) {
          http.requestWithTokenJson(
            "/auth_api/user",
            "post",
            formData,
            res => {
              if (res.data.error) {
                this.$message({
                  message: res.data.message,
                  type: "error"
                });
              } else {
                this.$message({
                  message: "添加成功",
                  type: "success"
                });
                this.userInfoDialog.visible = true;
                this.loadUser();
              }
            },
            () => {}
          );
        } else {
        }
      });
    },

    handleUserDelete() {
      let username=this.userData.list[this.userData.selectedIndex].username;
      http.requestWithToken(
           "/auth_api/user_forbid",
           "put",
           {
              targetUser:username
           },
           res => {
                  if (!res.data.error) {
                      this.$message({
                      message: "删除成功",
                      type: "success"
                    });
                  this.loadUser();
                  } else {
                              this.$message({
                              message: "删除失败",
                              type: "error"
                         });
                  }
           },
           () => {}
      );
    },

    loadUserActive() {
          if(this.roleType=="6"){
              this.roleType=""
          }
          if(this.activeType=="2"){
              this.activeType=""
          }
          http.requestWithToken(
            "/auth_api/user_list_active",
            "get",
            {
                searchText: this.searchText,
                limit: this.userData.limit,
                page: this.userData.page,
                roleType: this.roleType,
                active: this.activeType
            },
            res => {
                this.userData.list = res.data.data;
                this.userData.page = res.data.currentPage;
                this.userData.total = res.data.totalNum;
                this.userData.selectedIndex = -1;
            },
            () => {}
          );
        },
    handleUserEdit() {
      http.requestWithTokenJson(
        "/auth_api/user",
        "put",
        this.userInfoDialog.form,
        res => {
          if (!res.data.error) {
            this.$message({
              message: "修改成功",
              type: "success"
            });
            this.userInfoDialog.visible = false;
            this.loadUser();
          } else {
            this.$message({
              message: "修改失败",
              type: "error"
            });
          }
        },
        () => {}
      );
    },

    loadUser() {
    if(this.roleType=="6"){
                  this.roleType=""
              }
              if(this.activeType=="2"){
                  this.activeType=""
              }
      http.requestWithToken(
        "/auth_api/user_list",
        "get",
        {
          searchText: this.searchText,
          limit: this.userData.limit,
          page: this.userData.page,
          roleType: this.roleType,
          active: this.activeType
        },
        res => {
          this.userData.list = res.data.data;
          this.userData.page = res.data.currentPage;
          this.userData.total = res.data.totalNum;
          this.userData.selectedIndex = -1;
        },
        () => {}
      );
    },
    handleUserDataCurrentPageChanged(val) {
      this.userData.page = val;
      this.loadUser();
    },
    showAddUser() {
      this.userInfoDialog.isAdd = true;
      this.userInfoDialog.visible = true;
      this.userInfoDialog.form = {
        province: "",
        area: "",
        city: "",
        active: true
      };
      this.loadProvince();
    },
    showEditUser() {
      this.userInfoDialog.isAdd = false;
      this.userInfoDialog.visible = true;
      this.userInfoDialog.form = {
        username: this.userData.list[this.userData.selectedIndex].username,
        name: this.userData.list[this.userData.selectedIndex].name,
        active: this.userData.list[this.userData.selectedIndex].active,
        phone: this.userData.list[this.userData.selectedIndex].phone,
        email: this.userData.list[this.userData.selectedIndex].email
      };

      this.loadProvince();
    },
    loadProvince() {
      http.requestWithToken(
        "/auth_api/dist/provinces",
        "get",
        {},
        res => {
          console.log(res.data);
          this.userInfoDialog.provinces = res.data;
          this.userInfoDialog.form.province = "";
          this.userInfoDialog.form.city = "";
          this.userInfoDialog.form.area = "";
          this.userInfoDialog.cities = [];
          this.userInfoDialog.areas = [];
          // this.userInfoDialog.form.area = ''
        },
        () => {}
      );
    },
    loadCity() {
      http.requestWithToken(
        "/auth_api/dist/cities",
        "get",
        { id: this.userInfoDialog.form.provinceCode },
        res => {
          this.userInfoDialog.cities = res.data;
          this.userInfoDialog.form.city = "";
          this.userInfoDialog.form.area = "";
          this.userInfoDialog.areas = [];
        },
        () => {}
      );
    },
    loadArea() {
      http.requestWithToken(
        "/auth_api/dist/areas",
        "get",
        { id: this.userInfoDialog.form.cityCode },
        res => {
          this.userInfoDialog.form.area = "";
          this.userInfoDialog.areas = res.data;
        },
        () => {}
      );
    }
  },
  mounted() {
    this.loadUser();
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
