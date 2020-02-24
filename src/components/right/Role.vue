<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-button type="primary">添加角色</el-button>
      </el-row>

      <el-table :data="roleList" border stripe>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id" :class="['borBot', 'vertical-center', index1===0?'borTop':'']">
            <el-col :span="5">
              <el-tag closable @close="removeRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <el-col :span="19">
              <el-row v-for="(item2,index2) in item1.children" :key="item2.id" :class="[index2===0?'':'borTop','vertical-center']">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRight(scope.row, item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRight(scope.row, item3.id)">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <!-- <pre>
            {{scope.row}}
          </pre> -->
        </template>
      </el-table-column>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
          <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="30%" @close="setRightDialogClosed">
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true"
      :default-checked-keys="defKeys" ref="treeRef">

      </el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRight">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },
    async removeRight (role, rightId) {
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除该权限')
      }
      const { data: res } = await this.$axios.delete('roles/' + role.id + '/rights/' + rightId)
      if (res.meta.status !== 200) {
        return this.$message.error('删除该权限失败')
      }
      // console.log(res.data)
      role.children = res.data
    },
    async showSetRightDialog (roleNode) {
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightList = res.data
      this.getLeafKeys(roleNode, this.defKeys)
      this.setRightDialogVisible = true
      this.roleId = roleNode.id
      // console.log(res.data)
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    async allotRight () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const choosenId = keys.join(',')
      const { data: res } = await this.$axios.post('roles/' + this.roleId + '/rights', {
        rids: choosenId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
      // console.log(keys.join(','))
    }
  }
}
</script>

<style lang="less" scoped>
  .borTop {
    border-top: 1px solid #eee;
  }
  .borBot {
    border-bottom: 1px solid #eee;
  }
  .el-tag {
    margin: 7px;
  }
  .vertical-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
