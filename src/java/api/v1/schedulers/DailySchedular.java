package api.v1.schedulers;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import api.v1.schedulers.jobs.CreditCardDueJob;

@WebListener
public class DailySchedular implements ServletContextListener {

    private ScheduledExecutorService scheduler;

    @Override
    public void contextInitialized(ServletContextEvent event) {
        scheduler = Executors.newSingleThreadScheduledExecutor();
//        scheduler.scheduleAtFixedRate(new DailyJob(), 0, 1, TimeUnit.DAYS);
//        scheduler.scheduleAtFixedRate(new SomeHourlyJob(), 0, 1, TimeUnit.HOURS);
//        scheduler.scheduleAtFixedRate(new CreditCardDueJob(), 0, 15, TimeUnit.MINUTES);
        scheduler.scheduleAtFixedRate(new CreditCardDueJob(), 0, 5, TimeUnit.SECONDS);
    }


	@Override
	public void contextDestroyed(ServletContextEvent arg0) {}


}

