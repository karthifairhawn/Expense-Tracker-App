package api.v1.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import api.v1.contexts.RequestContext;
import api.v1.entity.Users;
import api.v1.entity.categories.Categories;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;
import api.v1.utils.ValidatorUtil;


public class CategoryDaoService {
	
	DatabaseUtil dbUtil;
	private ValidatorUtil validatorUtil;

    private static CategoryDaoService categoryDaoService = null;
    private CategoryDaoService() {}
    public static CategoryDaoService getInstance() {
    	if(categoryDaoService==null) {
    		categoryDaoService = new CategoryDaoService();
    		categoryDaoService.dbUtil = DatabaseUtil.getInstance();
    		categoryDaoService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return categoryDaoService;
    }



    public Categories save(Categories newCategory) {
    	
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		// Creating the Category 
		String sql = "INSERT INTO `categories`(`image_path`, `name`,`user_id`) VALUES ('"+newCategory.getImagePath()+"','"+newCategory.getName()+"',"+operatingUser.getId()+")";
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			newCategory.setId(rs.getLong(1));
			newCategory.setUserId((long) operatingUser.getId());
		} catch (SQLException e) {
			throw new CustomException("Creation of category failed",400,new Date().toLocaleString());
		}
		
		
		return newCategory;
    }

    public Categories update(Categories category){
    	
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "UPDATE `categories` SET `image_path`='"+category.getImagePath()+"',`name`='"+category.getName()+"' WHERE user_id="+operatingUser.getId()+" and id="+category.getId();
	
		int rs = dbUtil.executeUpdateQuery(sql);
		if(rs==0) throw new CustomException("Updation failed pass in valid data.",400,new Date().toLocaleString());
		
		return category;
		
    }
    
    public List<Categories> findAll(){
    	// Getting operating user
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		List<Categories> result = new LinkedList<Categories>();
		String sql = "Select * from categories where user_id = " + operatingUser.getId();
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			while(rs.next()){
				Categories c = new Categories(rs.getLong("id"),rs.getString("name"),rs.getString("image_path"),rs.getLong("user_id"));
				result.add(c);
			}
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all categories failed",400,new Date().toLocaleString());
		}
		
		return result;
    }
    
    public void deleteById(Long categoryId) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "DELETE FROM `categories` WHERE id = " + categoryId+" and user_id = " + operatingUser.getId();
		
		int rs = dbUtil.executeDeletionionQuery(sql);
		if(rs==0) throw new CustomException("The category is not found in this account",404,new Date().toLocaleString());
	
    }

    
    public Categories findByCategoryId(Long categoryId) {
    	
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
    	
    	String query = "SELECT * FROM `categories` where id = " + categoryId+" and user_id = " + operatingUser.getId();
		ResultSet rs;
		Categories category;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			category = new Categories();
			category.setId(rs.getLong("id"));
			category.setImagePath(rs.getString("image_path"));	
			category.setName(rs.getString("name"));
			category.setUserId(rs.getLong("user_id"));
			
		}catch(Exception e){
			e.printStackTrace();
			return null;
		}
		return category;
	}
	
    public Categories findByName(String name) {
    	
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
    	
    	
    	String query = "SELECT * FROM `categories` where name = '" + name+"' and user_id = " + operatingUser.getId();
		ResultSet rs;
		Categories category;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			category = new Categories();
			category.setId(rs.getLong("id"));
			category.setImagePath(rs.getString("image_path"));	
			category.setName(rs.getString("name"));
			category.setUserId(rs.getLong("user_id"));
			
		}catch(Exception e){
			e.printStackTrace();
			return null;
		}
		return category;
	}
	
    public void removeAssociationById(Long categoryId) {
    	Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "UPDATE `expenses` SET `category_id`=0 WHERE `category_id`="+categoryId;
		int rs = dbUtil.executeUpdateQuery(sql);
	}
    
    

    
}
