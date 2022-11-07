package api.v1.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import api.v1.contexts.RequestContext;
import api.v1.entity.Tags;
import api.v1.entity.Users;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;

public class TagsDaoService {

	
	DatabaseUtil dbUtil;
	
	private static TagsDaoService tagsDaoService = null;
    private TagsDaoService() {}
    public static TagsDaoService getInstance() {
    	if(tagsDaoService==null) {
    		tagsDaoService = new TagsDaoService();
    		tagsDaoService.dbUtil  = DatabaseUtil.getInstance();
    	}
    	return tagsDaoService;
    }
	
    public Tags save(Tags newTag) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		String sql = "INSERT INTO `tags`(`name`, `color`, `user_id`) VALUES ('"+newTag.getName()+"','"+newTag.getColor()+"','"+operatingUser.getId()+"')";
		
		try {
			ResultSet rs = dbUtil.executeInsertionQuery(sql);
			rs.next();
			newTag.setId(rs.getLong(1));
			newTag.setUserId((long) operatingUser.getId());

		} catch (SQLException e) {
			throw new CustomException("Creation of category failed",400,new Date().toLocaleString());
		}
		return newTag;
	}
	
    public List<Tags> findAll() {
    	

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		List<Tags> result = new LinkedList<Tags>();
		String sql = "Select * from tags where user_id = " + operatingUser.getId();
		
		try {
			ResultSet rs = dbUtil.executeSelectionQuery(sql);
			
			while(rs.next()){
				Tags c = new Tags(rs.getLong("id"),rs.getString("name"),rs.getString("color"),rs.getLong("user_id"));
				result.add(c);
			}
			
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Retrive all categories failed",400,new Date().toLocaleString());
		}
		
		return result;
	}
    
	public void deleteById(Long tagId) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "DELETE FROM `tags` WHERE id = " + tagId+" and user_id = " + operatingUser.getId();
		
		int rs = dbUtil.executeDeletionionQuery(sql);
		if(rs==0) throw new CustomException("The tag is not found in this account",404,new Date().toLocaleString());
	}

	public Tags update(Tags newTag) {

		Users operatingUser = (Users)RequestContext.getAttribute("user");
		String sql = "UPDATE `tags` SET `color`='"+newTag.getColor()+"',`name`='"+newTag.getName()+"' WHERE user_id="+operatingUser.getId()+" and id="+newTag.getId();
		
		int rs = dbUtil.executeUpdateQuery(sql);
		if(rs==0) throw new CustomException("Updation failed pass in valid data.",400,new Date().toLocaleString());
		
		return newTag;
	}
    
	public void assignTagsToExpenseById(List<Long> allTags, Long expenseId) {
		Set<Long> targetSet = new HashSet<>(allTags);
		allTags = new ArrayList<>(targetSet);
		List<Double> failedTagCreation = new LinkedList<Double>();
		
		for(Long tagId : allTags) {
		
			try {
				String sql = "INSERT INTO `expense_tag_mapping`(`expense_id`, `tag_id`) VALUES ('"+expenseId+"','"+tagId+"')";
				ResultSet rs = dbUtil.executeInsertionQuery(sql);
				rs.next();
				
			} catch (Exception e) {
				
			}
		}
		
		if(failedTagCreation.size()>0) {
			throw new CustomException("Creation of some tags for the expense transaction failed"+failedTagCreation,400,new Date().toLocaleString());
		}
	}

	public List<Long> findTagsAssignedByExpenseId(Long expenseId) {
		List<Long> allTags = new LinkedList<>();
		ResultSet rs;
		String sql = "SELECT * FROM `expense_tag_mapping` WHERE expense_id = "+expenseId;
		
		try {
			rs = dbUtil.executeSelectionQuery(sql);

			while (rs.next()) {
				allTags.add(rs.getLong("id"));
			}
			allTags.add((long) -1);
		} catch (SQLException e) {
			e.printStackTrace();
			throw new CustomException("Problem in retriving your transaction", 500,new Date().toLocaleString());
		}
		return allTags;
	}
	
	public Tags findById(Long tagId) {
		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		String query = "SELECT * FROM `tags` where id = " + tagId+" and user_id = " + operatingUser.getId();
		ResultSet rs;
		Tags newTag;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			newTag = new Tags();
			newTag.setId(rs.getLong("id"));
			newTag.setName(rs.getString("name"));
			newTag.setColor(rs.getString("color"));
			newTag.setUserId(rs.getLong("user_id"));
			
		}catch(Exception e){
			return null;
		}
		return newTag;
		
	}
	
	public Tags findByName(String name) {

		
		Users operatingUser = (Users)RequestContext.getAttribute("user");
		
		String query = "SELECT * FROM `tags` where name = '" + name+"' and user_id = " +operatingUser.getId();
		ResultSet rs;
		Tags newTag;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			newTag = new Tags();
			newTag.setId(rs.getLong("id"));
			newTag.setName(rs.getString("name"));
			newTag.setColor(rs.getString("color"));
			newTag.setUserId(rs.getLong("user_id"));
			
		}catch(Exception e){
			return null;
		}
		return newTag;
	}

	public Boolean isTagOwnerById(Long ownerId,Long tagId) {
		
		String query = "SELECT count(*) FROM `tags` where id = " + tagId+" and user_id = " +ownerId;
		ResultSet rs;
		Tags newTag;
		try {
			rs = dbUtil.executeSelectionQuery(query);
			rs.next();
			if(rs.getInt(1)>0) return true;
			
		}catch(Exception e){
			return null;
		}
		return false;
	}
}

