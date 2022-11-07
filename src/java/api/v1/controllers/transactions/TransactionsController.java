package api.v1.controllers.transactions;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.dto.CommonObjectResponse;
import api.v1.entity.transactions.Transactions;
import api.v1.service.CategoryService;
import api.v1.service.TagsService;
import api.v1.service.TransactionsService;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;


@RestControllers(path="/users/{id}/transactions")
public class TransactionsController extends RestController {
       

    public TransactionsController() {   super();     }

    
    private static TransactionsController transactionsController;
	public static TransactionsController getInstance() {
		// TODO Auto-generated method stub
		if(transactionsController==null) {
			transactionsController = new TransactionsController();
		}
		return transactionsController;
	}

    
    UsersService usersService;
    WalletsService walletsService;
    TagsService tagsService;
    CategoryService categoryService;
    TransactionsService transactionsService;
	JsonUtil jsonUtil;
	Gson gson;
	
	public void init(ServletConfig config) throws ServletException {
		walletsService = WalletsService.getInstance();
		usersService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		tagsService = TagsService.getInstance();
		transactionsService = TransactionsService.getInstance();
		gson = new Gson();
	}
	

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		Map<String, String> queryParams = request.getQueryString()==null ? null : splitQueryParams(request.getQueryString().split("&"));
		Map<String, List<Transactions>> allTransactions = transactionsService.findAll(queryParams);
		
		CommonObjectResponse<Map<String, List<Transactions>>> resp = new CommonObjectResponse<>();
		resp.setData(allTransactions);
		resp.setStatusCode(200);
		
		response.getWriter().write(gson.toJson(resp));

		
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		
		String requestBody = (String)RequestContext.getAttribute("requestBody");		
		Transactions newTransaction = gson.fromJson(requestBody, new TypeToken<Transactions<?>>(){}.getType()); 
		
		
		newTransaction = transactionsService.save(newTransaction);
		
		CommonObjectResponse<Transactions<?>> jsonResponse = new CommonObjectResponse<Transactions<?>>(200,newTransaction);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}

	
	private Map<String,String> splitQueryParams(String queryParams[]) {
		
		Map<String,String> splitParams = new HashMap<String,String>();
		
		for(String i:queryParams) {
			String[] val = i.split("=");
			splitParams.put(val[0],val[1]);
		}
		
		return splitParams;
	}


	
	
	@Override
	public Boolean isValidRequest(String requestBody, String method) {
		
		if(method.equals("GET")) {
			// No Validation
		}else if(method.equals("POST")) {
			
			Transactions newTransaction = gson.fromJson(requestBody, new TypeToken<Transactions<?>>(){}.getType()); 
			transactionsService.validateUpdateTransactions(newTransaction); // Create and update uses same validation
		}
		
		return true;
		
	}


	

	
	

}













