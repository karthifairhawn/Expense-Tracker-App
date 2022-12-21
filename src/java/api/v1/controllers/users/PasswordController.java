package api.v1.controllers.users;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.dto.CommonObjectResponse;
import api.v1.dto.PasswordChangeDto;
import api.v1.dto.auth.LoginDto;
import api.v1.entity.Users;
import api.v1.service.UsersService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;


@RestControllers(path = "/password")
public class PasswordController extends RestController {

	
	private static PasswordController passwordController;
	public static RestController getInstance() {
		if(passwordController == null) passwordController = new PasswordController();
		return passwordController;
	}
	
    public PasswordController() {
        super();
    }
	
    UsersService usersService;
	JsonUtil jsonUtil;
	ValidatorUtil validatorUtil;
	Gson gson;
    public void init(ServletConfig config) throws ServletException {
    	usersService = UsersService.getInstance();
    	validatorUtil = ValidatorUtil.getInstance();
		jsonUtil = JsonUtil.getInstance();
		gson = new Gson();
    }
    
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		
		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		Long userId = operatingUser.getId();
		PasswordChangeDto passwordChangeDto = gson.fromJson( (String)RequestContext.getAttribute("requestBody"), PasswordChangeDto.class); 
		
		usersService.changePasswordByUserId(passwordChangeDto,userId);
		
		// Response Processing
		CommonObjectResponse<String> responseObject = new CommonObjectResponse<>();
		responseObject.setStatusCode(200);
		responseObject.setData("Password has been successfully changed");
		response.setContentType("application/json");
		response.setStatus(200);
		response.getWriter().write(gson.toJson(responseObject));
	}
	
	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		if(method.equals("GET")) {
			
		}else if(method.equals("PUT")) {
			
			
		}else if(method.equals("POST")) {

			PasswordChangeDto passwordChangeDto = gson.fromJson( (String)RequestContext.getAttribute("requestBody"), PasswordChangeDto.class); 
			usersService.isValidPasswordChangeDTO(passwordChangeDto);
	
			
		}
		return true;
	}

}
	
	
	
	
	
	
	
	
	
