package api.v1.entity.transactions;

import java.util.Date;

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
	}
	Long id;
	Long walletTo;
	Long walletFrom;
	String note;
	Date timestamp;
	Long transactionId;
}
