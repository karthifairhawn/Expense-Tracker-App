package api.v1.controllers.recurringPayments;

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
import api.v1.entity.RecurringPayments;
import api.v1.entity.categories.Categories;
import api.v1.service.NotificationsService;
import api.v1.service.RecurringPaymentsService;
import api.v1.service.UsersService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;

@RestControllers(path="/users/{id}/payments")
public class RecurringPaymentsController extends RestController {


	public RecurringPaymentsController() { super();}
    
    private static RecurringPaymentsController recurringPaymentsController;
	public static RecurringPaymentsController getInstance() {

		if(recurringPaymentsController==null) {
			recurringPaymentsController = new RecurringPaymentsController();
			
		}
		return recurringPaymentsController;
	}

    
    UsersService usersDaoService;
    RecurringPaymentsService recurringPaymentsService;
    ValidatorUtil validatorUtil;
	JsonUtil jsonUtil;
	Gson gson;
	
    public void init(ServletConfig config) throws ServletException {
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		validatorUtil = ValidatorUtil.getInstance();
		gson = new Gson();
		recurringPaymentsController = RecurringPaymentsController.getInstance();
		recurringPaymentsService = RecurringPaymentsService.getInstance();
    }
    
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		List<RecurringPayments>  allCategories = recurringPaymentsService.findAll();

		// Response Processing
		CommonObjectResponse<List<RecurringPayments>> jsonResponse = new CommonObjectResponse<List<RecurringPayments>>(200,allCategories);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// Getting client data
		RecurringPayments recurringPayment = gson.fromJson((String)RequestContext.getAttribute("requestBody"), RecurringPayments.class); 
		
		// Creating Category
		recurringPayment = recurringPaymentsService.save(recurringPayment);
		
		// Response Processing
		CommonObjectResponse<RecurringPayments> jsonResponse = new CommonObjectResponse<RecurringPayments>(201,recurringPayment);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}

	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		return true;
	}
	
    
}
