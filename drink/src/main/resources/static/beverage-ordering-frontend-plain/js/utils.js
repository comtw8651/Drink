// js/utils.js

const API_BASE_URL = 'http://localhost:8080/api'; // 後端 Spring Boot 地址

/**
 * 封裝 Fetch API，處理 HTTP 請求
 * @param {string} endpoint - API 路徑，例如 '/customer/products'
 * @param {object} options - Fetch API 的選項，例如 { method: 'POST', body: JSON.stringify(data) }
 * @returns {Promise<object>} - 返回 JSON 響應數據
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // 允許覆蓋或添加其他 header
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: headers,
        });

        // 處理 HTTP 錯誤狀態碼
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // 如果不是 JSON 格式的錯誤訊息，則直接使用文本
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        // 嘗試解析 JSON，如果響應是空的 (例如 204 No Content) 則返回 null
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return null; // 例如 DELETE 請求通常沒有響應體
        }
    } catch (error) {
        console.error('API Request Error:', error);
        alert('發生錯誤: ' + error.message);
        throw error; // 重新拋出錯誤以便調用者處理
    }
}

/**
 * 處理使用者登入
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} - 包含 JWT 和用戶角色
 */
async function loginUser(username, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        localStorage.setItem('jwt_token', data.jwt);
        localStorage.setItem('user_role', data.role);
        return data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * 檢查使用者是否已登入且具有特定角色
 * @param {string[]} requiredRoles - 必須具備的角色陣列 (例如 ['ADMIN', 'COUNTER'])
 * @returns {boolean}
 */
function checkAuth(requiredRoles = []) {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');

    if (!token || !role) {
        return false;
    }

    if (requiredRoles.length === 0) { // 如果沒有指定角色，只要有token就算登入
        return true;
    }

    return requiredRoles.includes(role);
}

/**
 * 登出使用者
 */
function logoutUser() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    alert('您已登出。');
    window.location.href = 'index.html'; // 登出後導向首頁
}

// 導出函數，以便其他 JS 檔案可以引入使用
window.apiRequest = apiRequest;
window.loginUser = loginUser;
window.checkAuth = checkAuth;
window.logoutUser = logoutUser;

// 在所有頁面載入時檢查是否需要導向登入頁 (針對受保護頁面)
document.addEventListener('DOMContentLoaded', () => {
    const protectedPages = ['counter.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const userRole = localStorage.getItem('user_role'); // 先獲取一次角色

    if (protectedPages.includes(currentPage)) {
        if (!userRole) { // 如果沒有角色，表示未登入或無效
            alert('您沒有權限訪問此頁面，請先登入！');
            window.location.href = 'index.html'; // 導向首頁
            return;
        }

        // *** 確認這裡使用 'ROLE_ADMIN' 和 'ROLE_COUNTER' 進行判斷 ***
        // 如果是 admin 頁面，還要檢查是否是 ADMIN 角色
        if (currentPage === 'admin.html' && userRole !== 'ROLE_ADMIN') {
             alert('您沒有管理員權限！');
             window.location.href = 'index.html';
             return;
        }
        // 如果是 counter 頁面，檢查是否是 COUNTER 或 ADMIN 角色
        if (currentPage === 'counter.html' && userRole !== 'ROLE_COUNTER') {
             alert('您沒有櫃台或管理員權限！');
             window.location.href = 'index.html';
             return;
        }
    }
});