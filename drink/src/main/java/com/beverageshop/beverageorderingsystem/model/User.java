package com.beverageshop.beverageorderingsystem.model;

import javax.persistence.*;

@Entity
@Table(name = "users") // 建議使用複數名稱，或與你的資料庫表名一致
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // 密碼應該是加密後的

    @Column(nullable = false)
    private String role; // 例如 "ROLE_USER", "ROLE_ADMIN"

    // 無參建構子 (JPA 需要)
    public User() {
    }

    // 帶參數建構子 (方便創建 User 物件)
    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}