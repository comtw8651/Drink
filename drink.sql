-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-07-22 10:22:19
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `drink`
--

-- --------------------------------------------------------

--
-- 資料表結構 `members`
--

CREATE TABLE `members` (
  `id` bigint(20) NOT NULL COMMENT '會員ID',
  `phone_number` varchar(255) NOT NULL,
  `points` int(11) DEFAULT 0 COMMENT '累積點數',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL COMMENT '訂單ID',
  `member_id` bigint(20) DEFAULT NULL COMMENT '會員ID (FK_members.id), 如果是會員點餐',
  `order_time` datetime DEFAULT current_timestamp() COMMENT '訂單建立時間',
  `total_amount` decimal(38,2) NOT NULL,
  `payment_method` enum('現金結帳','線上結帳','現場結帳','送達結帳') NOT NULL COMMENT '支付方式',
  `delivery_type` enum('內用','自取','外送') NOT NULL COMMENT '取餐方式',
  `pickup_delivery_time` datetime DEFAULT NULL COMMENT '自取/送達時間 (如果適用)',
  `order_status` enum('待處理','已完成','已取消') DEFAULT '待處理' COMMENT '訂單狀態',
  `transaction_id` varchar(255) DEFAULT NULL COMMENT '金流交易ID (如果線上支付)',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL COMMENT '訂單明細ID',
  `order_id` bigint(20) NOT NULL COMMENT '訂單ID (FK_orders.id)',
  `product_id` bigint(20) NOT NULL COMMENT '商品ID (FK_products.id)',
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL COMMENT '數量',
  `size` enum('大杯','小杯') NOT NULL COMMENT '杯型',
  `temperature` enum('冰','熱') NOT NULL COMMENT '冰熱',
  `sweetness_level` int(11) DEFAULT 0 COMMENT '甜度',
  `ice_level` int(11) DEFAULT 0 COMMENT '冰塊',
  `item_price` decimal(38,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `order_item_toppings`
--

CREATE TABLE `order_item_toppings` (
  `id` bigint(20) NOT NULL COMMENT '訂單副料明細ID',
  `order_item_id` bigint(20) NOT NULL COMMENT '訂單明細ID (FK_order_items.id)',
  `topping_id` bigint(20) NOT NULL COMMENT '副料ID (FK_toppings.id)',
  `topping_name` varchar(255) NOT NULL,
  `topping_price` decimal(38,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL COMMENT '商品ID',
  `name` varchar(255) NOT NULL,
  `category` enum('紅茶類','綠茶類','烏龍茶類','其他類') NOT NULL COMMENT '飲料分類',
  `price_small` decimal(38,2) DEFAULT NULL,
  `price_large` decimal(38,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL COMMENT '飲料圖片URL',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否啟用/可販售 (後台可控制)',
  `can_be_hot` tinyint(1) DEFAULT 1 COMMENT '是否可做熱飲 (後台可控制)',
  `can_be_cold` tinyint(1) DEFAULT 1 COMMENT '是否可做冰飲 (後台可控制)',
  `min_sweetness_level` int(11) DEFAULT 0 COMMENT '最低甜度 (0-5, 0為無糖)',
  `max_sweetness_level` int(11) DEFAULT 5 COMMENT '最高甜度 (0-5, 5為全糖)',
  `min_ice_level` int(11) DEFAULT 0 COMMENT '最低冰塊 (0-3, 0為去冰)',
  `max_ice_level` int(11) DEFAULT 3 COMMENT '最高冰塊 (0-3, 3為正常冰)',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price_small`, `price_large`, `image_url`, `is_active`, `can_be_hot`, `can_be_cold`, `min_sweetness_level`, `max_sweetness_level`, `min_ice_level`, `max_ice_level`, `created_at`, `updated_at`) VALUES
(1, '紅茶', '紅茶類', 30.00, 35.00, '123', 1, 1, 1, 0, 5, 0, 3, '2025-07-22 15:57:54', '2025-07-22 15:57:54');

-- --------------------------------------------------------

--
-- 資料表結構 `toppings`
--

CREATE TABLE `toppings` (
  `id` bigint(20) NOT NULL COMMENT '副料ID',
  `name` varchar(255) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否啟用/可販售 (後台可控制)',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `toppings`
--

INSERT INTO `toppings` (`id`, `name`, `price`, `is_active`, `created_at`, `updated_at`) VALUES
(2, '珍珠', 10.00, 1, '2025-07-22 15:57:41', '2025-07-22 15:57:41');

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL COMMENT '使用者ID',
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT '加密後的密碼',
  `role` enum('COUNTER','ADMIN') NOT NULL COMMENT '角色：櫃台或管理員',
  `is_enabled` tinyint(1) DEFAULT 1 COMMENT '是否啟用此帳號',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `is_enabled`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$RUCERW9N/ZfguTdrFby/Y.4Ekilnj00gdNL4d.zs4WF1CDk2eozy2', 'ADMIN', 1, '2025-07-21 13:12:46', '2025-07-21 13:12:46'),
(2, 'counter', '$2a$10$OSzToLKjz1QG4G3Y1v3OievA1BMBC1UabZM9WNYt/jIyCY.nmbM56', 'COUNTER', 1, '2025-07-21 13:12:46', '2025-07-21 13:12:46');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`);

--
-- 資料表索引 `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`);

--
-- 資料表索引 `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- 資料表索引 `order_item_toppings`
--
ALTER TABLE `order_item_toppings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_item_id` (`order_item_id`),
  ADD KEY `topping_id` (`topping_id`);

--
-- 資料表索引 `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `toppings`
--
ALTER TABLE `toppings`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `members`
--
ALTER TABLE `members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '會員ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '訂單ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '訂單明細ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_item_toppings`
--
ALTER TABLE `order_item_toppings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '訂單副料明細ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID', AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `toppings`
--
ALTER TABLE `toppings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '副料ID', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '使用者ID', AUTO_INCREMENT=3;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`);

--
-- 資料表的限制式 `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- 資料表的限制式 `order_item_toppings`
--
ALTER TABLE `order_item_toppings`
  ADD CONSTRAINT `order_item_toppings_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  ADD CONSTRAINT `order_item_toppings_ibfk_2` FOREIGN KEY (`topping_id`) REFERENCES `toppings` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
