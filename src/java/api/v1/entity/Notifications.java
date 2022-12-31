package api.v1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Notifications {

	Long id;
	String title;
	String type;
	String info;
	String action;
	Long createdOn;
	Long entityKey;
	Long userId;
	Boolean readed;
	
}
