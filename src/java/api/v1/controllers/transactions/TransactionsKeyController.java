package api.v1.controllers.transactions;

import java.io.IOException;
import java.util.ArrayList;

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


@RestControllers(path="/users/{id}/transactions/{id}")
public class TransactionsKeyController  extends RestController {
	private static final long serialVersionUID = 1L;
       
	  
    UsersService usersService;
    WalletsService walletsService;
    TagsService tagsService;
    CategoryService categoryService;
    TransactionsService transactionsService;
	JsonUtil jsonUtil;
	Gson gson;
	
    private static TransactionsKeyController transactionsKeyController;
	public static TransactionsKeyController getInstance() {
		// TODO Auto-generated method stub
		if(transactionsKeyController==null) {
			transactionsKeyController = new TransactionsKeyController();
		}
		return transactionsKeyController;
	}

	
	public void init(ServletConfig config) throws ServletException {
		walletsService = WalletsService.getInstance();
		usersService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		tagsService = TagsService.getInstance();
		transactionsService = TransactionsService.getInstance();
		gson = new Gson();
	}
	
    public TransactionsKeyController() {super();}


	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long transactionId = Long.parseLong(path[path.length - 1]);
		CommonObjectResponse resp = new CommonObjectResponse();
		Transactions transaction = transactionsService.findById(transactionId);

		resp.setData(transaction);
		resp.setStatusCode(200);
		
		response.getWriter().write(gson.toJson(resp));
	}


	public void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long transactionId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		transactionsService.deleteById(transactionId);
		
		String requestBody = (String)RequestContext.getAttribute("requestBody");		
		Transactions newTransaction = gson.fromJson(requestBody, new TypeToken<Transactions<?>>(){}.getType()); 
		
		
		newTransaction = transactionsService.save(newTransaction);
		
		CommonObjectResponse<Transactions<?>> jsonResponse = new CommonObjectResponse<Transactions<?>>(200,newTransaction);
		res.setContentType("application/json");
		res.getWriter().write(gson.toJson(jsonResponse));
	}


	public void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		
		
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long transactionId = Long.parseLong(path[path.length - 1]);
		
		
		transactionsService.deleteById(transactionId);
		
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<>();
		
		jsonResponse.setData("The deletion of the transaction with id "+ transactionId +" is success");
		response.setContentType("application/json");
		jsonResponse.setStatusCode(200);
		response.getWriter().write(gson.toJson(jsonResponse));
		
		
	}


	@Override
	public Boolean isValidRequest(String requestBody, String method) {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long transactionId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		if(method.equals("GET") || method.equals("DELETE")) {
			
			transactionsService.validateIsOwnerById(userId, transactionId);
			
		}else if(method.equals("PUT")) {
			
			transactionsService.validateIsOwnerById(userId, transactionId);
			
			Transactions newTransaction = gson.fromJson(requestBody, new TypeToken<Transactions<?>>(){}.getType()); 
			transactionsService.validateUpdateTransactions(newTransaction);
		}
		
		return true;
		
	}

}
