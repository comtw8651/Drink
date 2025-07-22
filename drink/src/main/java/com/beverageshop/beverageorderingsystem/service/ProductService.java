package com.beverageshop.beverageorderingsystem.service;

import com.beverageshop.beverageorderingsystem.entity.Product;
import com.beverageshop.beverageorderingsystem.entity.Topping;
import com.beverageshop.beverageorderingsystem.repository.ProductRepository;
import com.beverageshop.beverageorderingsystem.repository.ToppingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ToppingRepository toppingRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public List<Product> getActiveProductsByCategory(Product.Category category) {
        return productRepository.findByCategoryAndIsActiveTrue(category);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Topping> getAllActiveToppings() {
        return toppingRepository.findByIsActiveTrue();
    }

    public Optional<Topping> getToppingById(Long id) {
        return toppingRepository.findById(id);
    }

    public Topping saveTopping(Topping topping) {
        return toppingRepository.save(topping);
    }

    public void deleteTopping(Long id) {
        toppingRepository.deleteById(id);
    }
}