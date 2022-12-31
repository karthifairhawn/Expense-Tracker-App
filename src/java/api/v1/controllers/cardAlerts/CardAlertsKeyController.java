package api.v1.controllers.cardAlerts;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.controllers.notifications.NotificationsKeyController;
import api.v1.dto.CommonObjectResponse;
import api.v1.entity.Notifications;
import api.v1.entity.wallets.CardAlerts;
import api.v1.service.CardAlertsService;
import api.v1.service.NotificationsService;
import api.v1.service.UsersService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;

@RestControllers(path="/users/{id}/wallets/{id}/alerts/{id}")
public class CardAlertsKeyController extends RestController {

public CardAlertsKeyController() { super();}
    
    private static CardAlertsKeyController cardAlertsKeyController;
	public static CardAlertsKeyController getInstance() {

		if(cardAlertsKeyController==null) {
			cardAlertsKeyController = new CardAlertsKeyController();
			
		}
		return cardAlertsKeyController;
	}

    
    UsersService usersDaoService;
    CardAlertsService cardAlertsService;
    ValidatorUtil validatorUtil;
	JsonUtil jsonUtil;
	Gson gson;
	
    public void init(ServletConfig config) throws ServletException {
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		validatorUtil = ValidatorUtil.getInstance();
		gson = new Gson();
		cardAlertsService = CardAlertsService.getInstance();
    }

	

	public void doDelete(HttpServletRequest r, HttpServletResponse res) throws ServletException, IOException {

		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		Long alertId = Long.parseLong(path[path.length - 1]);
		
		cardAlertsService.deleteById(alertId);
		
		
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
