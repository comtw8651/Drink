package com.beverageshop.beverageorderingsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    @Column(name = "price_small")
    private BigDecimal priceSmall;

    @Column(name = "price_large")
    private BigDecimal priceLarge;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "can_be_hot")
    private Boolean canBeHot = true;

    @Column(name = "can_be_cold")
    private Boolean canBeCold = true;

    @Column(name = "min_sweetness_level")
    private Integer minSweetnessLevel = 0;

    @Column(name = "max_sweetness_level")
    private Integer maxSweetnessLevel = 5;

    @Column(name = "min_ice_level")
    private Integer minIceLevel = 0;

    @Column(name = "max_ice_level")
    private Integer maxIceLevel = 3;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Category {
        紅茶類, 綠茶類, 烏龍茶類, 其他類
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public BigDecimal getPriceSmall() {
		return priceSmall;
	}

	public void setPriceSmall(BigDecimal priceSmall) {
		this.priceSmall = priceSmall;
	}

	public BigDecimal getPriceLarge() {
		return priceLarge;
	}

	public void setPriceLarge(BigDecimal priceLarge) {
		this.priceLarge = priceLarge;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public Boolean getCanBeHot() {
		return canBeHot;
	}

	public void setCanBeHot(Boolean canBeHot) {
		this.canBeHot = canBeHot;
	}

	public Boolean getCanBeCold() {
		return canBeCold;
	}

	public void setCanBeCold(Boolean canBeCold) {
		this.canBeCold = canBeCold;
	}

	public Integer getMinSweetnessLevel() {
		return minSweetnessLevel;
	}

	public void setMinSweetnessLevel(Integer minSweetnessLevel) {
		this.minSweetnessLevel = minSweetnessLevel;
	}

	public Integer getMaxSweetnessLevel() {
		return maxSweetnessLevel;
	}

	public void setMaxSweetnessLevel(Integer maxSweetnessLevel) {
		this.maxSweetnessLevel = maxSweetnessLevel;
	}

	public Integer getMinIceLevel() {
		return minIceLevel;
	}

	public void setMinIceLevel(Integer minIceLevel) {
		this.minIceLevel = minIceLevel;
	}

	public Integer getMaxIceLevel() {
		return maxIceLevel;
	}

	public void setMaxIceLevel(Integer maxIceLevel) {
		this.maxIceLevel = maxIceLevel;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
}