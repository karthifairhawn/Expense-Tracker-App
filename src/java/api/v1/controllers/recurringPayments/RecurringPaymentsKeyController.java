package api.v1.controllers.recurringPayments;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.controllers.categories.CategoryKeyController;
import api.v1.dto.CommonObjectResponse;
import api.v1.entity.RecurringPayments;
import api.v1.entity.categories.Categories;
import api.v1.service.CategoryService;
import api.v1.service.TagsService;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;
import api.v1.service.RecurringPaymentsService;

@RestControllers(path="/users/{id}/payments/{id}")
public class RecurringPaymentsKeyController extends RestController {

    public RecurringPaymentsKeyController() {
        super();
    }
    
    UsersService usersDaoService;
    RecurringPaymentsService recurringPaymentsService;
	JsonUtil jsonUtil;
	Gson gson;

	
	private static RecurringPaymentsKeyController recurringPaymentsKeyController;
  	public static RecurringPaymentsKeyController getInstance() {
  		// TODO Auto-generated method stub
  		if(recurringPaymentsKeyController==null) {
  			recurringPaymentsKeyController = new RecurringPaymentsKeyController();
  		}
  		return recurringPaymentsKeyController;
  	}

	
    public void init(ServletConfig config) throws ServletException {
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		gson = new Gson();
		recurringPaymentsService = RecurringPaymentsService.getInstance();
    }
    
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long paymentInd = Long.parseLong(path[path.length - 1]);
		
		RecurringPayments payment = recurringPaymentsService.findById(paymentInd);
		
		// Response Processing
		CommonObjectResponse<RecurringPayments> jsonResponse = new CommonObjectResponse<RecurringPayments>(200,payment);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}


	public void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long paymentId = Long.parseLong(path[path.length - 1]);
		

		// Getting client data
		RecurringPayments recurringPayments = gson.fromJson((String)RequestContext.getAttribute("requestBody"), RecurringPayments.class); 
		if(recurringPayments != null) recurringPayments.setId(paymentId);
		
		// Updating Category
		recurringPaymentsService.update(recurringPayments);
		
		// Response Processing
		CommonObjectResponse<RecurringPayments> jsonResponse = new CommonObjectResponse<RecurringPayments>(200,recurringPayments);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}


	public void doDelete(HttpServletRequest reqs, HttpServletResponse resp) throws ServletException, IOException {

		

		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long paymentId = Long.parseLong(path[path.length - 1]);

		
		// Deleting Category
		recurringPaymentsService.deleteById(paymentId);
		
		
		// Response Processing
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<String>(200,"Deletion of recurring payment is success"); 	
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}

	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		return true;
	}
	
}
