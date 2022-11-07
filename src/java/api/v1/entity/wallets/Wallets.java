package api.v1.entity.wallets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Wallets<T> {
	
	public Wallets(Wallets<?> unknownTypeWallet) {
		this.id = unknownTypeWallet.id;
		this.name = unknownTypeWallet.name;
		this.type = unknownTypeWallet.type;
		this.archiveWallet = unknownTypeWallet.archiveWallet;
		this.balance = unknownTypeWallet.balance;
		this.excludeFromStats=unknownTypeWallet.excludeFromStats;
		this.userId = unknownTypeWallet.userId;
	}

	long id;
	String name;
	String type;
	Boolean archiveWallet;
	long balance;
	Boolean excludeFromStats;
	Long userId;	
	
	T walletInfo;
	
}
