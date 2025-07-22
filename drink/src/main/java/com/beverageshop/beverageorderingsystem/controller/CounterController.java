package com.beverageshop.beverageorderingsystem.controller;

import com.beverageshop.beverageorderingsystem.entity.Order;
import com.beverageshop.beverageorderingsystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counter")
@PreAuthorize("hasAnyRole('COUNTER', 'ADMIN')") // 只有櫃台和管理員角色可以訪問
@CrossOrigin(origins = "http://localhost:8080")
public class CounterController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/orders/pending")
    public ResponseEntity<List<Order>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getOrdersByStatus(Order.OrderStatus.待處理));
    }

    @PostMapping("/orders/new")
    public ResponseEntity<Order> createCounterOrder(@RequestBody OrderService.OrderRequestDTO orderRequestDTO) {
        // 櫃台新增訂單，邏輯與顧客點餐類似
        return ResponseEntity.ok(orderService.createCounterOrder(orderRequestDTO));
    }

    @PutMapping("/orders/{orderId}/complete")
    public ResponseEntity<Order> completeOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, Order.OrderStatus.已完成));
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, Order.OrderStatus.已取消));
    }
}