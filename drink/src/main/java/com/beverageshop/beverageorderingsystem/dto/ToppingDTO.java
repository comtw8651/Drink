package com.beverageshop.beverageorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToppingDTO {

    @NotNull(message = "加料ID不能為空")
    private Long toppingId; // 加料ID

    @NotBlank(message = "加料名稱不能為空")
    private String toppingName; // 加料名稱 (冗餘數據)

    @NotNull(message = "加料價格不能為空")
    @DecimalMin(value = "0.0", inclusive = true, message = "加料價格不能為負")
    private BigDecimal toppingPrice; // 加料價格
}