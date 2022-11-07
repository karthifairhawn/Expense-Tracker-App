package api.v1;


import java.io.IOException;

import javax.servlet.ServletContextEvent;
import javax.servlet.annotation.WebListener;

import api.v1.contexts.RestControllerContext;



@WebListener
public class ApplicationStarter implements javax.servlet.ServletContextListener {

    public ApplicationStarter() {
        // TODO Auto-generated constructor stub
    }


    public void contextDestroyed(ServletContextEvent arg0)  { 
         // TODO Auto-generated method stub
    }


    public void contextInitialized(ServletContextEvent arg0)  { 
    	
         System.out.println("Server Started");
         
         // Initit\ate RestControllerContext
         RestControllerContext restControllerContext = RestControllerContext.getInstance();
         
         try {
			restControllerContext.init();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
	
}
