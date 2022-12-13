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
public class Income {
	

	public Income(LinkedTreeMap transactionInfo) {
		this.walletId = ((Double)transactionInfo.get("walletId")).longValue();
		this.note = (String) transactionInfo.get("note");
	}

	Long id;
	String note;
	Long transactionId;
	Long walletId;
}
