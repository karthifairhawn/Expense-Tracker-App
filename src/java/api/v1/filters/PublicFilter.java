package api.v1.filters;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import api.v1.contexts.RequestContext;
import api.v1.dto.CommonObjectResponse;
import api.v1.exception.CustomException;
import api.v1.utils.JsonUtil;




@WebFilter(filterName="publicFilter")
public class PublicFilter implements Filter {

    public PublicFilter() {}

	public void destroy() {}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		
		System.out.println("\033[33m Public Filter Reached \033[37m");
		RequestContext.initialize();
		HttpServletResponse resp = (HttpServletResponse) response;
		HttpServletRequest req = (HttpServletRequest) request;
		
		String requestBody = JsonUtil.getInstance().getBodyJsonString((HttpServletRequest) request);
		
		
		RequestContext.setAttribute("response",resp);
		RequestContext.setAttribute("request",req);
		RequestContext.setAttribute("requestBody",requestBody);
		Gson gson = new Gson();

		
		try {
			
			chain.doFilter(request, response);	
			
		}catch (CustomException e) {
			e.printStackTrace();
			CommonObjectResponse<String> respObject = new CommonObjectResponse<String>(e.getStatusCode(),e.getError());
			resp.setStatus(respObject.getStatusCode());
			response.setContentType("application/json");
			resp.getWriter().write(gson.toJson(respObject));
		}
		catch (Exception e) {
			e.printStackTrace();
			CommonObjectResponse<String> respObject = new CommonObjectResponse<String>(500,"An unexpected error occured, Try again later");
			response.setContentType("application/json");
			resp.getWriter().write(gson.toJson(respObject));
		}
	
	}


	public void init(FilterConfig fConfig) throws ServletException {}

}
