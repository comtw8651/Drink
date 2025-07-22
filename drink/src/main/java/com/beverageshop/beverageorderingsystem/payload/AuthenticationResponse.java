package com.beverageshop.beverageorderingsystem.payload;

// 這是一個簡單的 POJO 類，用於封裝 JWT Token 和用戶角色
public class AuthenticationResponse {
    private final String jwt;
    private final String role; // 新增：用於儲存用戶的角色

    // 修改：新增帶 role 參數的建構子
    public AuthenticationResponse(String jwt, String role) {
        this.jwt = jwt;
        this.role = role;
    }

    public String getJwt() {
        return jwt;
    }

    // 新增：提供獲取 role 的 Getter 方法
    public String getRole() {
        return role;
    }
}