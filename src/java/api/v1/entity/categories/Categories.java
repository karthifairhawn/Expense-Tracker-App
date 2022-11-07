package api.v1.entity.categories;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Categories {
	Long id;
	String name;
	String imagePath;
	Long userId;
}
