package api.v1.controllers.cardAlerts;

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
import api.v1.controllers.notifications.NotificationsController;
import api.v1.dto.CommonObjectResponse;
import api.v1.entity.Notifications;
import api.v1.entity.wallets.CardAlerts;
import api.v1.service.CardAlertsService;
import api.v1.service.NotificationsService;
import api.v1.service.UsersService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;

@RestControllers(path="/users/{id}/wallets/{id}/alerts")
public class CardAlertsController extends RestController {
	
	public CardAlertsController() { super();}
    
    private static CardAlertsController cardAlertsController;
	public static CardAlertsController getInstance() {

		if(cardAlertsController==null) {
			cardAlertsController = new CardAlertsController();
			
		}
		return cardAlertsController;
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
    

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		// Getting Client Data
		CardAlerts cardAlert = gson.fromJson((String)RequestContext.getAttribute("requestBody"), CardAlerts.class); 
		
		// Tag Creation 
		cardAlert = cardAlertsService.save(cardAlert);
		
		
		// Response Processing
		CommonObjectResponse<CardAlerts> jsonResponse = new CommonObjectResponse<CardAlerts>(200,cardAlert);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}


	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		

		return true;
	}


}
