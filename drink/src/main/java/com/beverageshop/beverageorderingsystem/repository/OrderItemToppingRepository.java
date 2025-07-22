package com.beverageshop.beverageorderingsystem.repository;

import com.beverageshop.beverageorderingsystem.entity.OrderItemTopping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemToppingRepository extends JpaRepository<OrderItemTopping, Long> {
}