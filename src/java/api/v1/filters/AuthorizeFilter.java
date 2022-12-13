package api.v1.filters;

import java.io.IOException;
import java.util.Date;

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
import api.v1.entity.Users;
import api.v1.exception.CustomException;
import api.v1.service.UsersService;

@WebFilter(filterName="authFilter")
public class AuthorizeFilter extends Thread implements Filter {	

	@Override
	public void destroy() {}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)throws IOException, ServletException {
		
		System.out.println("\033[33m AuthorizeFilter Reached \033[37m");
		HttpServletResponse resp = (HttpServletResponse) response;
		HttpServletRequest req = (HttpServletRequest) request;
		

		// No authentication for login and Account Creation
		if(req.getPathInfo().contains("/login") || req.getPathInfo().endsWith("/users") ) { chain.doFilter(request, response); return; }

		resp.setContentType("application/json");
		
		String authToken = ((HttpServletRequest) request).getHeader("Authorization");
		UsersService usersDaoService = UsersService.getInstance();
		
		if((authToken == null || authToken.split(" ").length == 0)) throw new CustomException("Please provide authorization value in header to valadiate you",401,new Date().toLocaleString());
		Users accessingUser = usersDaoService.findByAuthToken(authToken.split(" ")[1]);
	
		RequestContext.setAttribute("user",accessingUser);

		
		System.out.println("\033[32m Passed Authorization -------"+accessingUser.getEmail()+"  \033[37m");
		chain.doFilter(request, response);
			

		
	}

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {}


}
