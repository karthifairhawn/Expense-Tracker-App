package api.v1.dao.wallets;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.mysql.jdbc.ResultSetMetaData;

import api.v1.contexts.RequestContext;
import api.v1.entity.Users;
import api.v1.entity.wallets.BankWallets;
import api.v1.entity.wallets.Wallets;
import api.v1.exception.CustomException;
import api.v1.service.UsersService;
import api.v1.utils.DatabaseUtil;

public class BaseWalletsDaoService {

	
	Gson gson;
	private static BaseWalletsDaoService baseWalletsDaoService;
	DatabaseUtil dbUtil;
	UsersService usersDaoService;
	private static BankWalletsDaoService bankWalletsDaoService;
	private static BonusWalletsDaoService bonusWalletsDaoService;
	private static CreditCardWalletsDaoService creditCardWalletsDaoService;
	private static OtherWalletsDaoService otherWalletsDaoService;
	
	
	private BaseWalletsDaoService() {

	}
	public static BaseWalletsDaoService getInstance() {
		if (baseWalletsDaoService == null) {
			baseWalletsDaoService = new BaseWalletsDaoService();
			baseWalletsDaoService.gson = new Gson();
			baseWalletsDaoService.dbUtil = DatabaseUtil.getInstance();
			baseWalletsDaoService.usersDaoService = UsersService.getInstance();
			
			bankWalletsDaoService = BankWalletsDaoService.getInstance();
			bonusWalletsDaoService = BonusWalletsDaoService.getInstance();
			creditCardWalletsDaoService = CreditCardWalletsDaoService.getInstance();
			otherWalletsDaoService = OtherWalletsDaoService.getInstance();
		}
		return baseWalletsDaoService;
	}


	public Wallets save(Wallets wallet) {
		
		// Get Client Side Info
		int archiveWallet = wallet.getArchiveWallet() == true ? 1 : 0;
		int excludeFromStats = wallet.getExcludeFromStats() == true ? 1 : 0;
		
		// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");

		
		// Create base Wallet
		String sql = "INSERT INTO `wallets` ( `name`, `type`, `archive_wallet`, `balance`, `exclude_from_stats`, `user_id`) VALUES ( '"
				+ wallet.getName() + "', '" + wallet.getType() + "', '" + archiveWallet + "', '" + wallet.getBalance()
				+ "', '" + excludeFromStats + "', '" + operatingUser.getId() + "')";
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			wallet.setId(rs.getInt(1));
		} catch (SQLException e) {
			System.out.println("Creation of base wallet failed with query = " + sql);
		}

		return wallet;
	}

	public List<Wallets<?>> findAll(){
		// Getting Client Info
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		List<Wallets<?>> allWallets = new LinkedList<Wallets<?>>();
		
		// Wallet Retrivel
		String sql = "SELECT * FROM `wallets` where user_id = '" + operatingUser.getId() + "' && deleted=0";
		ResultSet rs;
		
		try {
			rs = dbUtil.executeSelectionQuery(sql);
			ResultSetMetaData rsmd = (ResultSetMetaData) rs.getMetaData();

			while (rs.next()) {
				Wallets fetchingWallet = new Wallets();
				fetchingWallet.setId(Integer.parseInt(rs.getString(1)));
				fetchingWallet.setName(rs.getString(2));
				fetchingWallet.setType(rs.getString(3));
				fetchingWallet.setArchiveWallet(Integer.parseInt(rs.getString(4))==1 ? true : false);
				fetchingWallet.setBalance(Integer.parseInt(rs.getString(5)));
				fetchingWallet.setExcludeFromStats(Integer.parseInt(rs.getString(6))==1 ? true : false);
				fetchingWallet.setUserId(Long.parseLong(rs.getString(7)));
				
				
				Object subWallet = null;

				if(fetchingWallet.getType().equals("Bank Account")) 			subWallet = bankWalletsDaoService.findById(fetchingWallet.getId());
				else if(fetchingWallet.getType().equals("Credit Card")) 		subWallet = creditCardWalletsDaoService.findById(fetchingWallet.getId());
				else if(fetchingWallet.getType().equals("Bonus Account")) 	subWallet = bonusWalletsDaoService.findById(fetchingWallet.getId());
				else if(fetchingWallet.getType().equals("Other")) 			subWallet = otherWalletsDaoService.findById(fetchingWallet.getId());

				fetchingWallet.setWalletInfo(subWallet);
				

				allWallets.add(fetchingWallet);
			}
			
			
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your wallets please contact admin", 500);
		}

		return allWallets;
	}

	public Wallets findById(long walletId) {
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		Wallets wallet = new Wallets();
		
		// Wallet Retrieve
		String query = "SELECT * FROM `wallets` where id = " + walletId +" and user_id="+operatingUser.getId();
		ResultSet rs;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			ResultSetMetaData rsmd = (ResultSetMetaData) rs.getMetaData();
			rs.next();
				
			wallet = new Wallets<BankWallets>();
			wallet.setId(walletId);
			wallet.setName(rs.getString(2));
			wallet.setType(rs.getString(3));
			wallet.setArchiveWallet(Integer.parseInt(rs.getString(4))==1 ? true : false);
			wallet.setBalance(Integer.parseInt(rs.getString(5)));
			wallet.setExcludeFromStats(Integer.parseInt(rs.getString(6))==1 ? true : false);
			wallet.setUserId(Long.parseLong(rs.getString(7)));
			

		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Wallet not found in account",404);
		}
		
		return wallet;
	}

	public void deleteById(long walletId) {
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		String sql = "DELETE from `wallets`WHERE `id` = "+walletId+ " and  user_id = "+operatingUser.getId();
		int rs = dbUtil.executeDeletionionQuery(sql);
		if(rs==0) throw new CustomException("Wallet is not found in your account",400,new Date().toLocaleString());
		
	}

	public Wallets update(Wallets wallet) {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long walletId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");

		int archiveWallet = wallet.getArchiveWallet()==false ? 0 : 1;
		int excludeFromStats = wallet.getExcludeFromStats()==false ? 0 : 1;
		
		// Update Wallet
		String sql  = "UPDATE `wallets` SET `name`='"+wallet.getName()+"',`archive_wallet`='"+archiveWallet+"',`balance`='"+wallet.getBalance()+"',`exclude_from_stats`='"+excludeFromStats+"' WHERE id="+walletId+" and user_id="+userId;
		int rs = dbUtil.executeUpdateQuery(sql);
		
		if(rs==0) throw new CustomException("Wallet is not found in your account or no changes made.",400,new Date().toLocaleString());
		
		return wallet;
	}

	public void reduceBalanceById(Long walletId, Long amount){
		
		try {
			String reduceBalanceSql = "update wallets set balance=balance-"+amount+" where id="+walletId;
			int rowsAffected = dbUtil.executeUpdateQuery(reduceBalanceSql);
			if(rowsAffected==0) throw new CustomException("Invalid transfer",400,new Date().toLocaleString());
		}catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Insertion of transfer failed ",500,new Date().toLocaleString());
		}
	}
	
	public void increaseBalanceById(Long walletId, Long amount){
		
		try {
			String reduceBalanceSql = "update wallets set balance=balance+"+amount+" where id="+walletId;
			int rowsAffected = dbUtil.executeUpdateQuery(reduceBalanceSql);
		}catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Unexpected error occured.",500,new Date().toLocaleString());
		}
	}

	public void assignWalletsForExpenses(Map<Long, Long> walletSplits, Long expenseId) {
		 
		Users operatingUser = (Users)RequestContext.getAttribute("user");
    	
    	for(Map.Entry<Long, Long> entry : walletSplits.entrySet()) {
        	try {	
        		Long walletId= entry.getKey();
        		Long amount = entry.getValue();

        		
    			String sql = "INSERT INTO `expense_split`(`wallet_id`, `expense_id`,`amount`) VALUES ('"+walletId+"','"+expenseId+"','"+amount+"')";
    			ResultSet rs = dbUtil.executeInsertionQuery(sql);
    			rs.next();
    			
    			String reduceBalanceSql = "update wallets set balance=balance-"+amount+" where id="+walletId+" and user_id="+operatingUser.getId();
    			int rowsAffected = dbUtil.executeUpdateQuery(reduceBalanceSql);
    			if(rowsAffected==0 && walletId!=-100) throw new CustomException("Invalid wallet id",400,new Date().toLocaleString());
    			
    		} catch (Exception e) {
    			throw new CustomException("Creation of some wallets assigning for the expense transaction failed",400,new Date().toLocaleString());
    		}
    	}
	}

	public Map<Long,Long> findWalletSplitsByExpenseId(Long expenseId){
		Map<Long,Long> walletSplits = new HashMap<Long,Long>();
		
		ResultSet rs;
		String sql = "SELECT * FROM `expense_split` WHERE expense_id = " + expenseId;
		
		try {
			rs = dbUtil.executeSelectionQuery(sql);

			while (rs.next()) {
				walletSplits.put(rs.getLong("wallet_id"), rs.getLong("amount"));
			}

		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your transaction", 500,new Date().toLocaleString());
		}
		return walletSplits;
	}


}
