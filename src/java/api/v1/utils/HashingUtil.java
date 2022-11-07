package api.v1.utils;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashingUtil {
	
	private HashingUtil() {}
	private static HashingUtil hashingUtil;
	public static HashingUtil getInstance(){
		if(hashingUtil == null){
			hashingUtil = new HashingUtil();
		}
		return hashingUtil;
	}

	public String md5(String value) {
		MessageDigest m = null;
		try {
			m = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        m.update(value.getBytes(),0,value.length());
        return new BigInteger(1,m.digest()).toString(16);
	}
}
