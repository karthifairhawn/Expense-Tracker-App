package api.v1.utils;

import java.util.Map;
import java.util.regex.Pattern;

public class ValidatorUtil {


	private static ValidatorUtil validatorUtil = null;
    private ValidatorUtil() {}
    public static ValidatorUtil getInstance() {
    	if(validatorUtil==null) {
    		validatorUtil = new ValidatorUtil();
    	}
    	return validatorUtil;
    }
    
    
    public void nullValidation(Object value, Map<String, String> errors,String key) { 
    	if(value==null) errors.put(key, " value is empty");
    }
	



    public boolean isNumeric(String strNum) {
    	
        Pattern pattern = Pattern.compile("-?\\d+(\\.\\d+)?");
        
        if (strNum == null) {
            return false; 
        }
        return pattern.matcher(strNum).matches();
    }
    

}
