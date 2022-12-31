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

@RestControllers(path="/users/{id}/notifications")
public class NotificationsController extends RestController {

	public NotificationsController() { super();}
    
    private static NotificationsController notificationsController;
	public static NotificationsController getInstance() {

		if(notificationsController==null) {
			notificationsController = new NotificationsController();
			
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
    
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


		// Retrieve Data
		List<Notifications> allNotifications = notificationsService.findAll();
		
		System.out.println(allNotifications);
		// Response Processing
		CommonObjectResponse<List<Notifications>> jsonResponse = new CommonObjectResponse<List<Notifications>>(200,allNotifications);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}

	public void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		// Tag Creation 
		Boolean status = notificationsService.deleteAll();
		
		
		// Response Processing
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<String>(200,"Notification has been cleared");
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}


	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		

		return true;
	}



}
