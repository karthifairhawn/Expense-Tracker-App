package api.v1.dao.wallets;

import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import com.google.gson.Gson;

import api.v1.contexts.RequestContext;
import api.v1.entity.wallets.CreditCardWallets;
import api.v1.exception.CustomException;
import api.v1.service.UsersService;
import api.v1.utils.DatabaseUtil;

public class CreditCardWalletsDaoService {

	
	Gson gson;
	private static CreditCardWalletsDaoService creditCardWalletsDaoService;
	DatabaseUtil dbUtil;
	UsersService usersDaoService;
	
	
	private CreditCardWalletsDaoService() {

	}
	
	public static CreditCardWalletsDaoService getInstance() {
		if (creditCardWalletsDaoService == null) {
			creditCardWalletsDaoService = new CreditCardWalletsDaoService();
			creditCardWalletsDaoService.gson = new Gson();
			creditCardWalletsDaoService.dbUtil = DatabaseUtil.getInstance();
			creditCardWalletsDaoService.usersDaoService = UsersService.getInstance();
		}
		return creditCardWalletsDaoService;
	}
	
	public CreditCardWallets save(CreditCardWallets creditCardWallet, long walletId) {
		
		// Getting client info
		Integer repayDate = creditCardWallet.getRepayDate();
//		String repayDatee = new SimpleDateFormat("yyyy-MM-dd").format(repayDate);
		Long limitAmount = creditCardWallet.getLimit();
		

		// Wallet Creation
		String sql = "INSERT INTO `credit_card_wallet` (`repay_date`, `limit`, `wallet_id`) VALUES ('" + repayDate+ "', '" + limitAmount + "', '" + walletId + "')";
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
		try {
			rs.next();
			creditCardWallet.setId((long)rs.getInt(1));
		} catch (Exception e) {
			throw new CustomException("Creation of credit card wallet failed contact admin for more info", 500);
		}
		
		return creditCardWallet;
	}

	public CreditCardWallets findById(Long walletId) {

		String query = "SELECT * FROM `credit_card_wallet` where wallet_id = " + walletId;
		ResultSet rs;
		CreditCardWallets creditCardWallets;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			creditCardWallets = new CreditCardWallets();
			creditCardWallets.setId(Long.parseLong(rs.getString(1)));
//			Date date=new SimpleDateFormat("yyyy-MM-dd").parse(rs.getString(2));  
			creditCardWallets.setRepayDate(Integer.parseInt(rs.getString(2)));
			creditCardWallets.setLimit((Long.parseLong(rs.getString(3))));
			
		}catch(Exception e){
			e.printStackTrace();
			throw new CustomException("AN unexpected error occured in credit card retrievel",500,new Date().toLocaleString());
		}
		return creditCardWallets;
	}

	public void deleteById(long walletId) {
		String	sql = "DELETE FROM credit_card_wallet WHERE `wallet_id` = "+walletId;
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
	}

	
	public void update(CreditCardWallets wallet, Long walletId) {
		Integer repayDate = wallet.getRepayDate();
//		String repayDatee = new SimpleDateFormat("yyyy-MM-dd").format(repayDate);
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long walletIdd = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);

		
		// Wallet Updation
		String sql = "UPDATE `credit_card_wallet` SET `repay_date`='"+repayDate+"',`limit`='"+wallet.getLimit()+"' WHERE wallet_id="+walletIdd;
		int rs = dbUtil.executeUpdateQuery(sql);
		if(rs==0) throw new CustomException("Wallet is not found in your account or no changes made.",400,new Date().toLocaleString());
		
	}



}
