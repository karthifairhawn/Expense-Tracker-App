package api.v1;


import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import api.v1.contexts.RequestContext;
import api.v1.contexts.RestControllerContext;
import api.v1.controllers.RestController;
import api.v1.exception.CustomException;
import api.v1.utils.ValidatorUtil;



@WebServlet("/api/v1/*")
public class DisptacherServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
  
    public DisptacherServlet() {
        super();
        // TODO Auto-generated constructor stub
    }


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String path[] =  request.getPathInfo().length()>0 ? request.getPathInfo().substring(1).split("/") : null ;
		String exactPath = getExactPath(path);
		
		RestController restController = RestControllerContext.getController(exactPath);
		
		if(restController==null) throw new CustomException("URI not found",404);
		
		
		dispatchRequest(restController, request, response);
	}
	
	private String getExactPath(String[] path) {
		List<Long> pathKeys = new ArrayList<Long>();
		String result = "";
		for(String pathValue : path) {
			String toAdd = ValidatorUtil.getInstance().isNumeric(pathValue) ? "/{id}" : "/"+pathValue;
			result+=toAdd;
			if(ValidatorUtil.getInstance().isNumeric(pathValue)) pathKeys.add(Long.parseLong(pathValue));
		}
		RequestContext.setAttribute("pathKeys", pathKeys);
		return result;
	}
	
	private void dispatchRequest(RestController controller, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		
		
		String method = request.getMethod();
		
		String requestBody = RequestContext.getAttribute("requestBody");
		
		controller.init(null);
		Boolean isValidRequest = controller.isValidRequest(requestBody,method);
		System.out.println(method+"---");

		
		
		if(isValidRequest){
			
			if(method.equals("GET")) controller.doGet(request, response);
			else if(method.equals("PUT")) controller.doPut(request, response);
			else if(method.equals("POST")) controller.doPost(request, response);
			else if(method.equals("DELETE")) controller.doDelete(request, response);
	
		}else {
			throw new CustomException("Validation is not handled for this request, Please contact admin.",500);
		}
	}
	
	


}
