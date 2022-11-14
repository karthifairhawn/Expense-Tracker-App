package api.v1.controllers.wallets;

import java.io.IOException;
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
import api.v1.entity.wallets.Wallets;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;


@RestControllers(path = "/users/{id}/wallets")
public class WalletsController extends RestController {
       

    public WalletsController() {
        super();
    }

    private static WalletsController walletsController;
	public static WalletsController getInstance() {
		// TODO Auto-generated method stub
		if(walletsController==null) {
			walletsController = new WalletsController();
		}
		return walletsController;
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


	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// Retrieve All Wallets
		Map<String, List<Wallets>> allWallets =  walletsService.findAll();
		
		
		// Processing Response
		CommonObjectResponse<Map<String, List<Wallets>>> responseObject = new CommonObjectResponse<Map<String, List<Wallets>>>();
		responseObject.setData(allWallets);
		responseObject.setStatusCode(200);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(responseObject));

	}
	
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// Getting Client Info
		Wallets wallet = gson.fromJson((String)RequestContext.getAttribute("requestBody"), new TypeToken<Wallets>(){}.getType());
		
		// Wallet Creation
		wallet = walletsService.save(wallet);
		

		
		// Response Processing
		CommonObjectResponse responseObject = new CommonObjectResponse();
		responseObject.setStatusCode(200);
		responseObject.setData(wallet);
		response.getWriter().write(gson.toJson(responseObject));

	}


	@Override
	public Boolean isValidRequest(String requestBody, String method) {
		
		
		
		if(method.equals("GET")) {
			
			// No Validation
			
			
		}else if(method.equals("POST")) {
			
			walletsService.validateNewWallet(requestBody);
		}
		
		return true;
	}
	





}
