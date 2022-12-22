package api.v1.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.contexts.RequestContext;
import api.v1.dao.UsersDaoService;
import api.v1.dto.PasswordChangeDto;
import api.v1.dto.auth.LoginDto;
import api.v1.entity.Users;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;
import api.v1.utils.HashingUtil;
import api.v1.utils.ValidatorUtil;
public class UsersService {
    
	
	
	// Making Service Singleton ---------------------------------------------------------------------------------
    private static UsersService usersService;
    private UsersDaoService usersDaoService;
    private HashingUtil hashingUtil;
    private Gson gson;
    private ValidatorUtil validatorUtil; 
    private UsersService() {}
    public static UsersService getInstance() {
    	if(usersService==null) {
    		usersService = new UsersService();
    		usersService.dbUtil = DatabaseUtil.getInstance();
    		usersService.usersDaoService = UsersDaoService.getInstance();
    		usersService.hashingUtil = HashingUtil.getInstance();
    		usersService.gson = new Gson();
    		usersService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return usersService;
    }
    DatabaseUtil dbUtil;
    
    
    // Authentication Service ---------------------------------------------------------------------------------
    
    public Map<String, String> getAuthToken(LoginDto loginData){
    	
    
    	String authToken = "Authentication failed";
    	Users user = usersDaoService.findByEmailAndPassword(loginData.getEmail(), loginData.getPassword());


    	String s = user.getEmail()+"HelloWorl!23$#%%34"+new Date().toLocaleString();
        authToken = hashingUtil.md5(s);
        
        Map<String,String> resp = new HashMap<String,String>();
//		Users user = usersService.getAuthToken(newLogin);
        resp.put("authToken",authToken);
        resp.put("userId",""+user.getId());
        
        usersDaoService.updateAuthTokenByEmail(user.getEmail(), authToken);
        
        return resp;
    }

    public Users save(Users newUser) {    

    	
    	return usersDaoService.save(newUser);

   
    }
    
    public Users findByAuthToken(String authToken) {
    	return usersDaoService.findByAuthToken(authToken);
    }

    public Boolean validateNewUserDTO(Users newUser) {
    	
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Super type Validation
    	validatorUtil.nullValidation(newUser,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(newUser.getEmail(),errors,"Email ");
    	validatorUtil.nullValidation(newUser.getName(),errors,"Name ");
    	validatorUtil.nullValidation(newUser.getPassword(),errors,"Password ");
    	validatorUtil.nullValidation(newUser.getPhoneNumber(),errors,"Phone Number");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	// Type Validation
    	if(!validatorUtil.isNumeric(newUser.getPhoneNumber())){
    		errors.put("PhoneNumber","Must be numeric");
    	}
    	
    	if(!validatorUtil.isValidEmail(newUser.getEmail())){
    		errors.put("Email","Email invalid");
    	}
    	
    	
    	// Authorization
    	if(usersDaoService.isEmailInUse(newUser.getEmail())) errors.put("Email","Already in use");
    	if(usersDaoService.isPhoneInUse(newUser.getPhoneNumber()))  errors.put("Phone Number","Already in use");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	// Length Constrain
    	if(newUser.getPhoneNumber().length()!=10) errors.put("PhoneNumber","Value must be in length 10");


    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);

		return true;
    }
    
    public Boolean validateLoginRequest(LoginDto loginDto){
    	
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(loginDto,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(loginDto.getEmail(),errors,"Email");
    	validatorUtil.nullValidation(loginDto.getPassword(),errors,"Password");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);

		return true;
    }
	
    public Users update(Users updatingUser) {
		
		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long userId = Long.parseLong(path[path.length - 1]);
		
		updatingUser.setId(userId);
		
		return usersDaoService.update(updatingUser);
	}
	
    public String changePasswordByUserId(PasswordChangeDto passwordChangeDto, Long userId) {
    	 usersDaoService.changePasswordByUserId(passwordChangeDto,userId);
    	 return "Password has been Changed";
	}
	
    public Boolean isValidPasswordChangeDTO(PasswordChangeDto passwordChangeDto) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Super type Validation
    	validatorUtil.nullValidation(passwordChangeDto,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(passwordChangeDto.getOldPassword(),errors,"Old Password ");
    	validatorUtil.nullValidation(passwordChangeDto.getNewPassword(),errors,"New Password ");
    	
    	// Value Validation
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
    	if( !usersDaoService.getPasswordById(operatingUser.getId()).equals(passwordChangeDto.getOldPassword()) ){
    		errors.put("Old password", "Old password is wrong");
    	}

    	if(passwordChangeDto.getNewPassword().length()<8) {
    		errors.put("New password", "New password must be length 8");
    	}

    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
		
    	return true;
	}
    
}

