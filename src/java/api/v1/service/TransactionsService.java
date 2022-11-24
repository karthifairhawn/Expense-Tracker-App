package api.v1.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import com.google.gson.Gson;

import api.v1.contexts.RequestContext;
import api.v1.dao.TagsDaoService;
import api.v1.dao.transactions.BaseTransactionsDaoService;
import api.v1.dao.transactions.ExpenseTransactionsDaoService;
import api.v1.dao.transactions.IncomeTransactionDaoService;
import api.v1.dao.transactions.TransferTransactionsDaoService;
import api.v1.dao.wallets.BaseWalletsDaoService;
import api.v1.entity.transactions.Expense;
import api.v1.entity.transactions.Income;
import api.v1.entity.transactions.Transactions;
import api.v1.entity.transactions.Transfer;
import api.v1.exception.CustomException;
import api.v1.utils.DatabaseUtil;
import api.v1.utils.ValidatorUtil;

import com.google.gson.internal.LinkedTreeMap;

public class TransactionsService {

	UsersService usersService;
	BaseTransactionsDaoService baseTransactionsDaoService;
	ExpenseTransactionsDaoService expenseTransactionsDaoService;
	IncomeTransactionDaoService incomeTransactionDaoService;
	TransferTransactionsDaoService transferTransactionsDaoService;
	BaseWalletsDaoService baseWalletsDaoService;
	ValidatorUtil validatorUtil;
	DatabaseUtil dbUtil;
	Gson gson;
	
	private static TransactionsService transactionsService = null;
	TagsDaoService tagsDaoService;
    private TransactionsService() {}
    

    public static TransactionsService getInstance() {
    	if(transactionsService==null) {
    		transactionsService = new TransactionsService();
    		transactionsService.usersService = UsersService.getInstance();
    		transactionsService.gson = new Gson();
    		transactionsService.baseTransactionsDaoService = BaseTransactionsDaoService.getInstance();
    		transactionsService.incomeTransactionDaoService = IncomeTransactionDaoService.getInstance();
    		transactionsService.expenseTransactionsDaoService = ExpenseTransactionsDaoService.getInstance();
    		transactionsService.transferTransactionsDaoService = TransferTransactionsDaoService.getInstance();
    		transactionsService.baseWalletsDaoService = BaseWalletsDaoService.getInstance();
    		transactionsService.tagsDaoService = TagsDaoService.getInstance();
    		transactionsService.validatorUtil = ValidatorUtil.getInstance();
    	}
    	return transactionsService;
    }
	
    public Transactions save(Transactions transaction) {
    	
    	transaction.setTimestamp(new Date());
    	transaction = baseTransactionsDaoService.save(transaction);
    	
    	String type = transaction.getType();
    	Map<Long,Long> walletSplits = transaction.getWalletSplits();
    	
    	
		if(type.equalsIgnoreCase("expense")){
			
			Expense expense = new Expense((LinkedTreeMap)transaction.getTransactionInfo());
			expense.setTransactionId(transaction.getId());
			expenseTransactionsDaoService.save(expense);	
			
			// set tags to the transaction
			List<Long> allTags = expense.getTagId();

			tagsDaoService.assignTagsToExpenseById(allTags, expense.getId());

			// assign wallet splits to the transaction
			baseWalletsDaoService.assignWalletsForExpenses(walletSplits, expense.getId());
		}
		else if(type.equalsIgnoreCase("income")){
			
			Income income = new Income((LinkedTreeMap) transaction.getTransactionInfo());
			income.setTransactionId(transaction.getId());
			incomeTransactionDaoService.save((income) );
			baseWalletsDaoService.increaseBalanceById(income.getWalletId(),transaction.getAmount());
		}
		else if(type.equalsIgnoreCase("transfer")) {
			
			Transfer transfer = new Transfer((LinkedTreeMap) transaction.getTransactionInfo());
			transfer.setTimestamp(transaction.getTimestamp());
			transfer.setTransactionId(transaction.getId());
			transferTransactionsDaoService.save(transfer);
			
			Long walletFrom = transfer.getWalletFrom();
			Long walletTo = transfer.getWalletTo();

			baseWalletsDaoService.reduceBalanceById(walletFrom,transaction.getAmount());
			baseWalletsDaoService.increaseBalanceById(walletTo,transaction.getAmount());
			
			
		}
		
    	
    	return transaction;
    }

	public  Map<String, List<Transactions>> findAll(Map<String, String> queryParams){
		
		Map<String, List<Transactions>> allTransactions =  baseTransactionsDaoService.findAllExpenseBySpendRange(queryParams);
		
		if(queryParams.get("type").equals("expenses")) {
			allTransactions =  baseTransactionsDaoService.findAllExpenseBySpendRange(queryParams);
		}else {
			allTransactions =  baseTransactionsDaoService.findAll(queryParams);
		}

		 
		for(Map.Entry<String,List<Transactions>> e: allTransactions.entrySet()) {
			 List<Transactions> transactions = e.getValue();
			 
			 List<Transactions> completeTransaction = new LinkedList<Transactions>();
			 for(Transactions t:transactions) {
				 completeTransaction.add(findById(t.getId()));
			 }
			 
			 allTransactions.put(e.getKey(),completeTransaction);
		 }

		System.out.println();
		System.out.println();
		System.out.println(allTransactions);
		System.out.println();
		System.out.println();
		 return allTransactions;
		 

	}

	public Transactions findById(Long transactionId) {
		
		Transactions transaction = baseTransactionsDaoService.findById(transactionId);	
		
		// Getting walletInfo
		String transactionType = transaction.getType();
		
		if(transactionType.equalsIgnoreCase("expense")) {
			Expense t = expenseTransactionsDaoService.findByTransactionId(transaction.getId());
			t.setTagId(expenseTransactionsDaoService.findTagMappingById(t.getId()));
		
			
			transaction.setTransactionInfo(t);
			transaction.setWalletSplits(baseWalletsDaoService.findWalletSplitsByExpenseId(t.getId()));
			
		}
			
		else if(transactionType.equalsIgnoreCase("income")) {
			Income t = incomeTransactionDaoService.findByTransactionId(transaction.getId());
			transaction.setTransactionInfo(t);
		}
			
		else if(transactionType.equalsIgnoreCase("transfer")) {
			Transfer t = transferTransactionsDaoService.findByTransactionId(transaction.getId());
			transaction.setTransactionInfo(t);
		}
			
		return transaction;
		
	}

	public void deleteById(Long id){

		Transactions transaction = baseTransactionsDaoService.findById(id);
		String transactionType = transaction.getType();
		Long amount = transaction.getAmount();
		

		if(transactionType.equalsIgnoreCase("expense"))        rollbackExpenseTransactionId(id,amount);
		else if(transactionType.equalsIgnoreCase("transfer"))       rollbackTransferByTransactionId(id,amount);
		else if(transactionType.equalsIgnoreCase("income"))       rollbackIncomeTransactionId(id,amount);
		
		baseTransactionsDaoService.deleteById(id);
	}

	private void rollbackTransferByTransactionId(Long transactionId,Long amount) {
		
		Transfer transfer = transferTransactionsDaoService.findByTransactionId(transactionId);
		Long walletTo = transfer.getWalletTo();
		Long walletFrom = transfer.getWalletFrom();

		baseWalletsDaoService.increaseBalanceById(walletFrom, amount);
		baseWalletsDaoService.reduceBalanceById(walletTo, amount);
		transferTransactionsDaoService.deleteByTransactionId(transactionId);

	}

	private void rollbackExpenseTransactionId(Long transactionId, Long amount) {
		
		Expense expense = expenseTransactionsDaoService.findByTransactionId(transactionId);

		Map<Long,Long> expenseSplit = expenseTransactionsDaoService.findExpenseSplitByExpenseId(expense.getId());
		
		for(Map.Entry<Long, Long> entry : expenseSplit.entrySet()) {
			baseWalletsDaoService.increaseBalanceById(entry.getKey(), entry.getValue());
		}
		
		expenseTransactionsDaoService.deleteExpenseSplitByExpenseId(expense.getId());
		expenseTransactionsDaoService.deleteTagMappingByExpenseId(expense.getId());
		expenseTransactionsDaoService.deleteById(expense.getId());
		
	}

	private void rollbackIncomeTransactionId(Long transactionId, Long amount) {
		
		Income income = incomeTransactionDaoService.findByTransactionId(transactionId);
		
		System.out.println(income);
		
		incomeTransactionDaoService.deleteByTransactionId(transactionId);
		
	}
	
	
	public Boolean validateIsOwnerById(Long userId, Long transactionId) {
		
		Map<String,String> errors = new HashMap<String,String>();
		
		Transactions transaction = baseTransactionsDaoService.findById(transactionId);	
		

		if(transaction==null) {
			errors.put("wallet","Is not exist");
			throw new CustomException(errors.toString(),400);
		}
		return true;

	}

	public Boolean validateUpdateTransactions(Transactions newTransaction){
		
		Map<String,String> errors = new HashMap<String,String>();
		
		validateBaseTransaction(newTransaction);
		
		String type = newTransaction.getType();
		
		if(type.equalsIgnoreCase("expense")) validateExpenseTranscation(new Expense((LinkedTreeMap) newTransaction.getTransactionInfo()));
			
		else if(type.equalsIgnoreCase("income")) validateIncomeTransaction(new Income((LinkedTreeMap) newTransaction.getTransactionInfo()));
			
		else if(type.equalsIgnoreCase("transfer"))  validateTransferTransaction(new Transfer((LinkedTreeMap) newTransaction.getTransactionInfo()));
		
		return true;
	}


	private void validateTransferTransaction(Transfer transfer) {
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(transfer,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(transfer.getWalletTo(),errors,"Wallet To ");
    	validatorUtil.nullValidation(transfer.getWalletFrom(),errors,"Wallet From");
    	validatorUtil.nullValidation(transfer.getNote(),errors,"Note");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
		
	}


	private void validateIncomeTransaction(Income income) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(income,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(income.getNote(),errors,"Note");
    	validatorUtil.nullValidation(income.getWalletId(),errors,"Wallet Id");
    	
    	
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
		
	}


	private void validateExpenseTranscation(Expense expense) {
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(expense,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(expense.getSpendOn(),errors,"Spend On");
    	validatorUtil.nullValidation(expense.getCategoryId(),errors,"Category Id");
    	validatorUtil.nullValidation(expense.getReason(),errors,"Get Reason");
    	validatorUtil.nullValidation(expense.getNote(),errors,"Get Note");
    	validatorUtil.nullValidation(expense.getTagId(),errors,"Get Tag Id");
    	
    	
    	if(expense.getReason().equals("")) expense.setReason(expense.getSpendOn()+"'s expense");
    	

    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	

		
	}


	private void validateBaseTransaction(Transactions newTransaction) {
		
		Long userId = (Long) ((ArrayList) RequestContext.getAttribute("pathKeys")).get(0);
//		Long transactioId = (Long) ((ArrayList)RequestContext.getAttribute("pathKeys")).get(1);
		
    	Map<String,String> errors = new HashMap<String,String>();
    	
    	// Supertype Validation
    	validatorUtil.nullValidation(newTransaction,errors,"Request body");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);
    	
    	
    	// Null Validation
    	validatorUtil.nullValidation(newTransaction.getType(),errors,"Type");
    	validatorUtil.nullValidation(newTransaction.getAmount(),errors,"Amoubt");
    	if(newTransaction.getType().equalsIgnoreCase("expense")) validatorUtil.nullValidation(newTransaction.getWalletSplits(),errors,"Wallet Splits");
    	if(errors.size() > 0) throw new CustomException(errors.toString(),400);

//    	// Ownership Validation
//    	if(baseTransactionsDaoService.findById(transactioId)==null) {
//    		errors.put("Trasactions","Not existi in account");
//    		throw new CustomException(errors.toString(),404);
//    	}
		
	}

}
