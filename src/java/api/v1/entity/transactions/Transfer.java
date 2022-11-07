package api.v1.entity.transactions;

import com.google.gson.internal.LinkedTreeMap;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Transfer {
	
	public Transfer(LinkedTreeMap transactionInfo) {
		this.walletTo = ((Double) transactionInfo.get("walletTo")).longValue();
		this.walletFrom = ((Double) transactionInfo.get("walletFrom")).longValue();
		this.note = (String) transactionInfo.get("note");
		this.timestamp = (String) transactionInfo.get("timestamp");
	}
	Long id;
	Long walletTo;
	Long walletFrom;
	String note;
	String timestamp;
	Long transactionId;
}
