package api.v1.dao.transactions;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import api.v1.entity.transactions.Transfer;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;

public class TransferTransactionsDaoService {

	DatabaseUtil dbUtil;
	private TransferTransactionsDaoService() {}
	private static TransferTransactionsDaoService transferTransactionsDaoService;
	public static TransferTransactionsDaoService getInstance(){
		if(transferTransactionsDaoService == null){
			transferTransactionsDaoService = new TransferTransactionsDaoService();
			transferTransactionsDaoService.dbUtil = DatabaseUtil.getInstance();
		}
		return transferTransactionsDaoService;
	}

	
	public Transfer save(Transfer transfer)  {
		

		Long walletTo = transfer.getWalletTo();
		Long walletFrom = transfer.getWalletFrom();


		
		String note = transfer.getNote();
		Long transactionId = transfer.getTransactionId();
		
		try {
			  
		    String sql = "INSERT INTO `transfers`(`wallet_from`,`wallet_to`, `note`, `transaction_id`) VALUES ('"+walletFrom+"','"+walletTo+"','"+note+"','"+transactionId+"')";
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Insertion of transfer failed ",500,new Date().toLocaleString());
		}
		
		return transfer;
	}

	public Transfer findByTransactionId(Long transactionId){
		
		ResultSet rs;
		Transfer transfer = new Transfer();
		String sql = "SELECT * FROM `transfers` WHERE transaction_id = "+transactionId;
		
		try {
			rs = dbUtil.executeSelectionQuery(sql);

			while (rs.next()) {
				transfer.setId(rs.getLong("id"));
				transfer.setNote(rs.getString("note"));
				transfer.setWalletTo(rs.getLong("wallet_to"));
				transfer.setWalletFrom(rs.getLong("wallet_from"));
			}
			
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your transaction", 500,new Date().toLocaleString());
		}
		return transfer;
		
	}

	public void deleteByTransactionId(Long transactionId) {
		String sql = "DELETE FROM transfers WHERE `transaction_id` = "+transactionId;
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
	}
}
