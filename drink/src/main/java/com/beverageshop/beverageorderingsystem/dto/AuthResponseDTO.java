package com.beverageshop.beverageorderingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String tokenType = "Bearer"; // 通常是 Bearer token
    private Long userId; // 可以包含使用者ID
    private String username; // 可以包含使用者名稱
}