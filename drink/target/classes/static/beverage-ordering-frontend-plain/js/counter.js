// js/counter.js

document.addEventListener('DOMContentLoaded', () => {
    // 主要元素
    const logoutBtn = document.getElementById('logout-btn');
    const pendingOrdersList = document.getElementById('pending-orders-list');
    const completedOrdersList = document.getElementById('completed-orders-list');
    const addCounterOrderBtn = document.getElementById('add-counter-order-btn');

    // 櫃台點餐模態視窗元素 (與 ordering.html 類似，但 ID 不同)
    const counterOrderingModal = document.getElementById('counter-ordering-modal');
    const closeCounterOrderingModalBtn = document.getElementById('close-counter-ordering-modal-btn');
    const counterProductGrid = document.getElementById('counter-product-grid');
    const counterCartList = document.getElementById('counter-cart-list');
    const counterTotalPriceSpan = document.getElementById('counter-total-price');
    const counterCategoryTabs = document.getElementById('counter-category-tabs');
    const counterPhoneNumberInput = document.getElementById('counter-phone-number');
    const counterMemberPointsSpan = document.getElementById('counter-member-points');

    const counterDeliveryTypeRadios = document.querySelectorAll('input[name="counter-delivery-type"]');
    const counterPaymentMethodRadios = document.querySelectorAll('input[name="counter-payment-method"]');
    const counterDatetimeGroup = document.getElementById('counter-datetime-group');
    const counterDatetimeInput = document.getElementById('counter-datetime-input');
    const counterDatetimeLabel = document.getElementById('counter-datetime-label');
    const counterAddressGroup = document.getElementById('counter-address-group');
    const counterDeliveryAddressInput = document.getElementById('counter-delivery-address');
    const counterOrderNotesInput = document.getElementById('counter-order-notes');
    const submitCounterOrderBtn = document.getElementById('submit-counter-order-btn');
    const cancelCounterOrderBtn = document.getElementById('cancel-counter-order-btn');


    // 共用產品選項模態視窗元素 (與 ordering.js 共用 ID)
    const productOptionsModal = document.getElementById('product-options-modal');
    const closeModalBtn = document.getElementById('close-options-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const modalProductName = document.getElementById('modal-product-name');
    const sizeOptionsDiv = document.getElementById('size-options');
    const temperatureOptionsDiv = document.getElementById('temperature-options');
    const sweetnessSelect = document.getElementById('sweetness');
    const iceSelect = document.getElementById('ice');
    const toppingsListDiv = document.getElementById('toppings-list');
    const quantityInput = document.getElementById('quantity');
    const addToCartModalBtn = document.getElementById('add-to-cart-modal-btn');


    let products = []; // 可販售產品列表
    let toppings = []; // 可販售副料列表
    let counterCart = []; // 櫃台點餐的臨時購物車
    let currentProductInModal = null; // 當前在產品選項模態視窗中操作的產品


	// --- 初始化頁面 ---
	    async function initCounterPage() {
	        // *** 修改這裡：傳入 'ROLE_COUNTER' 和 'ROLE_ADMIN' 兩種角色 ***
	        // 確保判斷時，涵蓋了所有允許訪問 counter.html 的角色，並且帶有 ROLE_ 前綴
	        const userRole = localStorage.getItem('user_role'); // 獲取用戶的實際角色

	        // 檢查用戶是否登入且具有訪問權限
	        if (!userRole || (!['ROLE_COUNTER'].includes(userRole))) {
	            alert('您沒有權限訪問此頁面，請先登入櫃台或管理員帳號！');
	            window.location.href = 'index.html';
	            return;
	        }

	        // 如果登入且有權限，則繼續初始化頁面
	        setupEventListeners();
	        await loadAllOrders(); // 載入所有訂單
	        await loadProductsAndToppings(); // 為櫃台點餐功能載入產品和副料
	        renderProductsForCounter(products); // 初始渲染櫃台點餐產品
	        updateCounterCartDisplay(); // 初始更新櫃台購物車
	        updateCounterModalPaymentOptions(); // 初始更新櫃台模態視窗支付選項
	    }

    async function loadAllOrders() {
        try {
            const orders = await apiRequest('/counter/orders'); // 獲取所有訂單 (後端接口可能需要修改以回傳所有)
            // 這裡假設 /counter/orders 回傳所有訂單，然後前端再篩選
            // 更好的做法是後端提供 /counter/orders/pending 和 /counter/orders/completed
            const pending = await apiRequest('/counter/orders/pending');
            const allOrders = await apiRequest('/counter/orders'); // 假設這個API是取所有訂單
            const completed = allOrders.filter(order => order.orderStatus === '已完成' || order.orderStatus === '已取消');

            renderOrders(pending, pendingOrdersList, true); // true 表示是待處理訂單，有操作按鈕
            renderOrders(completed, completedOrdersList, false); // false 表示是已完成訂單，無操作按鈕

        } catch (error) {
            console.error('載入訂單失敗:', error);
            pendingOrdersList.innerHTML = '<p>載入待處理訂單失敗，請稍後再試。</p>';
            completedOrdersList.innerHTML = '<p>載入已完成訂單失敗，請稍後再試。</p>';
        }
    }

    async function loadProductsAndToppings() {
        try {
            products = await apiRequest('/customer/products'); // 櫃台也可以看到所有啟用的產品
            toppings = await apiRequest('/customer/toppings'); // 櫃台也可以看到所有啟用的副料
        } catch (error) {
            console.error('Error loading products or toppings for counter:', error);
            counterProductGrid.innerHTML = '<p>無法載入飲品選項。</p>';
        }
    }


    function setupEventListeners() {
        logoutBtn.addEventListener('click', logoutUser); // 登出按鈕

        addCounterOrderBtn.addEventListener('click', () => {
            counterOrderingModal.style.display = 'flex'; // 顯示櫃台點餐模態視窗
            resetCounterOrderForm(); // 重置表單
            updateCounterCartDisplay(); // 清空購物車顯示
        });

        closeCounterOrderingModalBtn.addEventListener('click', () => {
            counterOrderingModal.style.display = 'none';
        });
        cancelCounterOrderBtn.addEventListener('click', () => {
            counterOrderingModal.style.display = 'none';
        });


        // 櫃台模態視窗中的分類 Tab 點擊事件
        counterCategoryTabs.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (event) => {
                counterCategoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                event.target.classList.add('active');
                const category = event.target.dataset.category;
                if (category === 'all') {
                    renderProductsForCounter(products);
                } else {
                    const filteredProducts = products.filter(p => p.category === category);
                    renderProductsForCounter(filteredProducts);
                }
            });
        });

        // 櫃台模態視窗內的手機號碼查詢點數
        counterPhoneNumberInput.addEventListener('blur', async () => {
            const phoneNumber = counterPhoneNumberInput.value.trim();
            if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
                try {
                    const member = await apiRequest(`/customer/members?phoneNumber=${phoneNumber}`);
                    if (member && member.points !== undefined) {
                        currentMember = member;
                        counterMemberPointsSpan.textContent = member.points;
                        alert(`會員 ${phoneNumber} 您好，目前累積 ${member.points} 點。`);
                    } else {
                        currentMember = null;
                        counterMemberPointsSpan.textContent = '0';
                        alert('此手機號碼無會員資料，將自動註冊並累積點數。');
                    }
                } catch (error) {
                    currentMember = null;
                    counterMemberPointsSpan.textContent = '0';
                    console.error('查詢會員失敗:', error);
                    alert('查詢會員點數失敗，請確認手機號碼或網路。');
                }
            } else if (phoneNumber !== '') {
                counterMemberPointsSpan.textContent = '0';
                currentMember = null;
            }
        });

        // 櫃台模態視窗內的取餐方式改變事件
        counterDeliveryTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateCounterModalPaymentOptions);
        });

        // 櫃台模態視窗內的提交訂單
        submitCounterOrderBtn.addEventListener('click', handleSubmitCounterOrder);

        // 關閉產品選項模態視窗
        closeModalBtn.addEventListener('click', () => { productOptionsModal.style.display = 'none'; });
        cancelModalBtn.addEventListener('click', () => { productOptionsModal.style.display = 'none'; });

        // 加入購物車 (模態視窗內)
        addToCartModalBtn.addEventListener('click', () => {
            if (currentProductInModal) {
                const result = collectProductOptionsForCounter(currentProductInModal);
                if (result) {
                    addTocounterCart(result);
                    productOptionsModal.style.display = 'none';
                }
            }
        });
    }

    function renderOrders(orders, container, showActions) {
        container.innerHTML = '';
        if (orders.length === 0) {
            container.innerHTML = '<p>目前沒有訂單。</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-card');
            orderCard.dataset.orderId = order.id;

            const orderTime = new Date(order.orderTime).toLocaleString('zh-TW', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            });

            const itemsSummary = order.orderItems.map(item => `${item.productName} x ${item.quantity}`).join(', ');

            orderCard.innerHTML = `
                <div class="order-header">
                    <span class="order-id">訂單 #${order.id}</span>
                    <span class="order-time">${orderTime}</span>
                </div>
                <p class="order-items-summary">${itemsSummary}</p>
                <p>總金額: NT$ ${order.totalAmount.toFixed(2)}</p>
                <p>取餐方式: ${order.deliveryType} | 支付方式: ${order.paymentMethod}</p>
                ${order.member ? `<p>會員電話: ${order.member.phoneNumber}</p>` : ''}
                ${order.pickupDeliveryTime ? `<p>預約時間: ${new Date(order.pickupDeliveryTime).toLocaleString('zh-TW')}</p>` : ''}
                ${order.notes ? `<p>備註: ${order.notes}</p>` : ''}
                <button class="toggle-details-btn">展開詳情</button>
                <div class="order-details" style="display:none;">
                    <h4>詳細內容:</h4>
                    <ul>
                        ${order.orderItems.map(item => `
                            <li>
                                <strong>${item.productName}</strong> - ${item.size}, ${item.temperature}, 甜度: ${getSweetnessLabel(item.sweetnessLevel)}, 冰塊: ${getIceLevelLabel(item.iceLevel)} x ${item.quantity} (NT$ ${item.itemPrice.toFixed(2)})
                                ${item.orderItemToppings && item.orderItemToppings.length > 0 ? ` (+${item.orderItemToppings.map(t => t.toppingName).join(', ')})` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ${showActions ? `
                    <div class="order-card-actions">
                        <button class="btn btn-primary complete-order-btn" data-id="${order.id}">完成訂單</button>
                        <button class="btn btn-danger cancel-order-btn" data-id="${order.id}">取消訂單</button>
                    </div>
                ` : ''}
            `;
            container.appendChild(orderCard);

            // 展開/收合詳情
            orderCard.querySelector('.toggle-details-btn').addEventListener('click', (event) => {
                const detailsDiv = orderCard.querySelector('.order-details');
                const btn = event.target;
                if (detailsDiv.style.display === 'none') {
                    detailsDiv.style.display = 'block';
                    btn.textContent = '收合詳情';
                } else {
                    detailsDiv.style.display = 'none';
                    btn.textContent = '展開詳情';
                }
            });
        });

        if (showActions) {
            // 綁定完成訂單按鈕事件
            document.querySelectorAll('.complete-order-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const orderId = event.target.dataset.id;
                    if (confirm(`確定要完成訂單 #${orderId} 嗎？`)) {
                        try {
                            await apiRequest(`/counter/orders/${orderId}/complete`, { method: 'PUT' });
                            alert(`訂單 #${orderId} 已標記為完成！`);
                            loadAllOrders(); // 重新載入訂單列表
                        } catch (error) {
                            console.error('完成訂單失敗:', error);
                        }
                    }
                });
            });

            // 綁定取消訂單按鈕事件
            document.querySelectorAll('.cancel-order-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const orderId = event.target.dataset.id;
                    if (confirm(`確定要取消訂單 #${orderId} 嗎？此操作不可逆！`)) {
                        try {
                            await apiRequest(`/counter/orders/${orderId}/cancel`, { method: 'PUT' });
                            alert(`訂單 #${orderId} 已標記為取消！`);
                            loadAllOrders(); // 重新載入訂單列表
                        } catch (error) {
                            console.error('取消訂單失敗:', error);
                        }
                    }
                });
            });
        }
    }


    // --- 櫃台新增訂單相關邏輯 (大部分與 ordering.js 相似，但操作的是 counterCart) ---
    function renderProductsForCounter(productsToRender) {
        counterProductGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            counterProductGrid.innerHTML = '<p style="text-align: center; color: #666;">目前沒有可販售的飲品。</p>';
            return;
        }

        productsToRender.forEach(product => {
            if (!product.isActive) return;

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.productId = product.id;

            let priceDisplay = '';
            if (product.priceSmall && product.priceLarge) {
                priceDisplay = `小杯: $${product.priceSmall.toFixed(2)} / 大杯: $${product.priceLarge.toFixed(2)}`;
            } else if (product.priceSmall) {
                priceDisplay = `價格: $${product.priceSmall.toFixed(2)}`;
            } else if (product.priceLarge) {
                priceDisplay = `價格: $${product.priceLarge.toFixed(2)}`;
            } else {
                priceDisplay = `價格: 議價`;
            }

            productCard.innerHTML = `
                <img src="${product.imageUrl || 'assets/images/default-beverage.jpg'}" alt="${product.name}">
                <div class="product-card-info">
                    <h3>${product.name}</h3>
                    <p class="category">${product.category}</p>
                    <p class="price">${priceDisplay}</p>
                    <button class="add-to-cart-btn btn btn-primary">選擇</button>
                </div>
            `;
            counterProductGrid.appendChild(productCard);

            productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                showProductOptionsModalForCounter(product);
            });
        });
    }

    function showProductOptionsModalForCounter(product) {
        currentProductInModal = product;
        modalProductName.textContent = product.name;

        sizeOptionsDiv.innerHTML = '';
        if (product.priceSmall) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="小杯" id="size-small-c"> <label for="size-small-c">小杯 ($${product.priceSmall.toFixed(2)})</label>`;
        }
        if (product.priceLarge) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="大杯" id="size-large-c"> <label for="size-large-c">大杯 ($${product.priceLarge.toFixed(2)})</label>`;
        }
        if (product.priceSmall) document.getElementById('size-small-c').checked = true;
        else if (product.priceLarge) document.getElementById('size-large-c').checked = true;


        temperatureOptionsDiv.innerHTML = '';
        if (product.canBeCold) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="冰" id="temp-cold-c" checked> <label for="temp-cold-c">冰</label>`;
        }
        if (product.canBeHot) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="熱" id="temp-hot-c"> <label for="temp-hot-c">熱</label>`;
        }
        if (product.canBeCold && !product.canBeHot) document.getElementById('temp-cold-c').checked = true;
        if (!product.canBeCold && product.canBeHot) document.getElementById('temp-hot-c').checked = true;


        sweetnessSelect.innerHTML = '';
        for (let i = product.minSweetnessLevel; i <= product.maxSweetnessLevel; i++) {
            sweetnessSelect.innerHTML += `<option value="${i}">${getSweetnessLabel(i)}</option>`;
        }
        if (product.maxSweetnessLevel >= 5) {
             sweetnessSelect.value = 5;
        } else if (product.maxSweetnessLevel >= 0) {
             sweetnessSelect.value = product.maxSweetnessLevel;
        }


        iceSelect.innerHTML = '';
        for (let i = product.minIceLevel; i <= product.maxIceLevel; i++) {
            iceSelect.innerHTML += `<option value="${i}">${getIceLevelLabel(i)}</option>`;
        }
        if (product.maxIceLevel >= 3) {
            iceSelect.value = 3;
        } else if (product.maxIceLevel >= 0) {
            iceSelect.value = product.maxIceLevel;
        }


        toppingsListDiv.innerHTML = '';
        toppings.filter(t => t.isActive).forEach(t => {
            const toppingItemDiv = document.createElement('div');
            toppingItemDiv.innerHTML = `
                <input type="checkbox" id="topping-c-${t.id}" value="${t.id}" data-price="${t.price.toFixed(2)}">
                <label for="topping-c-${t.id}">${t.name} ($${t.price.toFixed(2)})</label>
            `;
            toppingsListDiv.appendChild(toppingItemDiv);
        });

        quantityInput.value = 1;

        productOptionsModal.style.display = 'flex';
    }

    function collectProductOptionsForCounter(product) {
        const selectedSizeElement = document.querySelector('input[name="size"]:checked');
        const selectedTemperatureElement = document.querySelector('input[name="temperature"]:checked');
        const quantity = parseInt(quantityInput.value);

        if (!selectedSizeElement || !selectedTemperatureElement) {
            alert('請選擇飲品的杯型和冰熱！');
            return null;
        }
        if (isNaN(quantity) || quantity <= 0) {
            alert('數量必須是有效的正整數！');
            return null;
        }

        const selectedSize = selectedSizeElement.value;
        const selectedTemperature = selectedTemperatureElement.value;
        const selectedSweetness = parseInt(sweetnessSelect.value);
        const selectedIce = parseInt(iceSelect.value);

        const selectedToppings = Array.from(toppingsListDiv.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => {
                const toppingId = parseInt(checkbox.value);
                const topping = toppings.find(t => t.id === toppingId);
                return {
                    id: topping.id,
                    name: topping.name,
                    price: topping.price,
                };
            });

        let itemPrice = 0;
        if (selectedSize === '小杯' && product.priceSmall) {
            itemPrice = product.priceSmall;
        } else if (selectedSize === '大杯' && product.priceLarge) {
            itemPrice = product.priceLarge;
        } else {
            alert('所選杯型無效，請重新選擇。');
            return null;
        }

        selectedToppings.forEach(t => {
            itemPrice += t.price;
        });

        return {
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            size: selectedSize,
            temperature: selectedTemperature,
            sweetnessLevel: selectedSweetness,
            iceLevel: selectedIce,
            itemPrice: itemPrice,
            selectedToppings: selectedToppings
        };
    }

    function addTocounterCart(item) {
        const existingItemIndex = counterCart.findIndex(cartItem =>
            cartItem.productId === item.productId &&
            cartItem.size === item.size &&
            cartItem.temperature === item.temperature &&
            cartItem.sweetnessLevel === item.sweetnessLevel &&
            cartItem.iceLevel === item.iceLevel &&
            JSON.stringify(cartItem.selectedToppings.map(t => t.id).sort()) === JSON.stringify(item.selectedToppings.map(t => t.id).sort())
        );

        if (existingItemIndex > -1) {
            counterCart[existingItemIndex].quantity += item.quantity;
        } else {
            counterCart.push(item);
        }
        updateCounterCartDisplay();
        alert(`已將 ${item.productName} x ${item.quantity} 加入櫃台訂單！`);
    }

    function updateCounterCartDisplay() {
        counterCartList.innerHTML = '';
        let totalAmount = 0;

        if (counterCart.length === 0) {
            counterCartList.innerHTML = '<p>目前沒有項目。</p>';
        } else {
            counterCart.forEach((item, index) => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');

                let toppingsText = item.selectedToppings.map(t => t.name).join(', ');
                if (toppingsText) toppingsText = ` (+ ${toppingsText})`;

                cartItemElement.innerHTML = `
                    <p>${item.productName} (${item.size}, ${item.temperature}, 甜度: ${getSweetnessLabel(item.sweetnessLevel)}, 冰塊: ${getIceLevelLabel(item.iceLevel)}) x ${item.quantity}</p>
                    <p class="item-details">${toppingsText}</p>
                    <p class="item-price">NT$ ${(item.itemPrice * item.quantity).toFixed(2)}</p>
                    <div class="item-actions">
                        <button class="edit-counter-cart-item btn btn-secondary" data-index="${index}">編輯</button>
                        <button class="remove-counter-cart-item btn btn-danger" data-index="${index}">移除</button>
                    </div>
                `;
                counterCartList.appendChild(cartItemElement);
                totalAmount += item.itemPrice * item.quantity;
            });
        }
        counterTotalPriceSpan.textContent = totalAmount.toFixed(2);

        // 重新綁定移除和編輯按鈕的事件
        document.querySelectorAll('.remove-counter-cart-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                if (confirm('確定要從訂單中移除此項目嗎？')) {
                    counterCart.splice(index, 1);
                    updateCounterCartDisplay();
                }
            });
        });

        document.querySelectorAll('.edit-counter-cart-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                editCounterCartItem(index);
            });
        });
    }

    function editCounterCartItem(indexToEdit) {
        const itemToEdit = counterCart[indexToEdit];
        const originalProduct = products.find(p => p.id === itemToEdit.productId);

        if (!originalProduct) {
            alert('找不到原始產品資料，無法編輯。');
            return;
        }

        currentProductInModal = originalProduct;
        modalProductName.textContent = originalProduct.name;

        sizeOptionsDiv.innerHTML = '';
        if (originalProduct.priceSmall) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="小杯" id="size-small-c" ${itemToEdit.size === '小杯' ? 'checked' : ''}> <label for="size-small-c">小杯 ($${originalProduct.priceSmall.toFixed(2)})</label>`;
        }
        if (originalProduct.priceLarge) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="大杯" id="size-large-c" ${itemToEdit.size === '大杯' ? 'checked' : ''}> <label for="size-large-c">大杯 ($${originalProduct.priceLarge.toFixed(2)})</label>`;
        }

        temperatureOptionsDiv.innerHTML = '';
        if (originalProduct.canBeCold) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="冰" id="temp-cold-c" ${itemToEdit.temperature === '冰' ? 'checked' : ''}> <label for="temp-cold-c">冰</label>`;
        }
        if (originalProduct.canBeHot) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="熱" id="temp-hot-c" ${itemToEdit.temperature === '熱' ? 'checked' : ''}> <label for="temp-hot-c">熱</label>`;
        }

        sweetnessSelect.innerHTML = '';
        for (let i = originalProduct.minSweetnessLevel; i <= originalProduct.maxSweetnessLevel; i++) {
            sweetnessSelect.innerHTML += `<option value="${i}" ${itemToEdit.sweetnessLevel === i ? 'selected' : ''}>${getSweetnessLabel(i)}</option>`;
        }

        iceSelect.innerHTML = '';
        for (let i = originalProduct.minIceLevel; i <= originalProduct.maxIceLevel; i++) {
            iceSelect.innerHTML += `<option value="${i}" ${itemToEdit.iceLevel === i ? 'selected' : ''}>${getIceLevelLabel(i)}</option>`;
        }

        toppingsListDiv.innerHTML = '';
        const selectedToppingIds = new Set(itemToEdit.selectedToppings.map(t => t.id));
        toppings.filter(t => t.isActive).forEach(t => {
            const toppingItemDiv = document.createElement('div');
            const isChecked = selectedToppingIds.has(t.id);
            toppingItemDiv.innerHTML = `
                <input type="checkbox" id="topping-c-${t.id}" value="${t.id}" data-price="${t.price.toFixed(2)}" ${isChecked ? 'checked' : ''}>
                <label for="topping-c-${t.id}">${t.name} ($${t.price.toFixed(2)})</label>
            `;
            toppingsListDiv.appendChild(toppingItemDiv);
        });

        quantityInput.value = itemToEdit.quantity;

        addToCartModalBtn.textContent = '更新購物車';
        addToCartModalBtn.onclick = () => {
            const updatedItem = collectProductOptionsForCounter(originalProduct);
            if (updatedItem) {
                counterCart[indexToEdit] = updatedItem;
                updateCounterCartDisplay();
                productOptionsModal.style.display = 'none';
                alert('櫃台訂單項目已更新！');
            }
            addToCartModalBtn.textContent = '加入購物車'; // 恢復按鈕文字
            addToCartModalBtn.onclick = () => {
                 if (currentProductInModal) {
                    const result = collectProductOptionsForCounter(currentProductInModal);
                    if (result) {
                        addTocounterCart(result);
                        productOptionsModal.style.display = 'none';
                    }
                }
            };
        };
        productOptionsModal.style.display = 'flex';
    }

    function updateCounterModalPaymentOptions() {
        const selectedDeliveryType = document.querySelector('input[name="counter-delivery-type"]:checked').value;

        // 重置所有相關欄位
        counterDatetimeGroup.style.display = 'none';
        counterAddressGroup.style.display = 'none';
        counterDatetimeInput.removeAttribute('required');
        counterDeliveryAddressInput.removeAttribute('required');
        counterDatetimeInput.value = '';
        counterDeliveryAddressInput.value = '';

        // 重置並預設支付方式
        document.getElementById('counter-payment-cash').checked = true;

        switch (selectedDeliveryType) {
            case '內用':
                // 內用預設現金，不需時間或地址
                break;
            case '自取':
                counterDatetimeGroup.style.display = 'block';
                counterDatetimeInput.setAttribute('required', 'required');
                counterDatetimeLabel.textContent = '選擇自取時間:';
                setMinimumDatetime(counterDatetimeInput);
                break;
            case '外送':
                counterDatetimeGroup.style.display = 'block';
                counterAddressGroup.style.display = 'block';
                counterDatetimeInput.setAttribute('required', 'required');
                counterDeliveryAddressInput.setAttribute('required', 'required');
                counterDatetimeLabel.textContent = '選擇送達時間:';
                setMinimumDatetime(counterDatetimeInput);
                break;
        }
    }

    function setMinimumDatetime(inputElement) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const minDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
        inputElement.setAttribute('min', minDatetime);
    }

    function resetCounterOrderForm() {
        counterCart = [];
        updateCounterCartDisplay();
        counterPhoneNumberInput.value = '';
        counterMemberPointsSpan.textContent = '0';
        document.getElementById('counter-delivery-dine-in').checked = true;
        document.getElementById('counter-payment-cash').checked = true;
        counterOrderNotesInput.value = '';
        updateCounterModalPaymentOptions(); // 確保重置後選項正確顯示
    }

    async function handleSubmitCounterOrder() {
        if (counterCart.length === 0) {
            alert('請先為此訂單添加飲品！');
            return;
        }

        const selectedDeliveryType = document.querySelector('input[name="counter-delivery-type"]:checked').value;
        const selectedPaymentMethod = document.querySelector('input[name="counter-payment-method"]:checked').value;
        const phoneNumber = counterPhoneNumberInput.value.trim();
        const pickupDeliveryTime = counterDatetimeInput.value ? new Date(counterDatetimeInput.value).toISOString() : null;
        const deliveryAddress = counterDeliveryAddressInput.value.trim(); // 雖然沒存到DB，但可以在備註中體現
        const notes = counterOrderNotesInput.value.trim();

        // 必要驗證
        if ((selectedDeliveryType === '自取' || selectedDeliveryType === '外送') && !pickupDeliveryTime) {
            alert('請選擇自取或送達時間！');
            return;
        }
        if (selectedDeliveryType === '外送' && !deliveryAddress) {
            alert('請輸入送達地址！');
            return;
        }
        if (phoneNumber !== '' && !/^[0-9]{10}$/.test(phoneNumber)) {
            alert('手機號碼格式不正確，請輸入10位數字。');
            return;
        }

        const orderItemsDTO = counterCart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            size: item.size,
            temperature: item.temperature,
            sweetnessLevel: item.sweetnessLevel,
            iceLevel: item.iceLevel,
            itemPrice: item.itemPrice,
            toppings: item.selectedToppings.map(t => ({
                toppingId: t.id,
                toppingName: t.name,
                toppingPrice: t.price
            }))
        }));

        const totalAmount = parseFloat(counterTotalPriceSpan.textContent);

        const orderData = {
            phoneNumber: phoneNumber || null,
            totalAmount: totalAmount,
            paymentMethod: selectedPaymentMethod,
            deliveryType: selectedDeliveryType,
            pickupDeliveryTime: pickupDeliveryTime,
            notes: notes + (selectedDeliveryType === '外送' && deliveryAddress ? ` (外送地址: ${deliveryAddress})` : ''), // 將地址加入備註
            orderItems: orderItemsDTO
        };

        try {
            await apiRequest('/counter/orders/new', { // 使用櫃台新增訂單的 API
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            alert('櫃台訂單建立成功！');
            counterOrderingModal.style.display = 'none'; // 關閉模態視窗
            loadAllOrders(); // 重新載入訂單列表以顯示新訂單
            resetCounterOrderForm(); // 重置表單
        } catch (error) {
            console.error('櫃台訂單建立失敗:', error);
        }
    }

    // 輔助函數：獲取甜度描述 (與 ordering.js 相同，可以考慮抽離到 utils.js)
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

    // 輔助函數：獲取冰塊描述 (與 ordering.js 相同，可以考慮抽離到 utils.js)
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
    initCounterPage();
});