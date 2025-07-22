package com.beverageshop.beverageorderingsystem.service;

import com.beverageshop.beverageorderingsystem.entity.Order;
import com.beverageshop.beverageorderingsystem.entity.OrderItem;
import com.beverageshop.beverageorderingsystem.entity.OrderItemTopping;
import com.beverageshop.beverageorderingsystem.entity.Member;
import com.beverageshop.beverageorderingsystem.repository.MemberRepository;
import com.beverageshop.beverageorderingsystem.repository.OrderItemRepository;
import com.beverageshop.beverageorderingsystem.repository.OrderRepository;
import com.beverageshop.beverageorderingsystem.repository.ProductRepository;
import com.beverageshop.beverageorderingsystem.repository.ToppingRepository;
import com.beverageshop.beverageorderingsystem.dto.OrderRequestDTO;
import com.beverageshop.beverageorderingsystem.dto.OrderItemDTO;
import com.beverageshop.beverageorderingsystem.dto.ToppingDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    public class OrderRequestDTO {

	}

	@Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ToppingRepository toppingRepository;

    @Transactional
    public Order createOrder(OrderRequestDTO orderRequestDTO) {
        Order order = new Order();
        order.setTotalAmount(orderRequestDTO.getTotalAmount());
        
        // --- 關鍵修改：將 String 轉換為 Enum ---
        // 確保 orderRequestDTO.getPaymentMethod() 返回的字串與 Order.PaymentMethod 枚舉的名稱完全匹配 (大小寫敏感)
        try {
            order.setPaymentMethod(Order.PaymentMethod.valueOf(orderRequestDTO.getPaymentMethod()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Payment Method: " + orderRequestDTO.getPaymentMethod(), e);
        }

        // 確保 orderRequestDTO.getDeliveryType() 返回的字串與 Order.DeliveryType 枚舉的名稱完全匹配 (大小寫敏感)
        try {
            order.setDeliveryType(Order.DeliveryType.valueOf(orderRequestDTO.getDeliveryType()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Delivery Type: " + orderRequestDTO.getDeliveryType(), e);
        }
        // --- 結束關鍵修改 ---

        order.setPickupDeliveryTime(orderRequestDTO.getPickupDeliveryTime());
        order.setNotes(orderRequestDTO.getNotes());

        if (orderRequestDTO.getPhoneNumber() != null && !orderRequestDTO.getPhoneNumber().isEmpty()) {
            Member member = memberRepository.findByPhoneNumber(orderRequestDTO.getPhoneNumber())
                    .orElseGet(() -> {
                        Member newMember = new Member();
                        newMember.setPhoneNumber(orderRequestDTO.getPhoneNumber());
                        return memberRepository.save(newMember);
                    });
            order.setMember(member);
            // 累計點數邏輯可以在這裡添加
            member.setPoints(member.getPoints() + orderRequestDTO.getTotalAmount().intValue() / 100); // 假設每100元累積1點
            memberRepository.save(member);
        }

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = orderRequestDTO.getOrderItems().stream().map(itemDto -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(productRepository.findById(itemDto.getProductId()).orElseThrow(() -> new RuntimeException("Product not found")));
            orderItem.setProductName(itemDto.getProductName()); // 冗餘數據，方便查詢
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setItemPrice(itemDto.getItemPrice());

            // --- 關鍵修改：將 String 轉換為 Enum 或 Integer ---
            // 確保 itemDto.getSize() 返回的字串與 OrderItem.Size 枚舉的名稱完全匹配 (大小寫敏感)
            try {
                orderItem.setSize(OrderItem.Size.valueOf(itemDto.getSize()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid OrderItem Size: " + itemDto.getSize(), e);
            }

            // 確保 itemDto.getTemperature() 返回的字串與 OrderItem.Temperature 枚舉的名稱完全匹配 (大小寫敏感)
            try {
                orderItem.setTemperature(OrderItem.Temperature.valueOf(itemDto.getTemperature()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid OrderItem Temperature: " + itemDto.getTemperature(), e);
            }

            // 將 String 轉換為 Integer
            // 檢查是否為空字串或 null，並提供預設值或拋出錯誤
            if (itemDto.getSweetnessLevel() != null && !itemDto.getSweetnessLevel().isEmpty()) {
                try {
                    orderItem.setSweetnessLevel(Integer.parseInt(itemDto.getSweetnessLevel()));
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid Sweetness Level (not a number): " + itemDto.getSweetnessLevel(), e);
                }
            } else {
                // 如果是 null 或空字串，根據你的業務邏輯設定預設值或拋出錯誤
                orderItem.setSweetnessLevel(null); // 或設定為 0, -1 等預設值
            }

            if (itemDto.getIceLevel() != null && !itemDto.getIceLevel().isEmpty()) {
                try {
                    orderItem.setIceLevel(Integer.parseInt(itemDto.getIceLevel()));
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid Ice Level (not a number): " + itemDto.getIceLevel(), e);
                }
            } else {
                // 如果是 null 或空字串，根據你的業務邏輯設定預設值或拋出錯誤
                orderItem.setIceLevel(null); // 或設定為 0, -1 等預設值
            }
            // --- 結束關鍵修改 ---

            OrderItem savedOrderItem = orderItemRepository.save(orderItem); // 保存OrderItem以獲取ID

            List<OrderItemTopping> itemToppings = itemDto.getToppings().stream().map(toppingDto -> {
                OrderItemTopping orderItemTopping = new OrderItemTopping();
                orderItemTopping.setOrderItem(savedOrderItem);
                orderItemTopping.setTopping(toppingRepository.findById(toppingDto.getToppingId()).orElseThrow(() -> new RuntimeException("Topping not found")));
                orderItemTopping.setToppingName(toppingDto.getToppingName()); // 冗餘數據
                orderItemTopping.setToppingPrice(toppingDto.getToppingPrice());
                return orderItemTopping;
            }).collect(Collectors.toList());
            savedOrderItem.setOrderItemToppings(itemToppings); // 設置到OrderItem中，因為有cascade
            return savedOrderItem;
        }).collect(Collectors.toList());

        savedOrder.setOrderItems(orderItems); // 設置回訂單，因為有cascade
        return orderRepository.save(savedOrder); // 再次保存以更新關聯
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByOrderStatusOrderByOrderTimeAsc(status);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setOrderStatus(newStatus);
        return orderRepository.save(order);
    }

    // 櫃台頁面新增訂單 (可以重用createOrder，或建立簡化版)
    public Order createCounterOrder(OrderRequestDTO orderRequestDTO) {
        // 邏輯類似createOrder，但可能省略會員點數等
        return createOrder(orderRequestDTO); // 暫時重用
    }

    // 後台統計功能
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderTimeBetweenOrderByOrderTimeAsc(startDate, endDate);
    }
}