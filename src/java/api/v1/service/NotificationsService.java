package api.v1.service;

import java.util.List;

import api.v1.dao.CardAlertsDaoService;
import api.v1.dao.NotificationsDaoService;
import api.v1.entity.Notifications;
import api.v1.entity.wallets.CardAlerts;
import api.v1.utils.ValidatorUtil;

public class NotificationsService {

    private static NotificationsService notificationsService = null;
    private NotificationsDaoService notificationsDaoService ;
    private ValidatorUtil validatorUtil;
    
    private NotificationsService() {}
    public static NotificationsService getInstance() {
    	if(notificationsService==null) {
    		notificationsService = new NotificationsService();
    		notificationsService.notificationsDaoService = NotificationsDaoService.getInstance();
    		notificationsService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return notificationsService;
    }
    
    
    public Notifications save(Notifications notification){
    	return notificationsDaoService.save(notification);
    }
    
    public Boolean updateById(Long id){
    	notificationsDaoService.markReadById(id);
    	return true;
    }
    
    public Boolean deleteById(Long id){
    	notificationsDaoService.deleteById(id);
    	return true;
    }
    
    public Boolean deleteAll(){
    	notificationsDaoService.deleteAll();
    	return true;
    }
    
    public NotificationsDaoService markReadById(Long Id){
    	return null;
    }
	
    public List<Notifications> findAll() {
		return notificationsDaoService.findAll();
	}
    
    
}
