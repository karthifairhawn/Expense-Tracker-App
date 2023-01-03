package api.v1.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import api.v1.contexts.RequestContext;
import api.v1.entity.RecurringPayments;
import api.v1.entity.Tags;
import api.v1.entity.Users;
import api.v1.entity.categories.Categories;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;
import api.v1.utils.ValidatorUtil;

public class RecurringPaymentsDaoService {

    private static RecurringPaymentsDaoService recurringPaymentsDaoService = null;
    private ValidatorUtil validatorUtil;
    private DatabaseUtil dbUtil;
    
    private RecurringPaymentsDaoService() {}
    public static RecurringPaymentsDaoService getInstance() {
    	if(recurringPaymentsDaoService==null) {
    		recurringPaymentsDaoService = new RecurringPaymentsDaoService();
    		recurringPaymentsDaoService.validatorUtil = ValidatorUtil.getInstance();
    		recurringPaymentsDaoService.dbUtil  = DatabaseUtil.getInstance();
    	}
    	return recurringPaymentsDaoService;
    }
    
    public RecurringPayments save(RecurringPayments recurringPayment) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		Long autoAdd = recurringPayment.getLastPaid();
		String sql = "INSERT INTO `recurring_payments`( `user_id`, `wallet_id`, `name`, `type`, `amount`, `occur`, `end_by`, `last_paid`) "
				+ "VALUES ('"+operatingUser.getId()+"','"+recurringPayment.getWalletId()+"','"+recurringPayment.getName()+"',"
				+ "'"+recurringPayment.getType()+"','"+recurringPayment.getAmount()+"','"+recurringPayment.getOccur()+"','"+recurringPayment.getEndBy()+"','"+autoAdd+"')";
		
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			recurringPayment.setId(rs.getLong(1));
			recurringPayment.setUserId((long) operatingUser.getId());

		} catch (SQLException e) {
			throw new CustomException("Creation of category failed",400,new Date().toLocaleString());
		}
		return recurringPayment;
	}
    
    public List<RecurringPayments> findAll() {
    	
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		List<RecurringPayments> result = new LinkedList<RecurringPayments>();
		String sql = "SELECT * FROM `recurring_payments` where user_id="+operatingUser.getId();
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			
			while(rs.next()){
				RecurringPayments c = new RecurringPayments(rs.getLong("id"),rs.getLong("user_id"),rs.getLong("wallet_id"),rs.getString("name"),rs.getString("type"),rs.getLong("amount"),rs.getString("occur"),rs.getString("end_by"),rs.getLong("last_paid"));
				result.add(c);
			}
			
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all categories failed",400,new Date().toLocaleString());
		}
		
		return result;
	}
    
    public RecurringPayments findById(Long id) {
    	
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
    	
		String sql = "SELECT * FROM `recurring_payments` where id="+id+" and user_id="+operatingUser.getId();
		ResultSet rs;
		RecurringPayments recurringPayments;
		try {
			rs = dbUtil.executeSelectionQuery(sql);
			rs.next();
			recurringPayments = new RecurringPayments(rs.getLong("id"),rs.getLong("user_id"),rs.getLong("wallet_id"),rs.getString("name"),rs.getString("type"),rs.getLong("amount"),rs.getString("occur"),rs.getString("end_by"),rs.getLong("last_paid"));

			
		}catch(Exception e){
			e.printStackTrace();
			return null;
		}
		return recurringPayments;
	}
    
    public Boolean deleteById(Long id) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "DELETE FROM `recurring_payments` WHERE id="+id;
		
		int rs = dbUtil.executeDeletionionQuery(sql);
		if(rs==0) throw new CustomException("The tag is not found in this account",404,new Date().toLocaleString());
		return true;
	}
    
	public RecurringPayments update(RecurringPayments recurringPayment) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		Long autoAdd = recurringPayment.getLastPaid();
		String sql = "UPDATE `recurring_payments` SET "
				+ "`wallet_id`='"+recurringPayment.getWalletId()+"',`name`='"+recurringPayment.getName()+"',`type`='"+recurringPayment.getType()+"',`amount`='"+recurringPayment.getAmount()+"',`occur`='"+recurringPayment.getOccur()+"',`end_by`='"+recurringPayment.getEndBy()+"',`last_paid`='"+autoAdd+"'"
						+ " WHERE id="+recurringPayment.getId()+" and user_id="+operatingUser.getId();
		
		int rs = dbUtil.executeUpdateQuery(sql);
		if(rs==0) throw new CustomException("Updation failed pass in valid data.",400,new Date().toLocaleString());
		
		return recurringPayment;
	}

}
