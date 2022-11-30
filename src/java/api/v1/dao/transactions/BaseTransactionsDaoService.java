package api.v1.dao.transactions;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.mysql.jdbc.ResultSetMetaData;

import api.v1.contexts.RequestContext;
import api.v1.dao.wallets.BaseWalletsDaoService;
import api.v1.entity.Users;
import api.v1.entity.transactions.Expense;
import api.v1.entity.transactions.Income;
import api.v1.entity.transactions.Transactions;
import api.v1.entity.transactions.Transfer;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;

public class BaseTransactionsDaoService {

	DatabaseUtil dbUtil;
	private BaseTransactionsDaoService() {}
	private static BaseTransactionsDaoService baseTransactionsDaoService;

	public static BaseTransactionsDaoService getInstance(){
		if(baseTransactionsDaoService == null){
			baseTransactionsDaoService = new BaseTransactionsDaoService();
			baseTransactionsDaoService.dbUtil  = DatabaseUtil.getInstance();
		}
		return baseTransactionsDaoService;
	}
	
	
	public Transactions save(Transactions transaction) {
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		try {
			String sql = "INSERT INTO `transactions`(`type`, `amount`, `timestamp`, `user_id`) VALUES ('"+transaction.getType()+"','"+transaction.getAmount()+"','"+new Timestamp(transaction.getTimestamp().getTime())+"','"+operatingUser.getId()+"')";
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			Long transactionId = (long) rs.getInt(1);
			transaction.setId((long) transactionId);

			
		}catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Creation of base transaction failed",500,new Date().toLocaleString());
		}
		
		return transaction;
		
	}

	public Map<String, List<Transactions>> findAll(Map<String, String> filters){
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		Map<String,List<Transactions>> allTransactions = new HashMap<String,List<Transactions>>();
		List<Transactions> expenses = new LinkedList<Transactions>();
		List<Transactions> incomes = new LinkedList<Transactions>();
		List<Transactions> transfers = new LinkedList<Transactions>();
		
		if(filters==null) {
			throw new CustomException("Bad Request",400);
		}
		
		String dateFrom = filters.get("from");
		String dateTo = filters.get("to");
		String fetchType = filters.get("type");
		
		String query = "SELECT * FROM `transactions` WHERE (user_id="+operatingUser.getId()+" and timestamp>='"+dateFrom +"') and ( timestamp<='"+dateTo+"')";
		
		ResultSet rs;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			ResultSetMetaData rsmd = (ResultSetMetaData) rs.getMetaData();
			while (rs.next()) {
				Transactions transaction = new Transactions();
				transaction.setId(rs.getLong("id"));
				transaction.setAmount(rs.getLong("amount"));
				transaction.setType(rs.getString("type"));
				transaction.setTimestamp(rs.getTimestamp("timestamp"));
				
				String type = transaction.getType();
								
				if(type.equals("expense")) expenses.add(transaction);
				else if(type.equals("income")) {
					
					incomes.add(transaction);
				}
				else if(type.equals("transfer")) transfers.add(transaction);
				
			}
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your wallets please contact admin", 500,
					new Date().toLocaleString());
		}
		
		if(fetchType.equals(null) || fetchType.equals("expenses")) allTransactions.put("expenses",expenses);
		if(fetchType.equals(null) || fetchType.equals("incomes"))  allTransactions.put("incomes",incomes);
		if(fetchType.equals(null) || fetchType.equals("transfer"))  allTransactions.put("transfers",transfers);
		return allTransactions;
	}

	
	public Map<String, List<Transactions>> findAllExpenseBySpendRange(Map<String, String> filters){
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		Map<String,List<Transactions>> allTransactions = new HashMap<String,List<Transactions>>();
		List<Transactions> expenses = new LinkedList<Transactions>();
		List<Transactions> incomes = new LinkedList<Transactions>();
		List<Transactions> transfers = new LinkedList<Transactions>();
		
		if(filters==null) {
			throw new CustomException("Bad Request",400);
		}
		
		int dateFrom = Integer.parseInt(filters.get("from"));

		String fetchType = filters.get("type");
		
		String dateTo = filters.get("to");
		dateTo = dateTo.substring(0, 4)+"-"+dateTo.substring(4, 6)+"-"+dateTo.substring(6)+" 23:59";
		String query = "SELECT * FROM `transactions` LEFT JOIN `expenses` on transactions.id = expenses.transaction_id WHERE transactions.user_id="+operatingUser.getId()+" and (expenses.spend_on>='"+dateFrom +"' and  expenses.spend_on<='"+dateTo+"') order	 by `spend_on`";
		
		
		
		System.out.println("Execution recieved "+query);
		ResultSet rs;
		try {
			rs = dbUtil.executeSelectionQuery(query); 
			ResultSetMetaData rsmd = (ResultSetMetaData) rs.getMetaData();
			while (rs.next()) {
				Transactions transaction = new Transactions();
				transaction.setId(rs.getLong("id"));
				transaction.setAmount(rs.getLong("amount"));
				transaction.setType(rs.getString("type"));
				transaction.setTimestamp(rs.getTimestamp("timestamp"));
				
				String type = transaction.getType();
				
				
				if(type.equals("expense")) expenses.add(transaction);
				else if(type.equals("income")) incomes.add(transaction);
				else if(type.equals("transfer")) transfers.add(transaction);


			}	
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your wallets please contact admin", 500,
					new Date().toLocaleString());
		}
		
		if(fetchType.equals(null) || fetchType.equals("expenses")) allTransactions.put("expenses",expenses);
		if(fetchType.equals(null) || fetchType.equals("incomes"))  allTransactions.put("incomes",incomes);
		if(fetchType.equals(null) || fetchType.equals("transfer"))  allTransactions.put("transfers",transfers);
		return allTransactions;
	}

	public Transactions findById(Long transactionId){
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		String query = "SELECT * FROM `transactions` WHERE user_id="+operatingUser.getId()+" and id="+transactionId;
		Transactions transaction = new Transactions();
		
		// Getting base transaction info
		ResultSet rs;
		try {
			rs = dbUtil.executeSelectionQuery(query);

			ResultSetMetaData rsmd = (ResultSetMetaData) rs.getMetaData();

			rs.next();
			transaction.setId(rs.getLong("id"));
			transaction.setAmount(rs.getLong("amount"));
			transaction.setType(rs.getString("type"));
			transaction.setTimestamp(rs.getTimestamp("timestamp"));
			
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Transaction nor found.", 404,new Date().toLocaleString());
		}
		return transaction;

	}
	
	public void deleteById(Long transactionId){
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		String sql = "DELETE FROM transactions WHERE `transactions`.`id` = "+transactionId+" and user_id = "+operatingUser.getId();
		String transactionType = "";
		Long amount;
		
		try {
			int rs = dbUtil.executeUpdateQuery(sql);
			if(rs==0) throw new CustomException("Transaction not found.",404);
			
		} catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Transaction not found.",404);
		}
		
		System.out.println(transactionType);
		
		
	}

	public void deleteByTransactionId(Long transactionId) {
		String sql = "DELETE FROM transactions WHERE `id` = "+transactionId;
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
		
	}
	
	
	
}
