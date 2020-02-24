<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert type="warning" title="注意：只允许为第三级分类设置相关参数！" show-icon :closeable="false">
      </el-alert>

      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader :options="cateList" @change="cateChanged" v-model="selectedOptions" :props="cascaderProps" clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="selectedOptions.length !== 3" @click="dialogVisible = true">添加参数</el-button>
          <el-table :data="manyParamsData" style="width: 100%" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable class="paramsTag" @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="selectedOptions.length !== 3" @click="dialogVisible = true">添加属性</el-button>
          <el-table :data="onlyParamsData" style="width: 100%" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable class="paramsTag" @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="'添加'+ titleText" :visible.sync="dialogVisible" width="30%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'修改'+ titleText" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      addForm: {
        attr_name: ''
      },
      editForm: {
        attr_name: '',
        attr_id: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      dialogVisible: false,
      editDialogVisible: false,
      manyParamsData: [],
      onlyParamsData: [],
      selectedOptions: [],
      activeName: 'many'
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    cateChanged () {
      this.getParamsData()
      this.onlyParamsData = []
      this.manyParamsData = []
    },
    async getParamsData () {
      if (this.selectedOptions.length !== 3) {
        this.selectedOptions = []
      } else {
        // console.log(this.selectedOptions)
        const { data: res } = await this.$axios.get('categories/' + this.selectedOptions[2] + '/attributes', { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          item.inputVisible = false
          item.inputValue = ''
        })
        // console.log(res.data)
        if (this.activeName === 'many') {
          this.manyParamsData = res.data
        } else {
          this.onlyParamsData = res.data
        }
      }
    },
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
      } else {
        // console.log(111)
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttributes(row)
      }
    },
    async saveAttributes (row) {
      const { data: res } = await this.$axios.put('categories/' + this.selectedOptions[2] + '/attributes/' + row.attr_id, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleTabClick () {
      this.getParamsData()
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$axios.post('categories/' + this.selectedOptions[2] + '/attributes', {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          }
          this.$message.success('添加参数成功')
          this.getParamsData()
          this.dialogVisible = false
        }
      })
      this.dialogVisible = false
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    showEditDialog (role) {
      // console.log(role)
      this.editForm.attr_name = role.attr_name
      this.editForm.attr_id = role.attr_id
      this.editDialogVisible = true
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$axios.put('categories/' + this.selectedOptions[2] + '/attributes/' + this.editForm.attr_id, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          }
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false
        }
      })
    },
    async removeParams (attrId) {
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete('categories/' + this.selectedOptions[2] + '/attributes/' + attrId)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttributes(row)
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .paramsTag {
    margin: 5px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>
