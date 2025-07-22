package com.beverageshop.beverageorderingsystem.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class BeverageDTO {
    private Long id;
    @NotBlank(message = "飲品名稱不能為空")
    private String name;
    @NotNull(message = "價格不能為空")
    @Positive(message = "價格必須大於0")
    private BigDecimal price;
    private String description;
    // 可以添加圖片URL、類別等
    // private String imageUrl;
    // private String category;
}