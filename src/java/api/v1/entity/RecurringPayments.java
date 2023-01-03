package api.v1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RecurringPayments {
	
	Long id;
	Long userId;
	Long walletId;
	
	String name;
	String type;
	Long amount;
	String occur;
	String endBy;
	Long lastPaid;
}
