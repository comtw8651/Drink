package com.beverageshop.beverageorderingsystem.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "使用者名稱不能為空")
    private String username;
    @NotBlank(message = "密碼不能為空")
    private String password;
}
