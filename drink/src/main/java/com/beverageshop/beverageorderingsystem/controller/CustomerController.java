package com.beverageshop.beverageorderingsystem.controller;

import com.beverageshop.beverageorderingsystem.entity.Product;
import com.beverageshop.beverageorderingsystem.entity.Topping;
import com.beverageshop.beverageorderingsystem.service.OrderService;
import com.beverageshop.beverageorderingsystem.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:8080") // 允許前端 Vue.js 應用程式跨域訪問
public class CustomerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Product>> getActiveProductsByCategory(@PathVariable Product.Category category) {
        return ResponseEntity.ok(productService.getActiveProductsByCategory(category));
    }

    @GetMapping("/toppings")
    public ResponseEntity<List<Topping>> getAllActiveToppings() {
        return ResponseEntity.ok(productService.getAllActiveToppings());
    }

    @PostMapping("/order")
    public ResponseEntity<?> createOrder(@RequestBody OrderService.OrderRequestDTO orderRequestDTO) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(orderRequestDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 金流回調接口 (綠界串接)
    @PostMapping("/payment/ecpay/callback")
    public ResponseEntity<String> handleEcpayCallback(@RequestBody String ecpayCallbackData) {
        // 在這裡處理綠界支付的回調邏輯
        // 解析 ecpayCallbackData，更新訂單狀態等
        System.out.println("收到綠界回調: " + ecpayCallbackData);
        // 實際應用中，需要驗證簽章、更新訂單狀態、給會員增加點數等
        return ResponseEntity.ok("OK"); // 綠界要求回傳 "OK"
    }
}