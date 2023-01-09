package api.v1.entity.transactions;

import java.util.ArrayList;
import java.util.List;

import com.google.gson.internal.LinkedTreeMap;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Expense {
	Long id;
	String spendOn;
	Long categoryId;
	String reason;
	String note;
	Long transactionId;
	List<Long> tagId;
	






	public Expense(LinkedTreeMap linkedTreeMap) {
		this.categoryId = ((Double) linkedTreeMap.get("categoryId")).longValue();
		this.reason = (String) linkedTreeMap.get("reason");
		this.note = (String) linkedTreeMap.get("note");
		
		List<Double> tags = (List<Double>) linkedTreeMap.get("tagId");
		
		this.tagId = new ArrayList<Long>();
		
		for(Double tag: tags){
			tagId.add(tag.longValue());
		}
		 
		 this.spendOn = (String) linkedTreeMap.get("spendOn");
	}



}
