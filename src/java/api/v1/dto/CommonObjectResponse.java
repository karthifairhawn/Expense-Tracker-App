package api.v1.dto;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CommonObjectResponse<T> {
	
	public CommonObjectResponse(int statusCode2, T message) {
		this.statusCode = statusCode2;
		this.data = (T) message;
		this.timestamp = new Date().toLocaleString();
	}



	int statusCode;
	
	String timestamp;
	
	T data;
	
}
