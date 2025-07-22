package com.beverageshop.beverageorderingsystem.repository;

import com.beverageshop.beverageorderingsystem.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOrderTimeBetweenOrderByOrderTimeAsc(LocalDateTime startDate, LocalDateTime endDate);
    List<Order> findByOrderStatusOrderByOrderTimeAsc(Order.OrderStatus status);
}