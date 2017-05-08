/**
 * Created by zhangyang on 17/4/6.
 */
'use strict';

import Base from './base.js';

export default class extends Base {
	/**
	 * index action
	 * @return {Promise} []
	 */
	*indexAction(){
        yield this.weblogin();
		this.assign("style","order");

        let orderList = null;
        if (this.isPost()) {
			//获取筛选信息
            let conditionList = this.post();
            console.log(conditionList);
            //查询条件初始化
            let conditions = "1=1";

            //判断是否填入:
            if(conditionList.order_startdate != '')
                conditions += " and date_format(order_time, '%Y-%m-%d') >= " + "'" +  conditionList.order_startdate + "'";
            if(conditionList.order_enddate != '')
                conditions += " and date_format(order_time, '%Y-%m-%d') <= " + "'" + conditionList.order_enddate + "'";
            if(conditionList.pay_startdate != '')
                conditions += " and date_format(pay_time, '%Y-%m-%d') >= " + "'" +  conditionList.pay_startdate + "'";
            if(conditionList.pay_enddate != '')
                conditions += " and date_format(pay_time, '%Y-%m-%d') <= " + "'" + conditionList.pay_enddate + "'";
            if(conditionList.pay_type != -1)
                conditions += ' and pay_type = ' +  conditionList.pay_type;
            if(conditionList.order_status != -1)
                conditions += ' and status = '+ conditionList.order_status;
            if(conditionList.keyword_buyer != '')
                conditions += ' and name LIKE '+ "'%" + conditionList.keyword_buyer + "%'";
            orderList = yield this.model("order").join("ecp_user on ecp_order.user_id=ecp_user.user_id").where(conditions).select();
		}
		else{
            orderList = yield this.model("order").join("ecp_user on ecp_order.user_id=ecp_user.user_id").select();
		}
        // console.log(orderList);
        this.assign('orderList',orderList);
        this.assign('orderStatus',this.getOrderStatus());
        this.assign('payType',this.getPayType());
		return this.display();
	}
    *deleteAction(){
        yield this.weblogin();
        this.assign("style","order");


        if (this.isAjax()) {
            let order_ids_str = this.post('product_ids');
            order_ids_str = order_ids_str.substring(0,order_ids_str.length-1);
            let order_ids = order_ids_str.split(',');
            // console.log(order_ids);

            let model = this.model('order');
            for(let i = 0;i < order_ids.length;i++){
                let cur_order_id = order_ids[i];
                try{
                    yield model.startTrans();//事务处理
                    yield this.model('orderdetail').where({order_id: ['=', cur_order_id]}).delete();
                    yield model.where({order_id: ['=', cur_order_id]}).delete();
                    yield model.commit();
                }catch(e){
                    yield model.rollback();
                    return this.success(-1);
                }
            }
            return this.success(1);
        }

        return this.display();
    }
}