package api.v1.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import api.v1.contexts.RequestContext;
import api.v1.dao.TagsDaoService;
import api.v1.entity.Tags;
import api.v1.exception.CustomException;
import api.v1.utils.ValidatorUtil;

public class TagsService extends Thread {



	TagsDaoService tagsDaoService;
	ValidatorUtil validatorUtil;
	
	private static TagsService tagsService = null;
    private TagsService() {}
    public static TagsService getInstance() {
    	if(tagsService==null) {
    		tagsService = new TagsService();
    		tagsService.tagsDaoService = TagsDaoService.getInstance();
    		tagsService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return tagsService;
    }
	
    
    
    public Tags save(Tags newTag) {
    	return tagsDaoService.save(newTag);
	}
	
    public List<Tags> findAll() {
    	return tagsDaoService.findAll();
	}
    
	public void deleteById(Long tagId) {
		tagsDaoService.deleteById(tagId);	
	}

	public Tags update(Tags newTag) {
		return tagsDaoService.update(newTag);
	}
	
	public Tags findById(Long tagId) {
		return tagsDaoService.findById(tagId);
	}

	
	
    
    public boolean validateNewTag(Tags newTag) {
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(newTag,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(newTag.getName(),errors,"Name");
    	validatorUtil.nullValidation(newTag.getColor(),errors,"Color");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	// Duplicate Validation
    	if(tagsDaoService.findByName(newTag.getName())!=null) {
    		errors.put("Name","Already used");
    		throw new CustomException(errors.toString(),400);
    	}

    	
		return true;
		
	}
	
    public void validateUpdateTag(Tags newTag) {
		
    	Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long tagId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);

    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(newTag,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(newTag.getName(),errors,"Name");
    	validatorUtil.nullValidation(newTag.getColor(),errors,"Color");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	// Ownership Validation
    	Tags tag = tagsDaoService.findById(tagId);
    	if(tag==null || tag.getUserId()!=userId) {
    		errors.put("Tag","Not exist");
    		throw new CustomException(errors.toString(),404);
    	}

		
	}
    
    public void validateTagDeletion(Long userId,Long tagId) {
    	
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Ownership Validation
    	boolean isOwner = tagsDaoService.isTagOwnerById(userId,tagId);
	   	 if(!isOwner) {
	   		 errors.put("Tag","Not exist");
	    		throw new CustomException(errors.toString(),404);
	   	 }
    }
	
    public void validateTagRetrievl(Long userId, Long tagId) {
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	 boolean isOwner = tagsDaoService.isTagOwnerById(userId,tagId);
    	 if(!isOwner) {
    		 errors.put("Tag","Not exist");
     		throw new CustomException(errors.toString(),404);
    	 }
		
	}
	
	
    
    

}
