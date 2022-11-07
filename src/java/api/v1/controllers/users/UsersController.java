package api.v1.controllers.users;

import java.io.IOException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.dto.CommonObjectResponse;
import api.v1.dto.auth.LoginDto;
import api.v1.entity.Users;
import api.v1.service.UsersService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;





@RestControllers(path = "/users")
public class UsersController extends RestController {

       

	private static UsersController usersController;
	public static RestController getInstance() {
		if(usersController == null) usersController = new UsersController();
		return usersController;
	}
	
    public UsersController() {
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

    								
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// Getting client data
		Users newUser = gson.fromJson( (String)RequestContext.getAttribute("requestBody"), Users.class); 

		
		// User Creation
		newUser =  usersService.save(newUser);
		
		
		// Processing Response
		CommonObjectResponse<Users> jsonResponse = new CommonObjectResponse<Users>(200,newUser);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}

	public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		
	}

	public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		
	}



	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		
		if(method.equals("GET")) {
			
		}else if(method.equals("PUT")) {
			
			
		}else if(method.equals("POST")) {

			Users newUser = gson.fromJson(requestBody, Users.class); 
			usersService.validateNewUserDTO(newUser);
			
		}else if(method.equals("DELETE")) {
			
			LoginDto loginDto = gson.fromJson(requestBody, LoginDto.class);
			usersService.validateLoginRequest(loginDto);
			
			
		}
		
		return true;
	}


}
