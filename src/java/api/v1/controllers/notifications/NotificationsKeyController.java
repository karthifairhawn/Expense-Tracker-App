package api.v1.controllers.notifications;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.controllers.tags.TagsController;
import api.v1.dto.CommonObjectResponse;
import api.v1.entity.Notifications;
import api.v1.entity.Tags;
import api.v1.service.TagsService;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;
import api.v1.service.NotificationsService;

@RestControllers(path="/users/{id}/notifications/{id}")
public class NotificationsKeyController extends RestController {

	public NotificationsKeyController() { super();}
    
    private static NotificationsKeyController notificationsController;
	public static NotificationsKeyController getInstance() {

		if(notificationsController==null) {
			notificationsController = new NotificationsKeyController();
			
		}
		return notificationsController;
	}

    
    UsersService usersDaoService;
    NotificationsService notificationsService;
    ValidatorUtil validatorUtil;
	JsonUtil jsonUtil;
	Gson gson;
	
    public void init(ServletConfig config) throws ServletException {
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		validatorUtil = ValidatorUtil.getInstance();
		gson = new Gson();
		notificationsService = NotificationsService.getInstance();
    }
    


	public void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		Long notId = Long.parseLong(path[path.length - 1]);
		
		Notifications newNotification = gson.fromJson((String)RequestContext.getAttribute("requestBody"), Notifications.class); 
		
		// Notification Update (only updates the read status)
		notificationsService.updateById(notId);
		
		
		// Response Processing
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<String>(200,"Notification marked as read");
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}
	
	public void doDelete(HttpServletRequest r, HttpServletResponse res) throws ServletException, IOException {

		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		Long notId = Long.parseLong(path[path.length - 1]);
		
		notificationsService.deleteById(notId);
		
		
		// Response Processing
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<String>(200,"Notification has been deleted");
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}
	
	

	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		

		return true;
	}



}
