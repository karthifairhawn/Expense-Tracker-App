package api.v1.schedulers.jobs;

import java.util.List;

import api.v1.dao.wallets.CreditCardWalletsDaoService;
import api.v1.entity.wallets.CardAlerts;
import api.v1.entity.wallets.CreditCardWallets;
import api.v1.entity.wallets.Wallets;
import api.v1.service.CardAlertsService;
import api.v1.service.WalletsService;

public class CreditCardDueJob implements Runnable {

    @Override
    public void run() {
        System.out.println("Running daily schedular to alert today due dates to the users");
        
        List<Wallets> allWallets = CardAlertsService.getInstance().findCardsToAlertByDay(14);
        
        System.out.println(allWallets);
        
    }
	
}