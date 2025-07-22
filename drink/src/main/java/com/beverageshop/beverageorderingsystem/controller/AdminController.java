package com.beverageshop.beverageorderingsystem.controller;

import com.beverageshop.beverageorderingsystem.entity.Product;
import com.beverageshop.beverageorderingsystem.entity.Topping;
import com.beverageshop.beverageorderingsystem.entity.Order;
import com.beverageshop.beverageorderingsystem.service.OrderService;
import com.beverageshop.beverageorderingsystem.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // 只有管理員角色可以訪問
@CrossOrigin(origins = "http://localhost:8080")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    // --- 飲料品項管理 ---
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.getProductById(id)
                .map(existingProduct -> {
                    existingProduct.setName(product.getName());
                    existingProduct.setCategory(product.getCategory());
                    existingProduct.setPriceSmall(product.getPriceSmall());
                    existingProduct.setPriceLarge(product.getPriceLarge());
                    existingProduct.setImageUrl(product.getImageUrl());
                    existingProduct.setIsActive(product.getIsActive());
                    existingProduct.setCanBeHot(product.getCanBeHot());
                    existingProduct.setCanBeCold(product.getCanBeCold());
                    existingProduct.setMinSweetnessLevel(product.getMinSweetnessLevel());
                    existingProduct.setMaxSweetnessLevel(product.getMaxSweetnessLevel());
                    existingProduct.setMinIceLevel(product.getMinIceLevel());
                    existingProduct.setMaxIceLevel(product.getMaxIceLevel());
                    return ResponseEntity.ok(productService.saveProduct(existingProduct));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts()); // 可以改成findAll() for admin
    }


    // --- 副料管理 ---
    @PostMapping("/toppings")
    public ResponseEntity<Topping> createTopping(@RequestBody Topping topping) {
        return ResponseEntity.ok(productService.saveTopping(topping));
    }

    @PutMapping("/toppings/{id}")
    public ResponseEntity<Topping> updateTopping(@PathVariable Long id, @RequestBody Topping topping) {
        return productService.getToppingById(id)
                .map(existingTopping -> {
                    existingTopping.setName(topping.getName());
                    existingTopping.setPrice(topping.getPrice());
                    existingTopping.setIsActive(topping.getIsActive());
                    return ResponseEntity.ok(productService.saveTopping(existingTopping));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/toppings/{id}")
    public ResponseEntity<Void> deleteTopping(@PathVariable Long id) {
        productService.deleteTopping(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/toppings")
    public ResponseEntity<List<Topping>> getAllToppings() {
        return ResponseEntity.ok(productService.getAllActiveToppings()); // 可以改成findAll() for admin
    }

    // --- 訂單與統計 ---
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/daily")
    public ResponseEntity<List<Order>> getDailyOrders(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return ResponseEntity.ok(orderService.getOrdersByDateRange(startOfDay, endOfDay));
    }

    @GetMapping("/orders/weekly")
    public ResponseEntity<Map<String, BigDecimal>> getWeeklySales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        LocalDateTime startOfWeek = startDate.atStartOfDay();
        LocalDateTime endOfWeek = startDate.plusDays(6).atTime(LocalTime.MAX);
        List<Order> orders = orderService.getOrdersByDateRange(startOfWeek, endOfWeek);

        // 簡單的日銷售額統計
        Map<String, BigDecimal> dailySales = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getOrderTime().toLocalDate().toString(),
                        Collectors.mapping(Order::getTotalAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
        return ResponseEntity.ok(dailySales);
    }

    @GetMapping("/orders/monthly")
    public ResponseEntity<Map<String, BigDecimal>> getMonthlySales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        LocalDateTime startOfMonth = month.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = month.withDayOfMonth(month.lengthOfMonth()).atTime(LocalTime.MAX);
        List<Order> orders = orderService.getOrdersByDateRange(startOfMonth, endOfMonth);

        // 簡單的日銷售額統計
        Map<String, BigDecimal> dailySales = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getOrderTime().toLocalDate().toString(),
                        Collectors.mapping(Order::getTotalAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));
        return ResponseEntity.ok(dailySales);
    }
}