package api.v1.service;

import java.util.List;

import api.v1.contexts.RequestContext;
import api.v1.dao.CardAlertsDaoService;
import api.v1.dao.RecurringPaymentsDaoService;
import api.v1.entity.RecurringPayments;
import api.v1.entity.Users;
import api.v1.entity.categories.Categories;
import api.v1.utils.ValidatorUtil;

public class RecurringPaymentsService {

    private static RecurringPaymentsService recurringPaymentsService = null;
    private RecurringPaymentsDaoService recurringPaymentsDaoService;
    private ValidatorUtil validatorUtil;
    
    private RecurringPaymentsService() {}
    public static RecurringPaymentsService getInstance() {
    	if(recurringPaymentsService==null) {
    		recurringPaymentsService = new RecurringPaymentsService();
    		recurringPaymentsService.recurringPaymentsDaoService = RecurringPaymentsDaoService.getInstance();
    		recurringPaymentsService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return recurringPaymentsService;
    }
    
    
    public RecurringPayments save(RecurringPayments recurringPayments) {
    	Users operatingUser = (Users)RequestContext.getAttribute("user");

    	
    	recurringPayments.setUserId(operatingUser.getId());
    	return recurringPaymentsDaoService.save(recurringPayments);
    }
	

    public List<RecurringPayments> findAll() {
    	return recurringPaymentsDaoService.findAll();
	}
	

    public void deleteById(Long categoryId) {
    	recurringPaymentsDaoService.deleteById(categoryId);
	}
    

	public RecurringPayments update(RecurringPayments recurringPayments) {

		return recurringPaymentsDaoService.update(recurringPayments);
		
	}
	
	public RecurringPayments findById(Long id) {

		return recurringPaymentsDaoService.findById(id);
	}
	
}
