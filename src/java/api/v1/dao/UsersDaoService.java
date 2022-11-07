package api.v1.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

import api.v1.entity.Users;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;

public class UsersDaoService {

    private static UsersDaoService usersDaoService;
    private UsersDaoService() {}
    public static UsersDaoService getInstance() {
    	if(usersDaoService==null) {
    		usersDaoService = new UsersDaoService();
    		usersDaoService.dbUtil = DatabaseUtil.getInstance();
    	}
    	return usersDaoService;
    }
    DatabaseUtil dbUtil;
    
    
    
    public Users findByAuthToken(String authToken) {
    	ResultSet rs = null;
        try {
            rs = dbUtil.executeSelectionQuery("SELECT * FROM `users` where session_key='"+authToken+"' ");
            rs.next();
            Users foundUser = new Users(rs.getString("email"),rs.getString("phone_number"),Integer.parseInt(rs.getString("id")),null,rs.getString("name"));
            return foundUser;

        } catch (SQLException e) {
        	throw new CustomException("User Retrievel Failed  = Authtoken is not matched with any of accounts available in the database",404,new Date().toLocaleString());
        }
    }
    
    public Users findByEmailAndPassword(String email,String password) {

        try {
            ResultSet rs = dbUtil.executeSelectionQuery("SELECT * FROM `users` where (email='"+email+"' and password='"+password+"')");
            rs.next();
            Users foundUser = new Users(rs.getString("email"),rs.getString("phone_number"),Integer.parseInt(rs.getString("id")),"",rs.getString("name"));
            return foundUser;

        } catch (SQLException e) {
        	e.printStackTrace();
        	throw new CustomException("Invalid email or password",404,new Date().toLocaleString());
        }
    }
	
    public void updateAuthTokenByEmail(String email,String authToken) {
    	DatabaseUtil dbUtil = DatabaseUtil.getInstance();
    	System.out.println("trying to update session key " + email);
    	dbUtil.executeInsertionQuery("update users set session_key = '" + authToken +"' where email = '" + email + "' ");
    }

    public boolean isEmailInUse(String email){
    	 try {
             ResultSet rs = dbUtil.executeSelectionQuery("SELECT COUNT(*) FROM `users` where (email='"+email+"')");
             rs.next();
             int count = rs.getInt(1);
             if(count==0) return false;
         
         } catch (SQLException e) {
             e.printStackTrace();
             throw new CustomException("Unexpeted error please contact admin.",500,new Date().toLocaleString());
         }
    	 return true;
    }
    
    public boolean isPhoneInUse(String phoneNumber){
		 try {
             ResultSet rs = dbUtil.executeSelectionQuery("SELECT COUNT(*) FROM `users` where (phone_number='"+phoneNumber+"')");
		     rs.next();
		     int count = rs.getInt(1);
		     if(count==0) return false;
		 
		 } catch (SQLException e) {
		     e.printStackTrace();
		     throw new CustomException("Unexpeted error please contact admin.",500,new Date().toLocaleString());
		 }
		 return true;
    }
    
    public Users save(Users newUser){
        ResultSet rs = dbUtil.executeInsertionQuery("INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone_number`,`session_key`) VALUES (NULL, '"+newUser.getName()+"', '"+newUser.getEmail()+"', '"+newUser.getPassword()+"', '"+newUser.getPhoneNumber()+"','"+newUser.getEmail()+"')");
		try {
	        if(rs.next()) newUser.setId(rs.getInt(1));
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("User Creation failed",500,new Date().toLocaleString());
		}

		return newUser;
    }
}
