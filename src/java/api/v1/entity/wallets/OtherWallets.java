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
public class OtherWallets {

	public OtherWallets(LinkedTreeMap walletInfo) {
		this.note = (String) walletInfo.get("note");
	}
	String note;
	long id;
}
