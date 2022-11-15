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
	long accountNumber;
	String ifscCode;
	long id;
	
	


	public BankWallets(LinkedTreeMap walletInfo) {

		this.accountNumber = ((Double) walletInfo.get("accountNumber")).longValue();
		this.ifscCode = (String) walletInfo.get("ifscCode");
//		this.id = walletInfo.get("id")!=null ? (long) walletInfo.get("id") : null;
	}
}
	