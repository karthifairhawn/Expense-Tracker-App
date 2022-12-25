package api.v1.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import api.v1.dao.CategoryDaoService;
import api.v1.entity.categories.Categories;
import api.v1.exception.CustomException;
import api.v1.utils.ValidatorUtil;

public class CategoryService {

	
    private static CategoryService categoryService = null;
    private CategoryDaoService categoryDaoService;
    private ValidatorUtil validatorUtil;
    
    private CategoryService() {}
    public static CategoryService getInstance() {
    	if(categoryService==null) {
    		categoryService = new CategoryService();
    		categoryService.categoryDaoService = CategoryDaoService.getInstance();
    		categoryService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return categoryService;
    }
	
    

    public Categories save(Categories newCategory) {
    	return categoryDaoService.save(newCategory);
    }
	

    public List<Categories> findAll() {
    	return categoryDaoService.findAll();
	}
	

    public void deleteById(Long categoryId) {
    	categoryDaoService.removeAssociationById(categoryId);
    	categoryDaoService.deleteById(categoryId);
	}
    

	public Categories update(Categories newCategory) {

		return categoryDaoService.update(newCategory);
		
	}
	
	public Categories findByCategoryId(Long categoryId) {

		return categoryDaoService.findByCategoryId(categoryId);
	}
	
    
    public void validateNewCategory(Categories newCategory) {
    	
    	Map<String,String> errors = new HashMap<String,String>();

    	// Supertype Validation
    	validatorUtil.nullValidation(newCategory,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(newCategory.getName(),errors,"Name");
    	validatorUtil.nullValidation(newCategory.getImagePath(),errors,"Image path");
    	
    	// Duplication validation
    	if(categoryDaoService.findByName(newCategory.getName())!=null) {
    		errors.put("Name","Already used");
    		throw new CustomException(errors.toString(),400);
    	}
    	
    	// Object Cleaning
    	newCategory.setId(null);
    	newCategory.setUserId(null);
    	
    	
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);	
	}

    public void validateUpdateCategory(Categories newCategory) {

    	Map<String,String> errors = new HashMap<String,String>();

    	// Supertype Validation
    	validatorUtil.nullValidation(newCategory,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(newCategory.getName(),errors,"Name");
    	validatorUtil.nullValidation(newCategory.getImagePath(),errors,"Image path");
    	
    	// Ownership Validation
    	if(categoryDaoService.findByCategoryId(newCategory.getId())==null) {
    		errors.put("Category","Not found");
    		throw new CustomException(errors.toString(),400);
    	}
    	
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);	
    }
	
    
    public void validateIsOwnerById(Long userId, Long categoryId) {
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Ownership Validation
    	if(categoryDaoService.findByCategoryId(categoryId)==null) {
    		errors.put("Category","Not found");
    		throw new CustomException(errors.toString(),400);
    	}
    }

    


	
}
