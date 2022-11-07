package api.v1.contexts;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.reflections.Reflections;
import org.reflections.scanners.SubTypesScanner;
import api.v1.annotations.RestControllers;
import api.v1.controllers.RestController;
import api.v1.exception.CustomException;


public class RestControllerContext {

	private static RestControllerContext restControllerContext;
	private static Map<String, Class> controllers;
	private static Map<String,RestController> controllersObject = new LinkedHashMap<String,RestController>();
	
	public static RestControllerContext getInstance() {
		if(restControllerContext==null) {
			restControllerContext = new RestControllerContext();
		}
		return restControllerContext;
	}


	@SuppressWarnings("deprecation")
	public void init() throws IOException {

		controllers = new TreeMap<String, Class>();

		
		Set<Class> allControllers = findAllClassesUsingReflectionsLibrary("api.v1.controllers");

		// Fetch controllers
		for(Class clazz:allControllers) {
			Annotation[] a = clazz.getAnnotations();
			
			
			for(Annotation annotation : a) {  
	           String annotationUsed = annotation.annotationType().getSimpleName();
	           String path = null;
	           if(annotationUsed.equals("RestControllers")){
	        	   RestControllers restControllers = (RestControllers) annotation;
	        	   path = restControllers.path();
	           }
	           
	           if(path!=null)
				controllers.put(path,clazz);
	        }  
		}


		printControllers();
	}


	private void printControllers() {
		System.out.println("\033[32m ");
		System.out.println();
		System.out.println("================= Controllers loaded to app ==================================");
		for(Map.Entry<String,Class> entry:controllers.entrySet()) {
			System.out.println(entry.getKey() + "------------------------------------------------- " + entry.getValue());
		}
		System.out.println("================= -------------------------- ==================================");
		System.out.println();
		System.out.println("\033[37m ");
	}
	
	public Set<Class> findAllClassesUsingReflectionsLibrary(String packageName) {
	    Reflections reflections = new Reflections(packageName, new SubTypesScanner(false));
	    return reflections.getSubTypesOf(Object.class).stream().collect(Collectors.toSet());
	}

	public static RestController getController(String controllerName) {
		
		if(controllersObject.containsKey(controllerName)) return controllersObject.get(controllerName);
		
		
		try {
			System.out.println(controllerName + "");
			controllersObject.put(controllerName,(RestController) (controllers.get(controllerName)).newInstance());
			System.out.println("\033[35m ================ Created new controller instance and stored in context - "+controllerName+" \033[37m");
			
		} catch (InstantiationException | IllegalAccessException e) {
			e.printStackTrace();
			throw new CustomException("Internal server error, please contact admin",500);
		}
		return controllersObject.get(controllerName);
	}
	
	

}
