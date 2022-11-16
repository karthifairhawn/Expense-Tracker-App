package api.v1.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;

import api.v1.dao.UsersDaoService;
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
    	
    	// Authorization
    	if(usersDaoService.isEmailInUse(newUser.getEmail())) errors.put("Email","Already in use");
    	if(usersDaoService.isPhoneInUse(newUser.getPhoneNumber()))  errors.put("Phone Number","Already in use");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	// Length Constrain
    	if(newUser.getPhoneNumber().length()!=10) errors.put("PhoneNumber","Value must be in length 10");

    	
    	System.out.println("\033[0m "+errors.toString());
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
    
}

