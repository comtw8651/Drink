package com.beverageshop.beverageorderingsystem.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class UserDTO {
    private Long id;
    @NotBlank(message = "使用者名稱不能為空")
    private String username;
    @NotBlank(message = "密碼不能為空")
    @Size(min = 6, message = "密碼至少需要6個字元")
    private String password; // 註冊時使用，登入時也會用到
    @Email(message = "請輸入有效的電子郵件")
    @NotBlank(message = "電子郵件不能為空")
    private String email;
    // 可以根據需要添加角色資訊等
    // private String role;
}