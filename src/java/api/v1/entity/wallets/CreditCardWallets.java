package api.v1.entity.wallets;

import java.text.ParseException;
import java.text.SimpleDateFormat;
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
public class CreditCardWallets{
	public CreditCardWallets(LinkedTreeMap walletInfo) {
		this.id = null;
//		SimpleDateFormat dateFormatter=new SimpleDateFormat("dd-MM-yyyy");
//		String dateString = (String) walletInfo.get("repayDate");

		this.repayDate  = Integer.parseInt((String) walletInfo.get("repayDate"));

		this.limit = ((Double) walletInfo.get("limit")).longValue();
	}
	Long id;
	Integer repayDate;
	Long limit;
}
