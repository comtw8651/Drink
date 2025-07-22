package com.beverageshop.beverageorderingsystem.security;

import io.jsonwebtoken.Claims; // 引入 Claims
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection; // 引入 Collection
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from JWT: {}", username);
            } catch (IllegalArgumentException e) {
                logger.error("Unable to get JWT Token: {}", e.getMessage());
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token has expired: {}", e.getMessage());
            }
        } else {
            logger.debug("JWT Token does not begin with Bearer String or is missing for request: {}", request.getRequestURI());
        }

        // 只有當用戶名存在且當前安全上下文沒有認證時才進行處理
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.debug("Attempting to authenticate user: {}", username);

            UserDetails userDetails = null;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.debug("Loaded UserDetails for {}: Authorities: {}", username, userDetails.getAuthorities());
            } catch (UsernameNotFoundException e) {
                logger.warn("User not found in UserDetailsService: {}", username);
                // 如果用戶不存在，則不繼續處理此請求的認證
                chain.doFilter(request, response);
                return; // 提前返回
            }


            if (jwtUtil.validateToken(jwt, userDetails)) {
                logger.debug("JWT Token is valid for user: {}", username);

                // 獲取 UserDetails 中的權限
                Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = userDetails.getAuthorities();
                logger.debug("Authorities from UserDetails: {}", authorities.stream().map(Object::toString).collect(Collectors.joining(", ")));


                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities); // 使用從 UserDetails 獲取的權限
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                logger.debug("SecurityContextHolder updated with authentication for user: {}. Granted Authorities: {}", username, authenticationToken.getAuthorities());
            } else {
                logger.warn("JWT Token is NOT valid for user: {}", username);
            }
        } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
            logger.debug("SecurityContextHolder already contains authentication for user: {}", SecurityContextHolder.getContext().getAuthentication().getName());
        }

        chain.doFilter(request, response);
    }
}
