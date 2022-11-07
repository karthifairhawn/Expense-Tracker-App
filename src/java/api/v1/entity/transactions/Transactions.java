package api.v1.entity.transactions;

import java.util.Date;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Transactions<T> {
	Long id;
	String type;
	Long amount;
	Date timestamp;
	Map<Long,Long> walletSplits;
	
	T transactionInfo;
	
	
}
