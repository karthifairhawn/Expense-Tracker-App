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
		this.repayDate  = Integer.parseInt((walletInfo.get("repayDate")+"").split("\\.")[0]);
		this.limit = Long.parseLong((walletInfo.get("limit")+"").split("\\.")[0]);
	}
	Long id;
	Integer repayDate;
	Long limit;
}
