package api.v1.controllers.tags;

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
import api.v1.entity.Tags;
import api.v1.service.TagsService;
import api.v1.service.UsersService;
import api.v1.service.WalletsService;
import api.v1.utils.JsonUtil;
import api.v1.utils.ValidatorUtil;


@RestControllers(path="/users/{id}/tags")
public class TagsController extends RestController {
	private static final long serialVersionUID = 1L;
       


	public TagsController() { super();}
    
    private static TagsController tagsController;
	public static TagsController getInstance() {
		// TODO Auto-generated method stub
		if(tagsController==null) {
			tagsController = new TagsController();
		}
		return tagsController;
	}

    
    UsersService usersDaoService;
    WalletsService walletsDaoService;
    ValidatorUtil validatorUtil;
    TagsService tagsService;
	JsonUtil jsonUtil;
	Gson gson;

    public void init(ServletConfig config) throws ServletException {
    	walletsDaoService = WalletsService.getInstance();
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		tagsService = TagsService.getInstance();
		validatorUtil = ValidatorUtil.getInstance();
		gson = new Gson();
    }


	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


		// Retrieve Data
		List<Tags> allTags = tagsService.findAll();
		
		
		// Response Processing
		CommonObjectResponse<List<Tags>> jsonResponse = new CommonObjectResponse<List<Tags>>(200,allTags);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		// Getting Client Data
		Tags newTag = gson.fromJson((String)RequestContext.getAttribute("requestBody"), Tags.class); 
		
		// Tag Creation 
		newTag = tagsService.save(newTag);
		
		
		// Response Processing
		CommonObjectResponse<Tags> jsonResponse = new CommonObjectResponse<Tags>(200,newTag);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
	}


	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		
		if(method.equals("GET")) { // No Validation
			
		}else if(method.equals("POST")) {
			
			Tags newTag = gson.fromJson(requestBody, Tags.class); 
			tagsService.validateNewTag(newTag);
			
		}
		
		return true;
	}


}
