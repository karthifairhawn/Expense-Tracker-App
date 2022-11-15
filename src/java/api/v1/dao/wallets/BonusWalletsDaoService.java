package api.v1.dao.wallets;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

import com.google.gson.Gson;
import api.v1.contexts.RequestContext;
import api.v1.entity.Users;
import api.v1.entity.wallets.BonusCardWallets;
import api.v1.exception.CustomException;
import api.v1.service.UsersService;
import api.v1.utils.DatabaseUtil;

public class BonusWalletsDaoService {

	
	Gson gson;
	private static BonusWalletsDaoService bonusWalletsDaoService;
	DatabaseUtil dbUtil;
	UsersService usersDaoService;
	
	
	private BonusWalletsDaoService() {

	}
	
	
	public static BonusWalletsDaoService getInstance() {
		if (bonusWalletsDaoService == null) {
			bonusWalletsDaoService = new BonusWalletsDaoService();
			bonusWalletsDaoService.gson = new Gson();
			bonusWalletsDaoService.dbUtil = DatabaseUtil.getInstance();
			bonusWalletsDaoService.usersDaoService = UsersService.getInstance();
		}
		return bonusWalletsDaoService;
	}

	public BonusCardWallets save(BonusCardWallets bonusCardWallet, long walletId) {
		
		// Getting client info
		String bonusWalletNote = bonusCardWallet.getNote();
		Users operatingUser = (Users)RequestContext.getAttribute("user");


		// Wallet Creation
		String sql = "INSERT INTO `bonus_wallet` (`note`, `wallet_id`) VALUES ('" + bonusWalletNote + "', '"+ walletId + "')";
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			bonusCardWallet.setId((long)rs.getInt(1));
		} catch (SQLException e) {
			System.err.println("Creation of base wallet failed with query = " + sql);
		}
		
		return bonusCardWallet;
	}
	
	public BonusCardWallets findById(Long walletId) {
		String query = "SELECT * FROM `bonus_wallet` where wallet_id = " + walletId;
		ResultSet rs;
		BonusCardWallets bonusCardWallets;
		
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			bonusCardWallets = new BonusCardWallets();
			bonusCardWallets.setId(Long.parseLong(rs.getString(1))); 
			bonusCardWallets.setNote(rs.getString(2));
			
			
		}catch(Exception e){
			e.printStackTrace();
			throw new CustomException("AN unexpected error occured in bonus card retrievel",500,new Date().toLocaleString());
		}
		return bonusCardWallets;

	}

	public void deleteById(long walletId) {
		String	sql = "DELETE FROM bonus_wallet WHERE `wallet_id` = "+walletId;
		ResultSet rs = dbUtil.executeInsertionQuery(sql);
	}


	
	
	public void update(BonusCardWallets wallet, Long walletId) {

		// Wallet Updation
		String sql = "UPDATE `bonus_wallet` SET `note`='"+wallet.getNote()+"' WHERE wallet_id="+walletId;
		int rs = dbUtil.executeUpdateQuery(sql);
//		if(rs==0) throw new CustomException("Wallet is not found in your account or no changes made.",400,new Date().toLocaleString());
		
	}

}
