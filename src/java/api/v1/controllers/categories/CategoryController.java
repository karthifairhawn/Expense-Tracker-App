package api.v1.controllers.categories;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.annotations.RestControllers;
import api.v1.contexts.RequestContext;
import api.v1.controllers.RestController;
import api.v1.dto.CommonObjectResponse;
import api.v1.entity.categories.Categories;
import api.v1.service.CategoryService;
import api.v1.service.TagsService;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;


@RestControllers(path = "/users/{id}/categories")
public class CategoryController  extends RestController {
	private static final long serialVersionUID = 1L;

    public CategoryController() {
        super();
    }
    UsersService usersDaoService;
    WalletsService walletsDaoService;
    TagsService tagsDaoService;
    CategoryService categoryService;
	JsonUtil jsonUtil;
	Gson gson;
	
	 private static CategoryController categoryController;
	  	public static CategoryController getInstance() {
	  		// TODO Auto-generated method stub
	  		if(categoryController==null) {
	  			categoryController = new CategoryController();
	  		}
	  		return categoryController;
	  	}

    public void init(ServletConfig config) throws ServletException {
    	walletsDaoService = WalletsService.getInstance();
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		tagsDaoService = TagsService.getInstance();
		categoryService = CategoryService.getInstance();

		gson = new Gson();
    }
    
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		List<Categories>  allCategories = categoryService.findAll();

		// Response Processing
		CommonObjectResponse<List<Categories>> jsonResponse = new CommonObjectResponse<List<Categories>>(200,allCategories);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// Getting client data
		Categories newCategory = gson.fromJson((String)RequestContext.getAttribute("requestBody"), Categories.class); 
		
		// Creating Category
		newCategory = categoryService.save(newCategory);
		
		// Response Processing
		CommonObjectResponse<Categories> jsonResponse = new CommonObjectResponse<Categories>(201,newCategory);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}

	@Override
	public Boolean isValidRequest(String requestBody, String method) {
		
		if(method.equals("GET")) {
			
				// No Validation
			
		}else if(method.equals("POST")) {
			
			Categories newCategory = gson.fromJson(requestBody, Categories.class); 
			categoryService.validateNewCategory(newCategory);
			
		}
		return true;
	}
	


	

}
