package api.v1.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import api.v1.contexts.RequestContext;
import api.v1.entity.Notifications;
import api.v1.entity.Users;
import api.v1.entity.categories.Categories;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;

public class NotificationsDaoService {
	
	DatabaseUtil dbUtil;
	private static NotificationsDaoService notificationsDaoService = null;
    private NotificationsDaoService() {}
    public static NotificationsDaoService getInstance() {
    	if(notificationsDaoService==null) {
    		notificationsDaoService = new NotificationsDaoService();
    		notificationsDaoService.dbUtil  = DatabaseUtil.getInstance();
    	}
    	return notificationsDaoService;
    }
    
    
    public Notifications save(Notifications notification){
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		Long userId = operatingUser.getId();
		String type = notification.getType();
		String title = notification.getTitle();
		String info = notification.getInfo();
		String action = notification.getAction();
		Long createdOn = notification.getCreatedOn();
		Long entityKey = notification.getEntityKey();
		Long readed = 0l ;
		
		// Creating the Category 
		String sql = "INSERT INTO `notifications`( `title`, `type`, `info`, `action`, `created_on`, `entity_key`, `user_id`, `readed`) VALUES "
				+ "('"+title+"','"+type+"','"+info+"','"+action+"','"+createdOn+"','"+entityKey+"','"+userId+"','"+readed+"')";
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			notification.setId(rs.getLong(1));
			notification.setUserId((long) operatingUser.getId());
			return notification;
		} catch (SQLException e) {
			throw new CustomException("Creation of category failed",400,new Date().toLocaleString());
		}
    }
 
    
    public Boolean deleteById(Long id){
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "DELETE FROM `notifications` WHERE id= "+id+" and user_id = " + operatingUser.getId();
		
		int rs = dbUtil.executeDeletionionQuery(sql);
		if(rs==0) throw new CustomException("The category is not found in this account",404,new Date().toLocaleString());
		
		return true;
    }
    
    public Boolean deleteAll(){
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "DELETE FROM `notifications` WHERE user_id = " + operatingUser.getId();
		
		int rs = dbUtil.executeDeletionionQuery(sql);
		if(rs==0) throw new CustomException("The category is not found in this account",404,new Date().toLocaleString());
		
		return true;
    }
    
    public Boolean markReadById(Long id){
    	
    	
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
    	String sql = "UPDATE `notifications` SET `readed` = '1' WHERE `notifications`.`id` = "+id+" and user_id = "+operatingUser.getId();
    	
		int rs = dbUtil.executeUpdateQuery(sql);
		if(rs==0) throw new CustomException("Updation failed pass in valid data.",400,new Date().toLocaleString());

		
    	return true;
    }
	
    public List<Notifications> findAll() {
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		List<Notifications> result = new LinkedList<Notifications>();
		String sql = "Select * from notifications where user_id = " + operatingUser.getId();
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			while(rs.next()){
				Notifications c = new Notifications(rs.getLong("id"),rs.getString("title"),rs.getString("type"),rs.getString("info"),rs.getString("action"),rs.getLong("created_on")
						,rs.getLong("entity_key"),rs.getLong("user_id"),rs.getBoolean("readed"));
				result.add(c);
			}
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all notifications failed",400,new Date().toLocaleString());
		}
		
		return result;
	}
    
    
}
