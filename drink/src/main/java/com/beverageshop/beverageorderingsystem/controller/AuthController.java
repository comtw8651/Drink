package com.beverageshop.beverageorderingsystem.controller;

import com.beverageshop.beverageorderingsystem.model.User;
import com.beverageshop.beverageorderingsystem.payload.AuthenticationRequest;
import com.beverageshop.beverageorderingsystem.payload.AuthenticationResponse; // 確保有這個類
import com.beverageshop.beverageorderingsystem.security.JwtUtil; // 重新引入 JwtUtil
import com.beverageshop.beverageorderingsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8080") // 允許前端訪問
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws Exception {
        try {
            // 嘗試進行身份驗證
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (Exception e) {
            // 登入失敗：用戶名或密碼不正確
            return ResponseEntity.badRequest().body("Incorrect username or password");
        }

        // 身份驗證成功，載入用戶詳細信息
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());

        // 生成 JWT Token
        final String jwt = jwtUtil.generateToken(userDetails);

        // 從 UserDetails 獲取用戶角色
        // 根據你提供的 JwtUtil.java，你是將單一角色存儲為 claims.put("role", ...)
        // 所以這裡獲取角色也應該是一致的
        final String userRole = userDetails.getAuthorities().iterator().next().getAuthority();

        // 返回 JWT Token 和用戶角色給前端
        // AuthenticationResponse 現在需要包含 jwt 和 role
        return ResponseEntity.ok(new AuthenticationResponse(jwt, userRole)); // <-- 在這裡傳遞 role
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        userService.registerUser(user.getUsername(), user.getPassword(), user.getRole());
        return ResponseEntity.ok("User registered successfully");
    }
}