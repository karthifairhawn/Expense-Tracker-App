package api.v1.controllers;

import java.io.IOException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.dto.CommonObjectResponse;
import api.v1.dto.auth.LoginDto;
import api.v1.service.UsersService;
import api.v1.utils.JsonUtil;



@RestControllers(path = "/login")
public class AuthController extends RestController {
	
	
	private static AuthController authController;
	public static RestController getInstance() {
		if(authController == null) authController = new AuthController();
		return authController;
	}
	
       

    public AuthController() {
        super();
    }
    
    UsersService usersService;

	JsonUtil jsonUtil;
	Gson gson;
	

    public void init(ServletConfig config) throws ServletException {
    	usersService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		gson = new Gson();
    }


	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		
		// Getting Client Values
		LoginDto newLogin  = gson.fromJson((String)RequestContext.getAttribute("requestBody"), LoginDto.class); 
		
		String resp =  usersService.getAuthToken(newLogin);
		
		
		// Response Processing
		CommonObjectResponse<String> responseObject = new CommonObjectResponse<String>();
		responseObject.setStatusCode(200);
		responseObject.setData(resp);
		response.setContentType("application/json");
		response.setStatus(200);
		response.getWriter().write(gson.toJson(responseObject));
		
	}

	
	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		
		if(method.equals("GET")) {
			
		}else if(method.equals("PUT")) {
			
			
			
		}else if(method.equals("POST")) {
			
			LoginDto loginDto = gson.fromJson(requestBody, LoginDto.class);
			usersService.validateLoginRequest(loginDto);
			
		}else if(method.equals("DELETE")) {
				
		}
		
		return true;
	}







}
