package com.beverageshop.beverageorderingsystem;

import com.beverageshop.beverageorderingsystem.entity.User;
import com.beverageshop.beverageorderingsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("999999"));
            admin.setRole(User.Role.ADMIN);
            admin.setIsEnabled(true);
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("counter").isEmpty()) {
            User counter = new User();
            counter.setUsername("counter");
            counter.setPassword(passwordEncoder.encode("111111"));
            counter.setRole(User.Role.COUNTER);
            counter.setIsEnabled(true);
            userRepository.save(counter);
        }
    }
}
