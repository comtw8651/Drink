package com.beverageshop.beverageorderingsystem.payload;

public class AuthenticationRequest {

    private String username;
    private String password;

    // 無參建構子
    public AuthenticationRequest() {
    }

    // 帶參數建構子
    public AuthenticationRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
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
}