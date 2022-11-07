package api.v1.controllers.wallets;

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
import api.v1.entity.wallets.Wallets;
import api.v1.exception.CustomException;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;

/**
 * Servlet implementation class WalletsControllerTwo
 */
@RestControllers(path = "/users/{id}/wallets/{id}")
public class WalletsKeyController extends RestController {
	private static final long serialVersionUID = 1L;
       
 
    public WalletsKeyController() {
        super();
        // TODO Auto-generated constructor stub
    }

    private static WalletsKeyController walletsKeyController;
	public static WalletsKeyController getInstance() {
		// TODO Auto-generated method stub
		if(walletsKeyController==null) {
			walletsKeyController = new WalletsKeyController();
		}
		return walletsKeyController;
	}

	
    UsersService usersDaoService;
    WalletsService walletsService;
	JsonUtil jsonUtil;
	Gson gson;
	
	public void init(ServletConfig config) throws ServletException {
		walletsService = WalletsService.getInstance();
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		gson = new Gson();
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		

		Long walletId = Long.parseLong(request.getPathInfo().split("/")[4]);
		
		
		// Retrievel of wallet
		Wallets singleWallet = walletsService.findById(walletId);
		
		
		// Processing Response
		CommonObjectResponse<Wallets<?>> responseObject = new CommonObjectResponse<Wallets<?>>();
		responseObject.setStatusCode(200);
		response.setContentType("application/json");
		responseObject.setData(singleWallet);
		response.getWriter().write(gson.toJson(responseObject));
			

	}

	public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long tagId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		// Getting Client Side Info
		String bodyString = (String)RequestContext.getAttribute("requestBody");
		Wallets<?> newWallet = gson.fromJson(bodyString, new TypeToken<Wallets<?>>(){}.getType());
		newWallet.setUserId(userId);
		
		// Update Wallets
		Wallets wallet = walletsService.update(newWallet);
		
		
		// Response Processing
		response.setContentType("application/json");
		CommonObjectResponse<Wallets> responseObject = new CommonObjectResponse<Wallets>();
		responseObject.setStatusCode(200);
		responseObject.setData(wallet);
		response.getWriter().write(gson.toJson(responseObject));
	}

	public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		
		System.out.println(request.getPathInfo()+"-");
		
		try {
			
			// Getting Client info
			Long walletId = Long.parseLong(request.getPathInfo().split("/")[4]);
			walletsService.deleteById(walletId);
			
			// Processing Response
			CommonObjectResponse<String> responseObject = new CommonObjectResponse<String>();
			responseObject.setStatusCode(200);
			response.setContentType("application/json");
			responseObject.setData("Wallet Deleted");
			response.getWriter().write(gson.toJson(responseObject));
			
			
		}catch (Exception e) {
			e.printStackTrace();
			throw new CustomException("Unexpexted error occured",404);
		}
	}

	
	@Override
	public Boolean isValidRequest(String requestBody, String method) {
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long walletId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		if(method.equals("GET") || method.equals("DELETE")){
			
			walletsService.validateIsOwnerById(userId, walletId);
			
		}else if(method.equals("PUT")) {
			
			walletsService.validateIsOwnerById(userId, walletId);
			
			walletsService.validateNewWallet(requestBody);
			
		}else if(method.equals("DELETE")) {
			
			walletsService.validateIsOwnerById(userId, walletId);
		}
		
		return true;
	}
}
