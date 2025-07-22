// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // 登出按鈕
    const logoutBtn = document.getElementById('logout-btn');

    // 側邊欄導航
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');

    // 儀表板 (統計) 元素
    const statDateFilter = document.getElementById('stat-date-filter');
    const filterDailyBtn = document.getElementById('filter-daily-btn');
    const filterWeeklyBtn = document.getElementById('filter-weekly-btn');
    const filterMonthlyBtn = document.getElementById('filter-monthly-btn');
    const todaySalesSpan = document.getElementById('today-sales');
    const todayOrdersSpan = document.getElementById('today-orders');
    const weekSalesSpan = document.getElementById('week-sales');
    const monthSalesSpan = document.getElementById('month-sales');

    // 飲品管理元素
    const addProductBtn = document.getElementById('add-product-btn');
    const productTableBody = document.getElementById('product-table-body');
    const productModal = document.getElementById('product-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal-btn');
    const cancelProductModalBtn = document.getElementById('cancel-product-modal-btn');
    const productModalTitle = document.getElementById('product-modal-title');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productCategorySelect = document.getElementById('product-category');
    const productPriceSmallInput = document.getElementById('product-price-small');
    const productPriceLargeInput = document.getElementById('product-price-large');
    const productImageUrlInput = document.getElementById('product-image-url');
    const productIsActiveCheckbox = document.getElementById('product-is-active');
    const productCanBeHotCheckbox = document.getElementById('product-can-be-hot');
    const productCanBeColdCheckbox = document.getElementById('product-can-be-cold');
    const productMinSweetnessInput = document.getElementById('product-min-sweetness');
    const productMaxSweetnessInput = document.getElementById('product-max-sweetness');
    const productMinIceInput = document.getElementById('product-min-ice');
    const productMaxIceInput = document.getElementById('product-max-ice');

    // 副料管理元素
    const addToppingBtn = document.getElementById('add-topping-btn');
    const toppingTableBody = document.getElementById('topping-table-body');
    const toppingModal = document.getElementById('topping-modal');
    const closeToppingModalBtn = document.getElementById('close-topping-modal-btn');
    const cancelToppingModalBtn = document.getElementById('cancel-topping-modal-btn');
    const toppingModalTitle = document.getElementById('topping-modal-title');
    const toppingForm = document.getElementById('topping-form');
    const toppingIdInput = document.getElementById('topping-id');
    const toppingNameInput = document.getElementById('topping-name');
    const toppingPriceInput = document.getElementById('topping-price');
    const toppingIsActiveCheckbox = document.getElementById('topping-is-active');

    // 訂單記錄元素
    const orderRecordDateFilter = document.getElementById('order-record-date-filter');
    const filterOrderRecordsBtn = document.getElementById('filter-order-records-btn');
    const orderRecordsTableBody = document.getElementById('order-records-table-body');


    // --- 初始化頁面 ---
    async function initAdminPage() {
        if (!checkAuth(['ROLE_ADMIN'])) {
            alert('您沒有管理員權限，請先登入管理員帳號！');
            window.location.href = 'index.html';
            return;
        }
        setupEventListeners();
        showSection('dashboard'); // 預設顯示儀表板
        loadStatistics();
        loadProducts();
        loadToppings();
        loadOrderRecords(); // 預設載入所有訂單記錄
    }

    function setupEventListeners() {
        logoutBtn.addEventListener('click', logoutUser);

        // 側邊欄導航點擊事件
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const sectionId = event.target.dataset.section;
                showSection(sectionId);
                sidebarLinks.forEach(l => l.classList.remove('active'));
                event.target.classList.add('active');
            });
        });

        // 統計篩選按鈕
        filterDailyBtn.addEventListener('click', () => loadStatistics('daily'));
        filterWeeklyBtn.addEventListener('click', () => loadStatistics('weekly'));
        filterMonthlyBtn.addEventListener('click', () => loadStatistics('monthly'));
        statDateFilter.addEventListener('change', () => loadStatistics('daily')); // 日期改變時自動更新日統計

        // 飲品管理按鈕
        addProductBtn.addEventListener('click', () => showProductModal('add'));
        closeProductModalBtn.addEventListener('click', () => productModal.style.display = 'none');
        cancelProductModalBtn.addEventListener('click', () => productModal.style.display = 'none');
        productForm.addEventListener('submit', handleProductFormSubmit);

        // 副料管理按鈕
        addToppingBtn.addEventListener('click', () => showToppingModal('add'));
        closeToppingModalBtn.addEventListener('click', () => toppingModal.style.display = 'none');
        cancelToppingModalBtn.addEventListener('click', () => toppingModal.style.display = 'none');
        toppingForm.addEventListener('submit', handleToppingFormSubmit);

        // 訂單記錄篩選
        filterOrderRecordsBtn.addEventListener('click', loadOrderRecords);
        // 預設日期為今天
        orderRecordDateFilter.valueAsDate = new Date();
    }

    // --- 區塊切換邏輯 ---
    function showSection(sectionId) {
        adminSections.forEach(section => {
            if (section.id === `${sectionId}-section`) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        // 切換到對應區塊時，重新載入數據
        if (sectionId === 'dashboard') {
            loadStatistics();
        } else if (sectionId === 'product-management') {
            loadProducts();
        } else if (sectionId === 'topping-management') {
            loadToppings();
        } else if (sectionId === 'order-records') {
            loadOrderRecords();
        }
    }

    // --- 統計數據 ---
    async function loadStatistics(type = 'daily') {
        let dateParam = statDateFilter.value || new Date().toISOString().split('T')[0]; // 預設今天

        try {
            let dailyOrders = [];
            let weeklySales = { total: 0 };
            let monthlySales = { total: 0 };

            // 獲取日統計
            const dailyOrdersData = await apiRequest(`/admin/orders/daily?date=${dateParam}`);
            const todaySales = dailyOrdersData.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2);
            todaySalesSpan.textContent = todaySales;
            todayOrdersSpan.textContent = dailyOrdersData.length;

            // 獲取週統計 (以當前日期所在週的第一天為起點)
            const startDateOfWeek = new Date(dateParam);
            startDateOfWeek.setDate(startDateOfWeek.getDate() - startDateOfWeek.getDay()); // 週日為 0
            const weeklySalesData = await apiRequest(`/admin/orders/weekly?startDate=${startDateOfWeek.toISOString().split('T')[0]}`);
            const weekTotal = Object.values(weeklySalesData).reduce((sum, val) => sum + parseFloat(val), 0).toFixed(2);
            weekSalesSpan.textContent = weekTotal;

            // 獲取月統計 (以當前日期所在月的第一天為起點)
            const startDateOfMonth = new Date(dateParam);
            startDateOfMonth.setDate(1);
            const monthlySalesData = await apiRequest(`/admin/orders/monthly?month=${startDateOfMonth.toISOString().split('T')[0]}`);
            const monthTotal = Object.values(monthlySalesData).reduce((sum, val) => sum + parseFloat(val), 0).toFixed(2);
            monthSalesSpan.textContent = monthTotal;


        } catch (error) {
            console.error('載入統計數據失敗:', error);
            todaySalesSpan.textContent = 'N/A';
            todayOrdersSpan.textContent = 'N/A';
            weekSalesSpan.textContent = 'N/A';
            monthSalesSpan.textContent = 'N/A';
        }
    }


    // --- 飲品管理 ---
    async function loadProducts() {
        try {
            const products = await apiRequest('/admin/products'); // 獲取所有產品，包括非 active
            renderProductTable(products);
        } catch (error) {
            console.error('載入飲品失敗:', error);
            productTableBody.innerHTML = '<tr><td colspan="9">載入飲品資料失敗。</td></tr>';
        }
    }

    function renderProductTable(products) {
        productTableBody.innerHTML = '';
        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="9">沒有飲品資料。</td></tr>';
            return;
        }
        products.forEach(product => {
            const row = productTableBody.insertRow();
            row.innerHTML = `
                <td data-label="ID">${product.id}</td>
                <td data-label="名稱">${product.name}</td>
                <td data-label="分類">${product.category}</td>
                <td data-label="小杯價格">NT$ ${product.priceSmall ? product.priceSmall.toFixed(2) : 'N/A'}</td>
                <td data-label="大杯價格">NT$ ${product.priceLarge ? product.priceLarge.toFixed(2) : 'N/A'}</td>
                <td data-label="啟用">${product.isActive ? '是' : '否'}</td>
                <td data-label="可熱飲">${product.canBeHot ? '是' : '否'}</td>
                <td data-label="可冰飲">${product.canBeCold ? '是' : '否'}</td>
                <td data-label="操作" class="action-buttons">
                    <button class="btn btn-secondary edit-product-btn" data-id="${product.id}">編輯</button>
                    <button class="btn btn-danger delete-product-btn" data-id="${product.id}">刪除</button>
                </td>
            `;
        });

        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', (event) => showProductModal('edit', event.target.dataset.id));
        });
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (event) => deleteProduct(event.target.dataset.id));
        });
    }

    async function showProductModal(mode, productId = null) {
        productForm.reset();
        productIdInput.value = '';
        productIsActiveCheckbox.checked = true;
        productCanBeHotCheckbox.checked = true;
        productCanBeColdCheckbox.checked = true;

        if (mode === 'add') {
            productModalTitle.textContent = '新增飲品';
        } else if (mode === 'edit' && productId) {
            productModalTitle.textContent = '編輯飲品';
            try {
                const product = await apiRequest(`/admin/products/${productId}`);
                if (product) {
                    productIdInput.value = product.id;
                    productNameInput.value = product.name;
                    productCategorySelect.value = product.category;
                    productPriceSmallInput.value = product.priceSmall;
                    productPriceLargeInput.value = product.priceLarge;
                    productImageUrlInput.value = product.imageUrl || '';
                    productIsActiveCheckbox.checked = product.isActive;
                    productCanBeHotCheckbox.checked = product.canBeHot;
                    productCanBeColdCheckbox.checked = product.canBeCold;
                    productMinSweetnessInput.value = product.minSweetnessLevel;
                    productMaxSweetnessInput.value = product.maxSweetnessLevel;
                    productMinIceInput.value = product.minIceLevel;
                    productMaxIceInput.value = product.maxIceLevel;
                }
            } catch (error) {
                console.error('載入飲品資料失敗:', error);
                alert('載入飲品資料失敗，請稍後再試。');
                return;
            }
        }
        productModal.style.display = 'flex';
    }

    async function handleProductFormSubmit(event) {
        event.preventDefault();
        const productId = productIdInput.value;
        const productData = {
            name: productNameInput.value,
            category: productCategorySelect.value,
            priceSmall: productPriceSmallInput.value ? parseFloat(productPriceSmallInput.value) : null,
            priceLarge: productPriceLargeInput.value ? parseFloat(productPriceLargeInput.value) : null,
            imageUrl: productImageUrlInput.value || null,
            isActive: productIsActiveCheckbox.checked,
            canBeHot: productCanBeHotCheckbox.checked,
            canBeCold: productCanBeColdCheckbox.checked,
            minSweetnessLevel: parseInt(productMinSweetnessInput.value),
            maxSweetnessLevel: parseInt(productMaxSweetnessInput.value),
            minIceLevel: parseInt(productMinIceInput.value),
            maxIceLevel: parseInt(productMaxIceInput.value),
        };

        try {
            if (productId) {
                await apiRequest(`/admin/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(productData)
                });
                alert('飲品更新成功！');
            } else {
                await apiRequest('/admin/products', {
                    method: 'POST',
                    body: JSON.stringify(productData)
                });
                alert('飲品新增成功！');
            }
            productModal.style.display = 'none';
            loadProducts(); // 重新載入列表
        } catch (error) {
            console.error('保存飲品失敗:', error);
            alert('保存飲品失敗，請檢查資料或網路。');
        }
    }

    async function deleteProduct(productId) {
        if (confirm(`確定要刪除飲品 ID: ${productId} 嗎？此操作不可逆！`)) {
            try {
                await apiRequest(`/admin/products/${productId}`, { method: 'DELETE' });
                alert('飲品刪除成功！');
                loadProducts(); // 重新載入列表
            } catch (error) {
                console.error('刪除飲品失敗:', error);
                alert('刪除飲品失敗，請稍後再試。');
            }
        }
    }

    // --- 副料管理 ---
    async function loadToppings() {
        try {
            const toppings = await apiRequest('/admin/toppings');
            renderToppingTable(toppings);
        } catch (error) {
            console.error('載入副料失敗:', error);
            toppingTableBody.innerHTML = '<tr><td colspan="5">載入副料資料失敗。</td></tr>';
        }
    }

    function renderToppingTable(toppings) {
        toppingTableBody.innerHTML = '';
        if (toppings.length === 0) {
            toppingTableBody.innerHTML = '<tr><td colspan="5">沒有副料資料。</td></tr>';
            return;
        }
        toppings.forEach(topping => {
            const row = toppingTableBody.insertRow();
            row.innerHTML = `
                <td data-label="ID">${topping.id}</td>
                <td data-label="名稱">${topping.name}</td>
                <td data-label="價格">NT$ ${topping.price.toFixed(2)}</td>
                <td data-label="啟用">${topping.isActive ? '是' : '否'}</td>
                <td data-label="操作" class="action-buttons">
                    <button class="btn btn-secondary edit-topping-btn" data-id="${topping.id}">編輯</button>
                    <button class="btn btn-danger delete-topping-btn" data-id="${topping.id}">刪除</button>
                </td>
            `;
        });

        document.querySelectorAll('.edit-topping-btn').forEach(button => {
            button.addEventListener('click', (event) => showToppingModal('edit', event.target.dataset.id));
        });
        document.querySelectorAll('.delete-topping-btn').forEach(button => {
            button.addEventListener('click', (event) => deleteTopping(event.target.dataset.id));
        });
    }

    async function showToppingModal(mode, toppingId = null) {
        toppingForm.reset();
        toppingIdInput.value = '';
        toppingIsActiveCheckbox.checked = true;

        if (mode === 'add') {
            toppingModalTitle.textContent = '新增副料';
        } else if (mode === 'edit' && toppingId) {
            toppingModalTitle.textContent = '編輯副料';
            try {
                const topping = await apiRequest(`/admin/toppings/${toppingId}`);
                if (topping) {
                    toppingIdInput.value = topping.id;
                    toppingNameInput.value = topping.name;
                    toppingPriceInput.value = topping.price;
                    toppingIsActiveCheckbox.checked = topping.isActive;
                }
            } catch (error) {
                console.error('載入副料資料失敗:', error);
                alert('載入副料資料失敗，請稍後再試。');
                return;
            }
        }
        toppingModal.style.display = 'flex';
    }

    async function handleToppingFormSubmit(event) {
        event.preventDefault();
        const toppingId = toppingIdInput.value;
        const toppingData = {
            name: toppingNameInput.value,
            price: parseFloat(toppingPriceInput.value),
            isActive: toppingIsActiveCheckbox.checked,
        };

        try {
            if (toppingId) {
                await apiRequest(`/admin/toppings/${toppingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(toppingData)
                });
                alert('副料更新成功！');
            } else {
                await apiRequest('/admin/toppings', {
                    method: 'POST',
                    body: JSON.stringify(toppingData)
                });
                alert('副料新增成功！');
            }
            toppingModal.style.display = 'none';
            loadToppings(); // 重新載入列表
        } catch (error) {
            console.error('保存副料失敗:', error);
            alert('保存副料失敗，請檢查資料或網路。');
        }
    }

    async function deleteTopping(toppingId) {
        if (confirm(`確定要刪除副料 ID: ${toppingId} 嗎？此操作不可逆！`)) {
            try {
                await apiRequest(`/admin/toppings/${toppingId}`, { method: 'DELETE' });
                alert('副料刪除成功！');
                loadToppings(); // 重新載入列表
            } catch (error) {
                console.error('刪除副料失敗:', error);
                alert('刪除副料失敗，請稍後再試。');
            }
        }
    }

    // --- 訂單記錄 ---
    async function loadOrderRecords() {
        const selectedDate = orderRecordDateFilter.value;
        let endpoint = '/admin/orders'; // 預設獲取所有訂單
        if (selectedDate) {
            endpoint = `/admin/orders/daily?date=${selectedDate}`; // 如果選擇了日期，則按日篩選
        }
        try {
            const orders = await apiRequest(endpoint);
            renderOrderRecordsTable(orders);
        } catch (error) {
            console.error('載入訂單記錄失敗:', error);
            orderRecordsTableBody.innerHTML = '<tr><td colspan="8">載入訂單記錄失敗。</td></tr>';
        }
    }

    function renderOrderRecordsTable(orders) {
        orderRecordsTableBody.innerHTML = '';
        if (orders.length === 0) {
            orderRecordsTableBody.innerHTML = '<tr><td colspan="8">沒有訂單記錄。</td></tr>';
            return;
        }

        // 按時間降序排序 (最新在最上面)
        orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

        orders.forEach(order => {
            const row = orderRecordsTableBody.insertRow();
            const orderTime = new Date(order.orderTime).toLocaleString('zh-TW', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            });

            row.innerHTML = `
                <td data-label="ID">${order.id}</td>
                <td data-label="時間">${orderTime}</td>
                <td data-label="總金額">NT$ ${order.totalAmount.toFixed(2)}</td>
                <td data-label="取餐方式">${order.deliveryType}</td>
                <td data-label="支付方式">${order.paymentMethod}</td>
                <td data-label="狀態">${order.orderStatus}</td>
                <td data-label="會員電話">${order.member ? order.member.phoneNumber : '非會員'}</td>
                <td data-label="操作" class="action-buttons">
                    <button class="btn btn-secondary view-order-details-btn" data-id="${order.id}">查看詳情</button>
                </td>
            `;
        });

        // 綁定查看詳情按鈕
        document.querySelectorAll('.view-order-details-btn').forEach(button => {
            button.addEventListener('click', (event) => viewOrderDetails(event.target.dataset.id));
        });
    }

    async function viewOrderDetails(orderId) {
        try {
            const order = await apiRequest(`/admin/orders/${orderId}`); // 假設有這個 API
            if (order) {
                let detailsHtml = `
                    <h3>訂單 #${order.id} 詳情</h3>
                    <p><strong>時間:</strong> ${new Date(order.orderTime).toLocaleString('zh-TW')}</p>
                    <p><strong>總金額:</strong> NT$ ${order.totalAmount.toFixed(2)}</p>
                    <p><strong>取餐方式:</strong> ${order.deliveryType}</p>
                    <p><strong>支付方式:</strong> ${order.paymentMethod}</p>
                    <p><strong>狀態:</strong> ${order.orderStatus}</p>
                    <p><strong>會員電話:</strong> ${order.member ? order.member.phoneNumber : '非會員'}</p>
                    ${order.pickupDeliveryTime ? `<p><strong>預約時間:</strong> ${new Date(order.pickupDeliveryTime).toLocaleString('zh-TW')}</p>` : ''}
                    ${order.transactionId ? `<p><strong>交易 ID:</strong> ${order.transactionId}</p>` : ''}
                    ${order.notes ? `<p><strong>備註:</strong> ${order.notes}</p>` : ''}
                    <h4>訂購項目:</h4>
                    <ul>
                        ${order.orderItems.map(item => `
                            <li>
                                ${item.productName} (${item.size}, ${item.temperature}, 甜度: ${getSweetnessLabel(item.sweetnessLevel)}, 冰塊: ${getIceLevelLabel(item.iceLevel)}) x ${item.quantity} (NT$ ${item.itemPrice.toFixed(2)})
                                ${item.orderItemToppings && item.orderItemToppings.length > 0 ? ` (+${item.orderItemToppings.map(t => t.toppingName).join(', ')})` : ''}
                            </li>
                        `).join('')}
                    </ul>
                `;
                // 這裡可以使用一個通用的模態視窗來顯示詳情
                alert(detailsHtml.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n')); // 簡單的彈出，實際應使用專用模態視窗
            }
        } catch (error) {
            console.error('載入訂單詳情失敗:', error);
            alert('載入訂單詳情失敗，請稍後再試。');
        }
    }


    // 輔助函數：獲取甜度描述 (與 ordering.js 相同)
    function getSweetnessLabel(level) {
        switch (level) {
            case 0: return '無糖';
            case 1: return '微糖 (1分)';
            case 2: return '半糖 (2分)';
            case 3: return '少糖 (3分)';
            case 4: return '七分糖 (4分)';
            case 5: return '全糖 (5分)';
            default: return `甜度 ${level}`;
        }
    }

    // 輔助函數：獲取冰塊描述 (與 ordering.js 相同)
    function getIceLevelLabel(level) {
        switch (level) {
            case 0: return '去冰';
            case 1: return '微冰';
            case 2: return '少冰';
            case 3: return '正常冰';
            default: return `冰塊 ${level}`;
        }
    }

    // 啟動頁面
    initAdminPage();
});