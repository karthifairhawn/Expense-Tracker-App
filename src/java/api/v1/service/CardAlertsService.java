package api.v1.service;

import api.v1.dao.CategoryDaoService;
import api.v1.entity.Notifications;
import api.v1.entity.Users;
import api.v1.entity.wallets.CardAlerts;
import api.v1.entity.wallets.CreditCardWallets;
import api.v1.entity.wallets.Wallets;
import api.v1.utils.ValidatorUtil;

import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import api.v1.contexts.RequestContext;
import api.v1.dao.CardAlertsDaoService;

public class CardAlertsService {

    private static CardAlertsService cardAlertsService = null;
    private CardAlertsDaoService cardAlertsDaoService;
    private ValidatorUtil validatorUtil;
    
    private CardAlertsService() {}
    public static CardAlertsService getInstance() {
    	if(cardAlertsService==null) {
    		cardAlertsService = new CardAlertsService();
    		cardAlertsService.cardAlertsDaoService = api.v1.dao.CardAlertsDaoService.getInstance();
    		cardAlertsService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return cardAlertsService;
    }
    
    
    public CardAlerts save(CardAlerts cardAlerts){
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		Long cardId = Long.parseLong(path[path.length - 2]);
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		cardAlerts.setCreditCardId(cardId);
		cardAlerts.setUserId(operatingUser.getId());
    	return cardAlertsDaoService.save(cardAlerts);
    }
    
    public Boolean deleteById(Long id){
    	return cardAlertsDaoService.deleteById(id);
    }
	
	public List<CardAlerts> findByCardId(Long cardId) {
		return cardAlertsDaoService.findByCardId(cardId);
	}
	
	public List<CardAlerts> findAllSuper() {
		// TODO Auto-generated method stub
		return cardAlertsDaoService.findAllSuper();
	}
	
	public List<Wallets> findCardsToAlertByDay(Integer day){
		List<Long> allCreditCardWalletsIds = cardAlertsDaoService.findCardsToAlertByDay(day);
		List<Wallets> allCreditCardWallets = new LinkedList<>();
		
		for(Long id:allCreditCardWalletsIds) {
			allCreditCardWallets.add(WalletsService.getInstance().findById(id));
		}
		
		return allCreditCardWallets;
	}
	
	
}
