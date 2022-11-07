package api.v1.controllers;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public abstract class RestController{

	
	public Boolean isValidRequest(String requestBody,String method) {
		return false;
	}

	public void init(ServletConfig config) throws ServletException {
	
	}
	

	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
	}
	public void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException{
		
	}
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException{
		
	}
	public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException{
		
	}
	
}
