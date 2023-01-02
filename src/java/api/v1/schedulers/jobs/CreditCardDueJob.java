package api.v1.schedulers.jobs;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import api.v1.contexts.RequestContext;
import api.v1.dao.wallets.CreditCardWalletsDaoService;
import api.v1.entity.Notifications;
import api.v1.entity.Users;
import api.v1.entity.wallets.CardAlerts;
import api.v1.entity.wallets.CreditCardWallets;
import api.v1.entity.wallets.Wallets;
import api.v1.service.CardAlertsService;
import api.v1.service.NotificationsService;
import api.v1.service.WalletsService;

public class CreditCardDueJob implements Runnable {

    @Override
    public void run() {
        System.out.println("Running daily schedular to alert today due dates to the users");
        RequestContext.initialize();
        Users operatingUser = new Users("","",-1l,"","");
        RequestContext.setAttribute("user", operatingUser);
        
        Map<Wallets, Long> allWallets = CardAlertsService.getInstance().findCardsToAlertByDay(14);
        System.out.println(allWallets);
        
        for(Entry<Wallets, Long> e:allWallets.entrySet()) {
        	
        	Wallets wallet = e.getKey();
        	String title = wallet.getName()+" bill due.";
        	String info = "Remainder : Bill is due in next "+e.getValue()+" days";
        	Long id = wallet.getId();
        	
			Notifications notification = new Notifications(
					null,title,"limit",info,null,System.currentTimeMillis(),id,wallet.getUserId(),false
					);

			NotificationsService.getInstance().save(notification);
			System.out.println(notification);
        }
        
    }
	
}