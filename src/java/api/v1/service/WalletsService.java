package api.v1.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.google.gson.reflect.TypeToken;

import api.v1.contexts.RequestContext;
import api.v1.dao.wallets.BankWalletsDaoService;
import api.v1.dao.wallets.BaseWalletsDaoService;
import api.v1.dao.wallets.BonusWalletsDaoService;
import api.v1.dao.wallets.CreditCardWalletsDaoService;
import api.v1.dao.wallets.OtherWalletsDaoService;
import api.v1.entity.Notifications;
import api.v1.entity.Users;
import api.v1.entity.wallets.BankWallets;
import api.v1.entity.wallets.BonusCardWallets;
import api.v1.entity.wallets.CardAlerts;
import api.v1.entity.wallets.CreditCardWallets;
import api.v1.entity.wallets.OtherWallets;
import api.v1.entity.wallets.Wallets;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;
import api.v1.utils.ValidatorUtil;

public class WalletsService {

	Gson gson;
	private static WalletsService walletsService;
	DatabaseUtil dbUtil;
	UsersService usersDaoService;
	
	BaseWalletsDaoService baseWalletsDaoService;
	BankWalletsDaoService bankWalletsDaoService;
	OtherWalletsDaoService otherWalletsDaoService;
	CreditCardWalletsDaoService creditCardWalletsDaoService;
	BonusWalletsDaoService bonusWalletsDaoService;
	private ValidatorUtil validatorUtil;
	
	// Making Service Singleton ------------------------------------------------------------------------------------------------------------------------------
	
	private WalletsService() {

	}
	public static WalletsService getInstance() {
		if (walletsService == null) {
			walletsService = new WalletsService();
			walletsService.gson = new Gson();
			walletsService.dbUtil = DatabaseUtil.getInstance();
			walletsService.usersDaoService = UsersService.getInstance();
			walletsService.bankWalletsDaoService = BankWalletsDaoService.getInstance();
			walletsService.baseWalletsDaoService = BaseWalletsDaoService.getInstance();
			walletsService.creditCardWalletsDaoService = CreditCardWalletsDaoService.getInstance();
			walletsService.bonusWalletsDaoService = BonusWalletsDaoService.getInstance();
			walletsService.otherWalletsDaoService = OtherWalletsDaoService.getInstance();
			walletsService.validatorUtil = ValidatorUtil.getInstance();
		}
		
		return walletsService;
	}
	
	
	
	public Wallets save(Wallets wallet) {
		
		baseWalletsDaoService.save(wallet);
		
		if(wallet.getType().equals("Bank Account")) bankWalletsDaoService.save(new BankWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
		else if(wallet.getType().equals("Bonus Account")) bonusWalletsDaoService.save(new BonusCardWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
		else if(wallet.getType().equals("Credit Card")) creditCardWalletsDaoService.save(new CreditCardWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
		else if(wallet.getType().equals("Other")) otherWalletsDaoService.save(new OtherWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
					

		return wallet;
		
	}
	
	
	public Map<String, List<Wallets<?>>> findAll() {
		
		
		List<Wallets<?>> list = new ArrayList<Wallets<?>>();
		list.addAll(baseWalletsDaoService.findAll());
		
		Map<String,List<Wallets<?>>> allWallets = new HashMap<String, List<Wallets<?>>>();
		
		allWallets.put("Bank Account", new ArrayList<Wallets<?>>());
		allWallets.put("Credit Card", new ArrayList<Wallets<?>>());
		allWallets.put("Bonus Account", new ArrayList<Wallets<?>>());
		allWallets.put("Other", new ArrayList<Wallets<?>>());
		
		
		for(Wallets w:list) {
			if(w.getType().equals("Bank Account")) allWallets.get("Bank Account").add(w);
			else if(w.getType().equals("Credit Card")) allWallets.get("Credit Card").add(w);
			else if(w.getType().equals("Bonus Account")) allWallets.get("Bonus Account").add(w);
			else if(w.getType().equals("Other")) allWallets.get("Other").add(w);
		}
		

		return allWallets;
	}

	
	public Wallets findById(Long walletId) {
		
		// Getting client side info
		
		Wallets wallet =  baseWalletsDaoService.findById(walletId);
		String walletType = wallet.getType();

		Object subWallet = null;
		
		if(walletType.equals("Bank Account")) 			subWallet = bankWalletsDaoService.findById(walletId);
		else if(walletType.equals("Credit Card")) 		subWallet = creditCardWalletsDaoService.findById(walletId);
		else if(walletType.equals("Bonus Account")) 	subWallet = bonusWalletsDaoService.findById(walletId);
		else if(walletType.equals("Other")) 			subWallet = otherWalletsDaoService.findById(walletId);

		wallet.setWalletInfo(subWallet);
		return wallet;
	}
	
	
	public Wallets update(Wallets wallet) {

		String walletType = wallet.getType();
		Long walletId = wallet.getId();

		baseWalletsDaoService.update(wallet);
		
		if(walletType.equals("Bank Account")) 			bankWalletsDaoService.update(new BankWallets((LinkedTreeMap) wallet.getWalletInfo()),walletId);
		else if(walletType.equals("Credit Card")) 		creditCardWalletsDaoService.update(new CreditCardWallets((LinkedTreeMap) wallet.getWalletInfo()),walletId);
		else if(walletType.equals("Bonus Account")) 	bonusWalletsDaoService.update(new BonusCardWallets((LinkedTreeMap) wallet.getWalletInfo()),walletId);
		else if(walletType.equals("Other")) 			otherWalletsDaoService.update(new OtherWallets((LinkedTreeMap) wallet.getWalletInfo()),walletId);
		
		return wallet;

	}
	
 
	public void deleteById(long walletId) {

		Wallets wallet = baseWalletsDaoService.findById(walletId);
		String walletType = wallet.getType();
		
	
		if(walletType.equals("Bank Account")) 			bankWalletsDaoService.deleteById(walletId);
		else if(walletType.equals("Credit Card")) 		creditCardWalletsDaoService.deleteById(walletId);
		else if(walletType.equals("Bonus Account")) 	bonusWalletsDaoService.deleteById(walletId);
		else if(walletType.equals("Other")) 			otherWalletsDaoService.deleteById(walletId);
	
		baseWalletsDaoService.deleteById(walletId);
	}

	public void handleLimitAlerts(Map<Long, Long> walletSplits) {


		Users operatingUser = (Users)RequestContext.getAttribute("user");

		
		for(Map.Entry<Long,Long> entry : walletSplits.entrySet()) {
			Long walletId = entry.getKey();
			Long amount = entry.getValue();
			
			Wallets wallet = findById(walletId);

			if(wallet.getType().equals("Credit Card")){

				
				Long limit = ((CreditCardWallets) wallet.getWalletInfo()).getLimit();
				Long balance = wallet.getBalance();
				
				Long totalSpend = limit - balance;
				

				Double percentageUsed = (totalSpend.doubleValue() / limit.doubleValue()) * 100;
				
				List<CardAlerts> alerts = CardAlertsService.getInstance().findByCardId(walletId);
				
				for(CardAlerts cardAlert: alerts) {
					Long alertLimit = cardAlert.getLimitAlertOn();
					if(alertLimit<0) return;
					System.out.println("----------------------------------------------------"+percentageUsed);
					if(alertLimit<=percentageUsed){
						String title = wallet.getName()+" Limit reached";
						String info =  "Used "+percentageUsed+" % of "+wallet.getName();
						Notifications notification = new Notifications(
								null,title,"limit",info,null,System.currentTimeMillis(),walletId,operatingUser.getId(),false
								);

						NotificationsService.getInstance().save(notification);
					}
				}
			}
		}

	}
	
	public void validateNewWallet(String requestBody){
		
		Wallets wallet = gson.fromJson((String)RequestContext.getAttribute("requestBody"), new TypeToken<Wallets>(){}.getType());
		
		validateBaseWallet(wallet);
		
		if(wallet.getType().equals("Bank Account")) validateBankWallet(new BankWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
		else if(wallet.getType().equals("Bonus Account")) validateBonusWallet(new BonusCardWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
		else if(wallet.getType().equals("Credit Card"))validateCreditCardWallet(new CreditCardWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());
		else if(wallet.getType().equals("Other")) validateOtherWallet(new OtherWallets((LinkedTreeMap) wallet.getWalletInfo()),wallet.getId());

	}
	private void validateOtherWallet(OtherWallets otherWallet, long id) {
		
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(otherWallet,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(otherWallet.getNote(),errors,"Note");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
		
		
	}
	private void validateCreditCardWallet(CreditCardWallets creditCardWallets, long id) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(creditCardWallets,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(creditCardWallets.getRepayDate(),errors,"Name");
    	validatorUtil.nullValidation(creditCardWallets.getLimit(),errors,"Type");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
		
	}
	private void validateBonusWallet(BonusCardWallets bonusCardWallets, long id) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(bonusCardWallets,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(bonusCardWallets.getNote(),errors,"Name");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
		
	}
	private void validateBankWallet(BankWallets bankWallets, long id) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(bankWallets,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
//    	validatorUtil.nullValidation(bankWallets.getAccountNumber(),errors,"Name");
//    	validatorUtil.nullValidation(bankWallets.getIfscCode(),errors,"Type");

    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
		
	}
	private void validateBaseWallet(Wallets wallet) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(wallet,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(wallet.getName(),errors,"Name");
    	validatorUtil.nullValidation(wallet.getType(),errors,"Type");
    	validatorUtil.nullValidation(wallet.getArchiveWallet(),errors,"Archive");
    	validatorUtil.nullValidation(wallet.getExcludeFromStats(),errors,"Exclude from stats");
    	validatorUtil.nullValidation(wallet.getBalance(),errors,"Balance");
    	validatorUtil.nullValidation(wallet.getWalletInfo(),errors,"Sub Wallet Info");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
		
		
	}
	public Boolean validateIsOwnerById(Long userId, Long walletId) {
		
		Map<String,String> errors = new HashMap<String,String>();
		
		Wallets wallet = baseWalletsDaoService.findById(walletId);
		
		if(wallet==null) {
			errors.put("wallet","Is not exist");
			throw new CustomException(errors.toString(),400);
		}
		return true;
		
	}
	

	
}
