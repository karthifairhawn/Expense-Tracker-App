package api.v1.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import api.v1.contexts.RequestContext;
import api.v1.entity.Notifications;
import api.v1.entity.Users;
import api.v1.entity.categories.Categories;
import api.v1.entity.wallets.CardAlerts;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;

public class CardAlertsDaoService {

	DatabaseUtil dbUtil;
	private static CardAlertsDaoService cardAlertsDaoService = null;
    private CardAlertsDaoService() {}
    public static CardAlertsDaoService getInstance() {
    	if(cardAlertsDaoService==null) {
    		cardAlertsDaoService = new CardAlertsDaoService();
    		cardAlertsDaoService.dbUtil  = DatabaseUtil.getInstance();
    	}
    	return cardAlertsDaoService;
    }
    
    
    public CardAlerts save(CardAlerts cardAlerts){
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		// Creating the Category 
		String sql = "INSERT INTO `card_alerts`(`credit_card_id`, `type`, `limit_alert_on`, `due_alert_before`, `user_id`) "
				+ "VALUES ("+cardAlerts.getCreditCardId()+",'"+cardAlerts.getType()+"','"+cardAlerts.getLimitAlertOn()+"','"+cardAlerts.getDueAlertBefore()+"','"+operatingUser.getId()+"')";
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			cardAlerts.setId(rs.getLong(1));
			cardAlerts.setUserId((long) operatingUser.getId());
		} catch (SQLException e) {
			throw new CustomException("Creation of category failed",400,new Date().toLocaleString());
		}
		
		
		return cardAlerts;
    }
    
    
    public Boolean deleteById(Long id){

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "DELETE FROM `card_alerts` WHERE id = " + id+" and user_id = " + operatingUser.getId();
		int rs = dbUtil.executeDeletionionQuery(sql);
	
    	return true;
    }

	
    public List<CardAlerts> findByCardId(Long cardId) {
    	
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "SELECT * FROM `card_alerts` WHERE credit_card_id = "+cardId+" and user_id = " + operatingUser.getId();
		
		
		List<CardAlerts> allCardAlerts = new LinkedList<>();
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			while(rs.next()) {				
				CardAlerts c = new CardAlerts(rs.getLong("id"),rs.getLong("user_id"),rs.getLong("credit_card_id"),rs.getString("type"),rs.getLong("limit_alert_on"),rs.getLong("due_alert_before"));
				allCardAlerts.add(c);
			}
		
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all categories failed",400,new Date().toLocaleString());
		}
		
		return allCardAlerts;
		
	}
	
    public List<CardAlerts> findAllSuper() {
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "SELECT * FROM `card_alerts`";
		
		
		List<CardAlerts> allCardAlerts = new LinkedList<>();
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			while(rs.next()) {				
				CardAlerts c = new CardAlerts(rs.getLong("id"),rs.getLong("user_id"),rs.getLong("credit_card_id"),rs.getString("type"),rs.getLong("limit_alert_on"),rs.getLong("due_alert_before"));
				allCardAlerts.add(c);
			}
		
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all categories failed",400,new Date().toLocaleString());
		}
		
		return allCardAlerts;
	}
	public List<Long> findCardsToAlertByDay(Integer day) {
		
		List<Long> ids = new LinkedList<>();
	   DateTimeFormatter dtf = DateTimeFormatter.ofPattern("d");  
	   LocalDateTime now = LocalDateTime.now();  
	   String date = dtf.format(now);
		String sql = "SELECT ccw.id FROM `credit_card_wallet` AS ccw INNER JOIN `card_alerts` AS ca on ccw.wallet_id = credit_card_id where (ca.type='due' and  (ccw.repay_date-ca.due_alert_before) = "+date+");";
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			while(rs.next()) {				
				ids.add(rs.getLong("id"));
			}
		
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all categories failed",400,new Date().toLocaleString());
		}
		
		return ids;
	}

    
}
