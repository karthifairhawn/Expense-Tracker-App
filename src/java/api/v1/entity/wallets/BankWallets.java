package api.v1.entity.wallets;

import com.google.gson.internal.LinkedTreeMap;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class BankWallets{
//	long accountNumber;
	String note;
	long id;
	
	


	public BankWallets(LinkedTreeMap walletInfo) {

//		this.note = ((Double) walletInfo.get("accountNumber")).longValue();
		this.note = (String) walletInfo.get("note");
//		this.id = walletInfo.get("id")!=null ? (long) walletInfo.get("id") : null;
	}

}
	