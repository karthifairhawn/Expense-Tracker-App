package api.v1.dao.wallets;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

import com.google.gson.Gson;
import api.v1.contexts.RequestContext;
import api.v1.entity.Users;
import api.v1.entity.wallets.OtherWallets;
import api.v1.exception.CustomException;
import api.v1.service.UsersService;
import api.v1.utils.DatabaseUtil;

public class OtherWalletsDaoService {

	Gson gson;
	private static OtherWalletsDaoService otherWalletsDaoService;
	DatabaseUtil dbUtil;
	UsersService usersDaoService;
	
	
	private OtherWalletsDaoService() {

	}
	
	
	public static OtherWalletsDaoService getInstance() {
		if (otherWalletsDaoService == null) {
			otherWalletsDaoService = new OtherWalletsDaoService();
			otherWalletsDaoService.gson = new Gson();
			otherWalletsDaoService.dbUtil = DatabaseUtil.getInstance();
			otherWalletsDaoService.usersDaoService = UsersService.getInstance();
		}
		return otherWalletsDaoService;
	}
	
	public OtherWallets save(OtherWallets otherWallet, long walletId) {

		// Getting client info
		Users operatingUser = (Users)RequestContext.getAttribute("user");


		// Wallet Creation
		String sql = "INSERT INTO `other_wallet` (`note`, `wallet_id`) VALUES ( '" + otherWallet.getNote() + "', '"+ walletId + "')";
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			otherWallet.setId((long)rs.getInt(1));
		} catch (SQLException e) {
			throw new CustomException("Creation of base wallet failed",500,new Date().toLocaleString());
		}
		
		return otherWallet;
	}
	
	public OtherWallets findById(long walletId){
		String query = "SELECT * FROM `other_wallet` where wallet_id = " + walletId;
		ResultSet rs;
		OtherWallets otherWallet;
		
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			otherWallet = new OtherWallets();
			otherWallet.setId(Integer.parseInt(rs.getString(1))); 
			otherWallet.setNote(rs.getString(2));
			
			
		}catch(Exception e){
			throw new CustomException("AN unexpected error occured in bonus card retrievel",500,new Date().toLocaleString());
		}
		return otherWallet;
	}

	public void deleteById(long walletId) {
		String	sql = "DELETE FROM other_wallet WHERE `wallet_id` = "+walletId;
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
	}


	
	public void update(OtherWallets wallet, Long walletId) {
		String sql = "UPDATE `other_wallet` SET `note`='"+wallet.getNote()+"' WHERE wallet_id="+walletId;
		int rs = dbUtil.executeUpdateQuery(sql);
		if(rs==0) throw new CustomException("Wallet is not found in your account or no changes made.",400,new Date().toLocaleString());
		
	}
}
