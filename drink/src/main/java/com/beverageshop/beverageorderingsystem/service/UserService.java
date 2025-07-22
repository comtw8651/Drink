package com.beverageshop.beverageorderingsystem.service;

import com.beverageshop.beverageorderingsystem.model.User;
import com.beverageshop.beverageorderingsystem.repository.UserRepository; // 你需要創建這個 Repository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // 用於加密密碼

    // 註冊用戶
    public User registerUser(String username, String password, String role) {
        // 檢查用戶是否已存在
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("User with this username already exists.");
        }

        // 加密密碼
        String encodedPassword = passwordEncoder.encode(password);

        // 創建新用戶
        User newUser = new User(username, encodedPassword, role);

        // 保存到資料庫
        return userRepository.save(newUser);
    }

    // 依據用戶名尋找用戶
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}