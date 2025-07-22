package com.beverageshop.beverageorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data // Lombok 會自動生成所有欄位的 getter, setter, toString, equals, hashCode
@NoArgsConstructor // Lombok 自動生成無參數建構子
@AllArgsConstructor // Lombok 自動生成包含所有參數的建構子
public class OrderRequestDTO {

    @NotNull(message = "總金額不能為空")
    @DecimalMin(value = "0.0", inclusive = false, message = "總金額必須大於0")
    private BigDecimal totalAmount; // 訂單總金額

    @NotBlank(message = "支付方式不能為空")
    private String paymentMethod; // 支付方式 (例如: Cash, Credit Card, LinePay)

    @NotBlank(message = "配送類型不能為空")
    private String deliveryType; // 配送類型 (例如: StorePickup, Delivery)

    // 對於取貨/配送時間，可能需要更精確的驗證
    private LocalDateTime pickupDeliveryTime; // 取貨或配送時間

    private String notes; // 訂單備註

    private String phoneNumber; // 會員電話號碼，用於綁定會員或創建新會員

    @NotEmpty(message = "訂單項目不能為空")
    @Valid // 確保 OrderItemDTO 內部的驗證也被觸發
    private List<OrderItemDTO> orderItems; // 訂單中的飲品項目列表
    
}