package com.b2110941.PaymentService.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.b2110941.PaymentService.authorization.Encryption;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private Encryption encryption;

    @GetMapping("/vnpay")
    public ResponseEntity<?> createPaymentUrl(@RequestParam long amount, @RequestParam String orderId) {
        String vnp_TmnCode = "LFY5TSK4";
        String vnp_HashSecret = "12HVTJSE6ERSJT8BRJRMQIMEF6B9RNXY";
        String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        String vnp_ReturnUrl = "http://localhost:3000/payment/callback";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // nhân 100 vì VNPAY tính đơn vị "xu"
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderId); // mã đơn hàng duy nhất
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");
        vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String field : fieldNames) {
            String value = vnp_Params.get(field);
            if (hashData.length() > 0) {
                hashData.append('&');
                query.append('&');
            }
            hashData.append(field).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
            query.append(field).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
        }

        String secureHash = encryption.hmacSHA512(vnp_HashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnp_Url + "?" + query.toString();
        return ResponseEntity.ok(Collections.singletonMap("url", paymentUrl));
    }

    @GetMapping("/callback")
    public ResponseEntity<String> handleVnpayCallback(@RequestParam Map<String, String> allParams) {
        String receivedHash = allParams.remove("vnp_SecureHash");
        String hashSecret = "VNP_HASH_SECRET";

        List<String> sortedKeys = new ArrayList<>(allParams.keySet());
        Collections.sort(sortedKeys);
        StringBuilder hashData = new StringBuilder();
        for (String key : sortedKeys) {
            String value = allParams.get(key);
            if (hashData.length() > 0)
                hashData.append('&');
            hashData.append(key).append('=').append(value);
        }

        String generatedHash = encryption.hmacSHA512(hashSecret, hashData.toString());
        if (generatedHash.equals(receivedHash)) {
            // ✅ Checksum hợp lệ => xử lý đơn hàng
            String orderId = allParams.get("vnp_TxnRef");
            String status = allParams.get("vnp_ResponseCode"); // 00 là thành công
            // TODO: cập nhật trạng thái đơn hàng trong DB

            return ResponseEntity.ok("Giao dịch hợp lệ");
        } else {
            return ResponseEntity.badRequest().body("Giao dịch không hợp lệ");
        }
    }

}