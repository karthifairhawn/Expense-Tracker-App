package api.v1.controllers.tags;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

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



@RestControllers(path = "/users/{id}/tags/{id}")
public class TagsKeyController  extends RestController {
	private static final long serialVersionUID = 1L;
       

    public TagsKeyController() {
        super();
        // TODO Auto-generated constructor stub
    }

    private static TagsKeyController tagsKeyController;
  	public static TagsKeyController getInstance() {
  		// TODO Auto-generated method stub
  		if(tagsKeyController==null) {
  			tagsKeyController = new TagsKeyController();
  		}
  		return tagsKeyController;
  	}
  	
    UsersService usersDaoService;
    WalletsService walletsDaoService;
    TagsService tagsService;
	JsonUtil jsonUtil;
	Gson gson;

    public void init(ServletConfig config) throws ServletException {
    	walletsDaoService = WalletsService.getInstance();
    	usersDaoService = UsersService.getInstance();
		jsonUtil = JsonUtil.getInstance();
		tagsService = TagsService.getInstance();

		gson = new Gson();
    }
    
    public void doGet(HttpServletRequest reqs, HttpServletResponse resp) throws ServletException, IOException {
    	// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long tagId = Long.parseLong(path[path.length - 1]);
		
		Tags newTag = tagsService.findById(tagId);
		
		// Response Processing
		CommonObjectResponse<Tags> jsonResponse = new CommonObjectResponse<Tags>(200,newTag);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
		
    }
	
    public void doPut(HttpServletRequest reqs, HttpServletResponse resp) throws ServletException, IOException {
		
		
		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long tagId = Long.parseLong(path[path.length - 1]);
		

		Tags newTag = gson.fromJson((String)RequestContext.getAttribute("requestBody"), Tags.class); 
		if(newTag!=null) newTag.setId(tagId);
		

		
		// Tag Updation 
		tagsService.update(newTag);
		
		
		// Response Processing
		CommonObjectResponse<Tags> jsonResponse = new CommonObjectResponse<Tags>(200,newTag);
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}

	public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		
		// Getting Client Data
		HttpServletRequest request = RequestContext.getAttribute("request");
		HttpServletResponse response = RequestContext.getAttribute("response");
		String[] path =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		
		Long tagId = Long.parseLong(path[path.length - 1]);
		
		// Tag Deletion
		tagsService.deleteById(tagId);
		
		
		// Response Processing
		CommonObjectResponse<String> jsonResponse = new CommonObjectResponse<String>(200,"Deletion of tag is success"); 	
		response.setContentType("application/json");
		response.getWriter().write(gson.toJson(jsonResponse));
	}


	@Override
	public Boolean isValidRequest(String requestBody,String method) {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
		Long tagId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
		if(method.equals("GET")) {
			
			tagsService.validateTagRetrievl(userId, tagId);
			
		}else if(method.equals("PUT")) {
			
			Tags newTag = gson.fromJson(requestBody, Tags.class); 
			tagsService.validateUpdateTag(newTag);
			
		}else if(method.equals("DELETE")) {
			
			tagsService.validateTagDeletion(userId, tagId); 
		}
		
		return true;
	}


}
