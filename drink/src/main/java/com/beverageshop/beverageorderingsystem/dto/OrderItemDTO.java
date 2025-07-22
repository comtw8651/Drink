package com.beverageshop.beverageorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    @NotNull(message = "商品ID不能為空")
    private Long productId; // 商品ID (飲品)

    @NotBlank(message = "商品名稱不能為空")
    private String productName; // 商品名稱 (冗餘數據，方便查詢)

    @NotNull(message = "數量不能為空")
    @Min(value = 1, message = "數量至少為1")
    private Integer quantity; // 飲品數量

    private String size; // 飲品尺寸 (例如: Small, Medium, Large)

    private String temperature; // 溫度 (例如: Hot, Cold)

    private String sweetnessLevel; // 甜度 (例如: Normal, Half, Less, Sugar Free)

    private String iceLevel; // 冰塊量 (例如: Normal, Less, No Ice)

    @NotNull(message = "單項價格不能為空")
    @DecimalMin(value = "0.0", inclusive = true, message = "單項價格不能為負") // 允許為0如果搭配加料
    private BigDecimal itemPrice; // 單個訂單項目的價格 (包含加料價格)

    @Valid // 確保 ToppingDTO 內部的驗證也被觸發
    private List<ToppingDTO> toppings; // 加料列表
}