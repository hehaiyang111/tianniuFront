<template>
<div id="login-form-container" style="height:100%; padding:0px;">
  <el-form
    :model="ruleForm2"
    :rules="rules2"
    ref="ruleForm2"
    label-position="left"
    label-width="60px"
    class="demo-ruleForm login-container"
    id="login-form"
  >
    <h3 class="title">系统登录</h3>
    <h2 class="title1">松墨天牛高效诱捕器管理和数据分析系统</h2>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码"></el-input>
    </el-form-item>
    <!-- <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox> -->
    <el-form-item style="width:100%;">
      <el-button
        type="primary"
        style="width:100%;"
        @click.native.prevent="handleSubmit2"
        :loading="logining"
      >登录</el-button>
      <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->

    </el-form-item>
<!--< class="title3">  版权: 福建农林大学，福建辰康农林科技有限公司</label>-->
  </el-form>
  </div>
</template>
<script>
import http from '../utils/http'
export default {
  data() {
    return {
      logining: false,
      ruleForm2: {
        account: "",
        checkPass: ""
      },
      rules2: {
        account: [
          { required: true, message: "请输入账号", trigger: "blur" }
          //{ validator: validaePass }
        ],
        checkPass: [
          { required: true, message: "请输入密码", trigger: "blur" }
          //{ validator: validaePass2 }
        ]
      },
      checked: true
    };
  },
  methods: {
    handleReset2() {
      this.$refs.ruleForm2.resetFields();
    },
    handleSubmit2(ev) {
      var _this = this;
      this.$refs.ruleForm2.validate(valid => {
        if (valid) {
          //_this.$router.replace('/table');
          this.logining = true;
          //NProgress.start();
          var loginParams = {
            username: this.ruleForm2.account,
            password: this.ruleForm2.checkPass
          };
          http.requestWithoutToken('/login', 'post', loginParams, (res)=>{
              console.log(res.data);
              sessionStorage['token'] = res.data.token;
              http.requestWithToken('/auth_api/test', 'get', {}, (res)=>{
                this.$router.push({path:'/'})
              }, (res)=>{
              })
              }, (res)=>{
                this.$message({
                  message: '登录失败',
                  type: 'error'
                })
                this.logining = false
              })
          /*ata
            requestLogin(loginParams).then(data => {
              this.logining = false;
              //NProgress.done();
              let { msg, code, user } = data;
              if (code !== 200) {
                this.$message({
                  message: msg,
                  type: 'error'
                });
              } else {
                sessionStorage.setItem('user', JSON.stringify(user));
                this.$router.push({ path: '/table' });
              }
            });
            */
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  }
};
</script>
<style lang="scss" >
#login-form-container {
  margin-top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
}
.login-container {
  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  // margin: 180px auto;
  width: 600px;
  padding: 300px 100px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .title {

    margin: -250px auto 0px auto;
    text-align: center;
    color: #505458;
  }

  .remember {
    margin: 0px 0px 0px 0px;
  }
}
.title1{
          font_size: 20px Extra large ！important;
          margin: 30px auto 40px auto;
          text-align: center;
          color: #505458;
        }
        .title3{

                  margin-left: 30%;
                  text-align: center;

                }
</style>
