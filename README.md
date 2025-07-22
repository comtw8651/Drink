# 飲料訂購系統

這是一個使用 Spring Boot 和 Vue.js 開發的飲料訂購系統。

## 技術棧

*   **後端:** Spring Boot, Spring Security, JWT, Spring Data JPA, MySQL
*   **前端:** Vue.js
*   **構建工具:** Maven

## 功能

*   **管理員:**
    *   管理飲料品項 (新增、修改、刪除)
    *   管理副料 (新增、修改、刪除)
    *   查看所有訂單
    *   查看每日、每週、每月銷售額
*   **櫃檯:**
    *   查看待處理訂單
    *   新增訂單
    *   完成訂單
    *   取消訂單
*   **顧客:**
    *   瀏覽飲料品項
    *   下訂單
    *   查看訂單狀態

## API 端點

### 認證

*   `POST /api/auth/login`: 登入
*   `POST /api/auth/register`: 註冊

### 管理員

*   `POST /api/admin/products`: 新增飲料
*   `PUT /api/admin/products/{id}`: 修改飲料
*   `DELETE /api/admin/products/{id}`: 刪除飲料
*   `GET /api/admin/products`: 取得所有飲料
*   `POST /api/admin/toppings`: 新增副料
*   `PUT /api/admin/toppings/{id}`: 修改副料
*   `DELETE /api/admin/toppings/{id}`: 刪除副料
*   `GET /api/admin/toppings`: 取得所有副料
*   `GET /api/admin/orders`: 取得所有訂單
*   `GET /api/admin/orders/daily`: 取得每日訂單
*   `GET /api/admin/orders/weekly`: 取得每週銷售額
*   `GET /api/admin/orders/monthly`: 取得每月銷售額

### 櫃檯

*   `GET /api/counter/orders/pending`: 取得待處理訂單
*   `POST /api/counter/orders/new`: 新增訂單
*   `PUT /api/counter/orders/{orderId}/complete`: 完成訂單
*   `PUT /api/counter/orders/{orderId}/cancel`: 取消訂單

### 顧客

*   `GET /api/customer/products`: 取得所有有效飲料
*   `GET /api/customer/products/category/{category}`: 依類別取得有效飲料
*   `GET /api/customer/toppings`: 取得所有有效副料
*   `POST /api/customer/order`: 新增訂單
*   `POST /api/customer/payment/ecpay/callback`: 綠界支付回調

## 設定與安裝

1.  **安裝 MySQL:**
    *   安裝並設定 MySQL 資料庫。
    *   在 `src/main/resources/application.properties` 中設定資料庫連線資訊。
2.  **安裝後端相依套件:**
    ```bash
    mvn install
    ```
3.  **執行後端應用程式:**
    ```bash
    mvn spring-boot:run
    ```
4.  **前端設定:**
    *   (請提供前端設定步驟)

## 專案結構

```
.
├── .mvn
├── .settings
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── beverageshop
│   │   │           └── beverageorderingsystem
│   │   │               ├── controller
│   │   │               ├── dto
│   │   │               ├── entity
│   │   │               ├── model
│   │   │               ├── payload
│   │   │               ├── repository
│   │   │               ├── security
│   │   │               └── service
│   │   └── resources
│   │       ├── static
│   │       ├── templates
│   │       └── application.properties
│   └── test
├── target
├── .classpath
├── .factorypath
├── .gitattributes
├── .gitignore
├── .project
├── HELP.md
├── mvnw
├── mvnw.cmd
└── pom.xml
```
