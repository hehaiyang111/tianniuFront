<template>
  <div class="container">
    <div class="header">
      <el-row>
        <el-col :span="1">
          <div class="tools" @click.prevent="collapse">
            <i class="fa fa-align-justify"></i>
          </div>
        </el-col>
        <el-col :span="5" class="logo">松墨天牛高效诱捕器管理和数据分析系统</el-col>
      </el-row>
    </div>
    <div class="main">
      <aside :class="collapsed?'menu-collapsed':'menu-expanded'">
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          @open="handleopen"
          @close="handleclose"
          @select="handleselect"
          unique-opened
          router
        >
          <template v-for="(item, index) in menus">
            <el-submenu :index="index">
              <template slot="title">{{item.name}}</template>
              <el-menu-item
                v-for="child in item.subMenus"
                :key="'/' + child.path"
                :index="'/' + child.path"
                :class="$route.path==child.path?'is-active':''"
              >{{child.name}}
              </el-menu-item>

            </el-submenu>
            <!-- <el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item> -->
          </template>
          <!-- <el-dropdown-item>我的消息</el-dropdown-item> -->
                                                <el-dropdown-item @click.native="showChangePasswordDialog">修改密码</el-dropdown-item>
                                                <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
        </el-menu>
      </aside>
      <div class="content-container">
        <div style="height: 40px; padding-left: 20px; font-size: 20px">
          {{$route.name}}
        </div>

        <div class="content-wrapper">
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </div>
        <!-- </div> -->
      </div>
    </div>
    <el-dialog :visible.sync="changePasswordDialog.visible" title="修改密码" width="25%">
      <el-form>
        <el-form-item label="原密码">
          <el-input type="password" v-model="changePasswordDialog.orgPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" v-model="changePasswordDialog.password"></el-input>
        </el-form-item>
        <!-- <el-form-item label="重复密码">
          <el-input type="password" v-model="changePasswordDialog.rePassword"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changePasswordDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click.native.prevent="handleChangePasswordSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import http from "../utils/http";
export default {
  data() {
    return {
      changePasswordDialog: {
        visible: false,
        orgPassword: '',
        password: '',
        rePassword: ''
      },
      sysName: "VUEADMIN",
      collapsed: false,
      sysUserName: "",
      sysUserAvatar: "",
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      menus: []
    };
  },
  methods: {
    showChangePasswordDialog() {
      this.changePasswordDialog.orgPassword = '';
      this.changePasswordDialog.password = '';
      this.changePasswordDialog.rePassword = '';
      this.changePasswordDialog.visible = true;
    },
    handleChangePasswordSubmit() {
      http.requestWithToken('/auth_api/user/password', 'put', {
        currentPassword: this.changePasswordDialog.orgPassword,
        newPassword: this.changePasswordDialog.password
      }, (res) => {
        if (res.data.error) {
          this.$message.error('修改失败')
        }
        if (!res.data.error) {
          this.$message.success('修改成功')
          this.changePasswordDialog.visible = false;
        }

      })
    },
    onSubmit() {
      console.log("submit!");
    },
    handleopen() {
      //console.log('handleopen');
    },
    handleclose() {
      //console.log('handleclose');
    },
    handleselect: function(a, b) {},
    //退出登录
    logout: function() {
      var _this = this;
      this.$confirm("确认退出吗?", "提示", {
        //type: 'warning'
      })
        .then(() => {
          sessionStorage.removeItem("user");
          _this.$router.push("/login");
        })
        .catch(() => {});
    },
    //折叠导航栏
    collapse: function() {
      this.collapsed = !this.collapsed;
    },
    showMenu(i, status) {
      this.$refs.menuCollapsed.getElementsByClassName(
        "submenu-hook-" + i
      )[0].style.display = status ? "block" : "none";
    }
  },
  mounted() {
    if (sessionStorage["token"]) {
      http.requestWithToken(
        "/auth_api/user",
        "get",
        {},
        res => {
          this.$store.state.user = res.data;
        },
        () => {}
      );
    } else {
      this.$router.push("/login");
    }

    http.requestWithToken(
      "/auth_api/menu",
      "get",
      {},
      res => {
        this.menus = res.data;
      },
      () => {}
    );
  }
};
</script>


<style scoped lang="scss">
	.container {
		// position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
    height: 100%;
    box-sizing: border-box;
		.header {
			height: 60px;
			line-height: 60px;
			background: #2cabe3;
			color:#fff;
			.userinfo {
      text-align: right;
      padding-right: 35px;
      float: right;
      .userinfo-inner {
        cursor: pointer;
        color: #fff;
        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin: 10px 0px 10px 10px;
          float: right;
        }
      }
    }
    .logo {
      width: 460px;
      height: 60px;
      font-size: 22px;
      padding-left: 0px;
      padding-right: 20px;
    }
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			bottom: 0px;
      width: 100%;
      height: calc(100% - 60px);
			aside {
				flex:0 0 230px;
				width: 230px;
				.el-menu{
					height: 100%;
				}
				.collapsed{
					width:60px;
					.item{
						position: relative;
					}
					.submenu{
						position:absolute;
						top:0px;
						left:60px;
						z-index:99999;
						height:auto;
						display:none;
					}

				}
			}
			.menu-collapsed{
				margin-left: -250px;
			}
			.menu-expanded{
				flex:0 0 230px;
				width: 230px;
			}
			
		}
	}

  .content-container {
				overflow-y: scroll;
        box-sizing: border-box;
				padding: 20px;
        width: 100%;
				.breadcrumb-container {
					.title {
						width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
				}
				.content-wrapper {
					background-color: #fff;
          height: calc(100% - 40px);
				}
			}
</style>
