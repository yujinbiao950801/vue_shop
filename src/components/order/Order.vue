<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getOrdersList" @keyup.enter.native="getOrdersList" @blur="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="50px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="180px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template>
            <!-- slot-scope="scope" -->
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>

    <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="40%" @close="dialogClosed">
      <el-form :model="orderForm" :rules="orderFormRules" ref="orderFormRef" label-width="90px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="orderForm.address1" :options="cityData" :props="addressProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="orderForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="addressDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="40%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo"
          :key="index" :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      ordersList: [],
      addressDialogVisible: false,
      progressDialogVisible: false,
      orderForm: {
        address1: [],
        address2: ''
      },
      addressProps: {
        expandTrigger: 'hover'
      },
      orderFormRules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      cityData: cityData,
      progressInfo: []
    }
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$axios.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrdersList()
    },
    handleCurrentChange (newpagenum) {
      this.queryInfo.pagenum = newpagenum
      this.getOrdersList()
    },
    showBox () {
      this.addressDialogVisible = true
    },
    dialogClosed () {
      this.$refs.orderFormRef.resetFields()
      this.orderForm.address1 = []
    },
    async showProgress () {
      this.progressDialogVisible = true
      const { data: res } = await this.$axios.get('/kuaidi/804909574412544581')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }
      this.progressInfo = res.data
    }
  },
  created () {
    this.getOrdersList()
  }
}
</script>

<style lang="less" scoped>

</style>
