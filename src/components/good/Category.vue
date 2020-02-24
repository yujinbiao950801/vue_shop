<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
        <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <tree-table class="treeTable" :data="categoryList" :columns="columns" border :selection-type="false" :expand-type="false" show-index index-text="#">
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === true" style="color:darkgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="option">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>

    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="40%" @close="addCateDialogClosed"
    >
        <el-form :model="addCateForm" ref="addCateRef" label-width="100px" :rules="addCateFormRules">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <el-cascader :options="parentCateList" @change="parentCateChanged" v-model="selectedOptions" :props="cascaderProps" clearable change-on-select>
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategory">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      addCategoryDialogVisible: false,
      categoryList: [],
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedOptions: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isOk' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'option' }
      ]
    }
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getCategoryList()
    },
    handleCurrentChange (newpagenum) {
      this.queryInfo.pagenum = newpagenum
      this.getCategoryList()
    },
    showAddCategoryDialog () {
      this.getParentCateList()
      this.addCategoryDialogVisible = true
    },
    async getParentCateList () {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    addCateDialogClosed () {
      this.$refs.addCateRef.resetFields()
      this.selectedOptions = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCategory () {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) { return }
        const { data: res } = await this.$axios.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCategoryList()
        this.addCategoryDialogVisible = false
      })
    },
    parentCateChanged () {
      // console.log(this.selectedOptions)
      if (this.selectedOptions.length > 0) {
        this.addCateForm.cat_pid = this.selectedOptions[this.selectedOptions.length - 1]
        this.addCateForm.cat_level = this.selectedOptions.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    }
  },
  created () {
    this.getCategoryList()
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
