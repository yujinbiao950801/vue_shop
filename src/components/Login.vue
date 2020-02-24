<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form label-width="0px" class="login_form" :model="loginFormData" :rules="rules" ref="loginForm">
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" placeholder="用户名" v-model="loginFormData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" placeholder="密码" type="password" v-model="loginFormData.password"></el-input>
                </el-form-item>
                <el-form-item class="login_button">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="loginFormReset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      loginFormData: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在5到10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在6到10个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    loginFormReset () {
      this.$refs.loginForm.resetFields()
      this.loginFormData.username = ''
      this.loginFormData.password = ''
    },
    login () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          let res = this.$axios.post('login', this.loginFormData)
          res.then(data => {
            // console.log(data)
            if (data.status !== 200) {
              return this.$message.error('登录失败！')
            }
            this.$message.success('登录成功！')
            window.sessionStorage.setItem('token', data.data.data.token)
            this.$router.push('/home')
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.login_button {
  display: flex;
  justify-content: flex-end;
}
</style>
