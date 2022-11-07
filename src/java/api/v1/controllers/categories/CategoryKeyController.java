package api.v1.controllers.categories;

import java.io.IOException;
import java.util.ArrayList;

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



@RestControllers(path="/users/{id}/categories/{id}")
public class CategoryKeyController extends RestController {
	private static final long serialVersionUID = 1L;
       

    public CategoryKeyController() {
        super();
    }
    UsersService usersDaoService;
    WalletsService walletsDaoService;
    TagsService tagsDaoService;
    CategoryService categoryService;

	JsonUtil jsonUtil;
	Gson gson;

	
	private static CategoryKeyController categoryKeyController;
  	public static CategoryKeyController getInstance() {
  		// TODO Auto-generated method stub
  		if(categoryKeyController==null) {
  			categoryKeyController = new CategoryKeyController();
  		}
  		return categoryKeyController;
  	}

	
    public void init(ServletConfig config) throws ServletException {
    	walletsDaoService = WalletsService.getInstance();
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		tagsDaoService = TagsService.getInstance();
		categoryService = CategoryService.getInstance();
		gson = new Gson();
    }
    
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long categoryId = Long.parseLong(path[path.length - 1]);
		
		Categories category = categoryService.findByCategoryId(categoryId);
		
		// Response Processing
		CommonObjectResponse<Categories> jsonResponse = new CommonObjectResponse<Categories>(200,category);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}


	public void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long categoryId = Long.parseLong(path[path.length - 1]);
		

		// Getting client data
		Categories newCategory = gson.fromJson((String)RequestContext.getAttribute("requestBody"), Categories.class); 
		if(newCategory != null) newCategory.setId(categoryId);
		
		// Updating Category
		categoryService.update(newCategory);
		
		// Response Processing
		CommonObjectResponse<Categories> jsonResponse = new CommonObjectResponse<Categories>(200,newCategory);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}


	public void doDelete(HttpServletRequest reqs, HttpServletResponse resp) throws ServletException, IOException {

		

		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long categoryId = Long.parseLong(path[path.length - 1]);

		
		// Deleting Category
		categoryService.deleteById(categoryId);
		
		
		// Response Processing
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<String>(200,"Deletion of category is success"); 	
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}


	@Override
	public Boolean isValidRequest(String requestBody, String method) {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long categoryId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		if(method.equals("GET")) {
			
			categoryService.validateIsOwnerById(userId,categoryId);
			
		}else if(method.equals("PUT")) {
			
			Categories category = gson.fromJson(requestBody, Categories.class); 
			categoryService.validateUpdateCategory(category);
			
			
		}else if(method.equals("DELETE")) {

			categoryService.validateIsOwnerById(userId,categoryId);

			
		}
		return true;
	}

}
