package api.v1.dao.transactions;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import api.v1.entity.transactions.Income;
import api.v1.entity.wallets.Wallets;
import api.v1.exception.CustomException;
import api.v1.service.WalletsService;
import api.v1.utils.DatabaseUtil;

public class IncomeTransactionDaoService {

	DatabaseUtil dbUtil;
	private IncomeTransactionDaoService() {}
	private static IncomeTransactionDaoService incomeTransactionDaoService;
	public static IncomeTransactionDaoService getInstance(){
		if(incomeTransactionDaoService == null){
			incomeTransactionDaoService = new IncomeTransactionDaoService();
			incomeTransactionDaoService.dbUtil = DatabaseUtil.getInstance();
		}
		return incomeTransactionDaoService;
	}

	
	public Income save(Income income) {
		

		try {
			String note = income.getNote();
			
			String sql = "INSERT INTO `incomes` (`wallet_id`, `note` ,`transaction_id`) VALUES ('"+income.getWalletId()+"','"+note+"','"+income.getTransactionId()+"')";
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			
			
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Income creation failed",400,new Date().toLocaleString());
		}
		return income;
	}


	
	
	public Income findByTransactionId(Long transactionId) {
		ResultSet rs;
		Income income = new Income();
		String sql = "SELECT * FROM `incomes` WHERE transaction_id = "+transactionId;
		
		try {
			rs = dbUtil.executeSelectionQuery(sql);
			while (rs.next()) {
				
				
				income.setId(rs.getLong("id"));
				income.setNote(rs.getString("note"));
				income.setTransactionId(transactionId);
				income.setWalletId(rs.getLong("wallet_id"));
			}
			
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your transaction", 500,new Date().toLocaleString());
		}
		return income;
	}
	
	
	public void deleteByTransactionId(Long transactionId) {
		String sql = "DELETE FROM incomes WHERE `transaction_id` = "+transactionId;
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
	}
}
