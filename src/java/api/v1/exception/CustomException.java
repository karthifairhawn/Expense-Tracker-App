package api.v1.exception;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CustomException extends RuntimeException {
	
	public CustomException(String message,int statusCode) {
		this.error = message;
		this.statusCode = statusCode;
		this.timestamp = new Date().toLocaleString();
	}
	
	String error;
	int statusCode;
	String timestamp;

}
