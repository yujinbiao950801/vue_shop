<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <el-steps :space="500" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeLeave">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="addForm.goods_cat" :options="cateList"
              @change="handleChange" :props="cateProps" clearable>
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name" v-for="item in manyParamsData" :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox  border :label="item1" v-for="(item1, index1) in item.attr_vals" :key="index1"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyParamsData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload
            :action="upLoadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove" :on-success="handleSuccess"
            list-type="picture" :headers="headerObj">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor v-model="addForm.goods_introduce">
          </quill-editor>
          <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览"
      :visible.sync="previewDialogVisible" width="30%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      goods_introduce: '',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      upLoadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      previewPath: '',
      manyParamsData: [],
      onlyParamsData: [],
      activeIndex: '0',
      previewDialogVisible: false,
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 1,
        goods_cat: [],
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      this.cateList = res.data
    },
    handleChange () {
      // console.log('changed')
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
      if (activeName === '1') {
        this.activeSel = 'many'
        this.getParamsData()
      } else if (activeName === '2') {
        this.activeSel = 'only'
        this.getParamsData()
      }
    },
    async getParamsData () {
      const { data: res } = await this.$axios.get('categories/' + this.addForm.goods_cat[2] + '/attributes', { params: { sel: this.activeSel } })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // console.log(res)
      if (this.activeSel === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyParamsData = res.data
        // console.log(this.manyParamsData)
      } else {
        this.onlyParamsData = res.data
        // console.log(this.onlyParamsData)
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    handleSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      this.$message.success('图片上传成功！')
    },
    addGoods () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写带*号的必填项！')
        }
        this.manyParamsData.forEach(item => {
          const info = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(info)
        })
        this.onlyParamsData.forEach(item => {
          const info = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(info)
        })
        const { data: res } = await this.$axios.post('goods', {
          goods_name: this.addForm.goods_name,
          goods_cat: this.addForm.goods_cat.join(','),
          goods_price: this.addForm.goods_price,
          goods_number: this.addForm.goods_number,
          goods_weight: this.addForm.goods_weight,
          goods_introduce: this.addForm.goods_introduce,
          pics: this.addForm.pics,
          attrs: this.addForm.attrs
        })
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功！')
        this.activeIndex = '5'
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps {
    margin: 15px 0;
  }
  .el-checkbox {
    margin: 0 10px 0 0;
  }
  .previewImg {
    width: 100%;
  }
  .addBtn {
    margin-top: 15px;
  }
</style>
