package api.v1.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;
import java.util.Map;

import api.v1.exception.CustomException;

public class DatabaseUtil {

	private DatabaseUtil() {
	}

	private static DatabaseUtil databaseUtil = null;

	private Connection con;
	
	public Connection intiateConnection() throws SQLException {
		try {
			Class.forName("com.mysql.jdbc.Driver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return DriverManager.getConnection("jdbc:mysql://localhost:3306/expense_tracker", "root", "");
	}

	public ResultSet executeInsertionQuery(String query) {
		System.out.println("Query Execution recieved : " + query);

		try {
			con = intiateConnection();
			Statement stmt = con.createStatement();
			stmt.executeUpdate(query, Statement.RETURN_GENERATED_KEYS);
			System.out.println("This query is executed : " + query);
			ResultSet rs = stmt.getGeneratedKeys();
			return rs;
		} catch (SQLException e) {
			System.err.println("Query Execution failed = " + query);
			e.printStackTrace();
        	throw new CustomException("Unexpected failure please contact admin or check your input json.",400,new Date().toLocaleString());
		}
		

	}
	
	public int executeUpdateQuery(String query) {
		System.out.println("Query Execution recieved : " + query);

		try {
			con = intiateConnection();
			Statement stmt = null;
			stmt = con.createStatement();
			int totalUpdates = stmt.executeUpdate(query);
			System.out.println("This query is executed : " + query);
			return totalUpdates;
		} catch (SQLException e) {
			System.err.println("Query Execution failed = " + query);
			e.printStackTrace();
			throw new CustomException("Unexpected failure please contact admin or check your input json.", 400,new Date().toLocaleString());
		}

	}

	public int executeDeletionionQuery(String query) {
		System.out.println("Query Execution recieved : " + query);

		try {
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/expense_tracker", "root", "");
			Statement stmt = null;
			stmt = con.createStatement();
			System.out.println("This query is executed : " + query);
			return stmt.executeUpdate(query);
		} catch (SQLException e) {
			System.err.println("Query Execution failed = " + query);
			e.printStackTrace();
			throw new CustomException("Unexpected failure please contact admin or check your input json.", 400,
					new Date().toLocaleString());
		}

	}

	public ResultSet executeSelectionQuery(String query,int page, int itemsPerPage) throws SQLException {
		
		int offset = (page - 1) * itemsPerPage + 1;
		int limit = itemsPerPage;
		
		try {
			Class.forName("com.mysql.jdbc.Driver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		con = intiateConnection();
		ResultSet rs = null;
		Statement stmt = con.createStatement();
		rs = stmt.executeQuery(query+" limit "+limit+" offset "+offset);
		System.out.println("This query is executed : " + query+" limit "+limit+" offset "+offset);
		return rs;
	}
	
	public ResultSet executeSelectionQuery(String query) throws SQLException {

		con = intiateConnection();

		Statement stmt = con.createStatement();
		ResultSet rs = stmt.executeQuery(query);
		
		System.out.println("This query is executed : " + query);
		return rs;
	}

	
	public static DatabaseUtil getInstance() {
		if (databaseUtil == null) {
			databaseUtil = new DatabaseUtil();
		}
		return databaseUtil;
	}
	
	private  String allAndWhereGenerator(Map<String, String> conditionMap){
		
		
		StringBuffer buffer = new StringBuffer();
		buffer.append(" where ");
		
		boolean first = true;
		for(Map.Entry<String, String> entry : conditionMap.entrySet()) {
			if(first) buffer.append(camelToSnake(entry.getKey()) + " = " + entry.getValue());
			else buffer.append(" and "+ camelToSnake(entry.getKey()) + " = " + entry.getValue());
			first=false;
		}
			
		return buffer.toString();
	}
	
	private  String insertionQueryGenerator(String tableName,Map<String,String> insertMap) {
		StringBuffer key = new StringBuffer();
		StringBuffer values = new StringBuffer();
		
		boolean keyAdded = false;
		boolean valuesAdded = false;
		
		key.append("( ");
		values.append("( ");
		
		
		for(Map.Entry<String, String> entry:insertMap.entrySet()){
			
			if(keyAdded) key.append(" ,'"+camelToSnake(entry.getKey())+"'");
			else  key.append(camelToSnake(entry.getKey()));
					
			if(valuesAdded) values.append(" ,'"+entry.getValue()+"'");
			else values.append(entry.getValue());
			
			
			
			keyAdded=true;
			valuesAdded=true;
		}
		
		key.append(" )");
		values.append(" )");
		
		return "INSERT INTO "+tableName+key.toString()+" Values "+values.toString();
	}
	
	 public static String camelToSnake(String str){

	        String result = "";
	 

	        char c = str.charAt(0);
	        result = result + Character.toLowerCase(c);
	 

	        for (int i = 1; i < str.length(); i++) {
	 
	            char ch = str.charAt(i);

	            if (Character.isUpperCase(ch)) {
	                result = result + '_';
	                result = result + Character.toLowerCase(ch);
	            }

	            else result = result + ch;
	            
	        }
	 

	        return result;
	    }
	

}
