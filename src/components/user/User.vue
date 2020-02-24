<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList" @keyup.enter.native="getUserList" @blur="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data = "userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="small" @click="allotRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>

    <el-dialog
    title="添加用户"
    :visible.sync="dialogVisible"
    width="30%" @close="addDialogClosed">
    <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
    </el-dialog>

    <el-dialog
    title="修改用户信息"
    :visible.sync="editDialogVisible"
    width="30%" @close="editDialogClosed">
    <el-form :model="editForm" ref="editFormRef" :rules="editFormRules" label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUser">确 定</el-button>
    </span>
    </el-dialog>

    <el-dialog
    title="分配角色"
    :visible.sync="allotRoleDialogVisible"
    width="30%" @close="allotRoleDialogClosed">
    <p>当前的用户：{{allotRoleUserInfo.username}}</p>
    <p>当前的角色：{{allotRoleUserInfo.role_name}}</p>
    <el-select v-model="selectedRoleId" placeholder="请选择">
      <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
    </el-select>
    <span slot="footer" class="dialog-footer">
      <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]+)$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确格式的邮箱'))
    }
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号码'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      roleList: [],
      selectedRoleId: '',
      total: 0,
      allotRoleUserInfo: {},
      dialogVisible: false,
      editDialogVisible: false,
      allotRoleDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在5到15个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$axios.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    handleCurrentChange (newpagenum) {
      this.queryInfo.pagenum = newpagenum
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      const { data: res } = await this.$axios.put('users/' + userInfo.id + '/state/' + userInfo.mg_state)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
    async showEditDialog (id) {
      const { data: res } = await this.$axios.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$axios.post('users', this.addForm)
          if (res.meta.status !== 200) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          this.getUserList()
          this.dialogVisible = false
        }
      })
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$axios.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error('修改用户资料失败')
          }
          this.$message.success('修改用户资料成功')
          this.getUserList()
          this.editDialogVisible = false
        }
      })
    },
    async deleteUser (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    async allotRole (userInfo) {
      this.allotRoleUserInfo = userInfo
      this.allotRoleDialogVisible = true
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      // console.log(res.data)
    },
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$axios.put('users/' + this.allotRoleUserInfo.id + '/role', {
        rid: this.selectedRoleId
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.allotRoleDialogVisible = false
    },
    allotRoleDialogClosed () {
      this.selectedRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>
  .el-pagination {
    margin-top: 15px;
  }
</style>
