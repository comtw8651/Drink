// js/ordering.js

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const cartList = document.getElementById('cart-list');
    const totalPriceSpan = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const switchUserBtn = document.getElementById('switch-user-btn');
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal-btn');
    const loginForm = document.getElementById('login-form');

    // Product Options Modal Elements
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

    let products = [];
    let toppings = [];
    let cart = JSON.parse(sessionStorage.getItem('cart') || '[]'); // 從 sessionStorage 載入購物車
    let currentProductInModal = null; // 用於儲存當前在模態視窗中操作的產品

    // --- 初始化數據和事件 ---
    async function initOrderingPage() {
        await loadProductsAndToppings();
        renderProducts(products); // 初始渲染所有產品
        updateCartDisplay();
        setupEventListeners();
    }

    async function loadProductsAndToppings() {
        try {
            products = await apiRequest('/customer/products');
            toppings = await apiRequest('/customer/toppings');
        } catch (error) {
            console.error('Error loading products or toppings:', error);
            productGrid.innerHTML = '<p>無法載入飲品選項，請檢查網路或稍後再試。</p>';
        }
    }

    function setupEventListeners() {
        // 分類 Tab 點擊事件
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (event) => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                event.target.classList.add('active');
                const category = event.target.dataset.category;
                if (category === 'all') {
                    renderProducts(products);
                } else {
                    const filteredProducts = products.filter(p => p.category === category);
                    renderProducts(filteredProducts);
                }
            });
        });

        // 購物車前往結帳按鈕
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('購物車是空的，請先選擇飲品！');
                return;
            }
            window.location.href = 'checkout.html';
        });

        // 切換使用者按鈕
        switchUserBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex'; // 顯示登入模態視窗
        });

        // 關閉登入模態視窗
        closeLoginModalBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });

		// 登入表單提交 (使用 utils.js 中的 loginUser)
		        loginForm.addEventListener('submit', async (event) => {
		            event.preventDefault();
		            const username = loginForm.username.value;
		            const password = loginForm.password.value;

		            try {
		                const authData = await loginUser(username, password);
		                alert('登入成功！');
		                loginModal.style.display = 'none';
		                loginForm.reset(); // 清空表單

		                // *** 確認這裡使用 'ROLE_ADMIN' 和 'ROLE_COUNTER' ***
		                if (authData.role === 'ROLE_ADMIN') {
		                    window.location.href = 'admin.html';
		                } else if (authData.role === 'ROLE_COUNTER') {
		                    window.location.href = 'counter.html';
		                } else {
		                    alert('您的帳號角色無法訪問後台功能。');
		                }

		            } catch (error) {
		                console.error('Login failed:', error);
		            }
		        });

        // 關閉產品選項模態視窗
        closeModalBtn.addEventListener('click', () => { productOptionsModal.style.display = 'none'; });
        cancelModalBtn.addEventListener('click', () => { productOptionsModal.style.display = 'none'; });

        // 加入購物車 (模態視窗內)
        addToCartModalBtn.addEventListener('click', () => {
            if (currentProductInModal) {
                const result = collectProductOptions(currentProductInModal);
                if (result) {
                    addToCart(result);
                    productOptionsModal.style.display = 'none';
                }
            }
        });
    }

    // --- 渲染產品列表 ---
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; color: #666;">目前此分類沒有可販售的飲品。</p>';
            return;
        }

        productsToRender.forEach(product => {
            if (!product.isActive) return; // 只顯示 active 的產品

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
                priceDisplay = `價格: 議價`; // 以防萬一沒有價格
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
            productGrid.appendChild(productCard);

            productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                showProductOptionsModal(product);
            });
        });
    }

    // --- 顯示產品選項模態視窗 ---
    function showProductOptionsModal(product) {
        currentProductInModal = product; // 儲存當前產品
        modalProductName.textContent = product.name;

        // 清空並生成杯型選項
        sizeOptionsDiv.innerHTML = '';
        if (product.priceSmall) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="小杯" id="size-small"> <label for="size-small">小杯 ($${product.priceSmall.toFixed(2)})</label>`;
        }
        if (product.priceLarge) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="大杯" id="size-large"> <label for="size-large">大杯 ($${product.priceLarge.toFixed(2)})</label>`;
        }
        // 預選第一個可用的尺寸
        if (product.priceSmall) document.getElementById('size-small').checked = true;
        else if (product.priceLarge) document.getElementById('size-large').checked = true;


        // 清空並生成冰熱選項
        temperatureOptionsDiv.innerHTML = '';
        if (product.canBeCold) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="冰" id="temp-cold" checked> <label for="temp-cold">冰</label>`;
        }
        if (product.canBeHot) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="熱" id="temp-hot"> <label for="temp-hot">熱</label>`;
        }
        // 如果只能選一種，就預選它
        if (product.canBeCold && !product.canBeHot) document.getElementById('temp-cold').checked = true;
        if (!product.canBeCold && product.canBeHot) document.getElementById('temp-hot').checked = true;
        // 如果兩種都不能，理論上不應該顯示，但為了魯棒性，可以禁用按鈕或提示

        // 生成甜度選項
        sweetnessSelect.innerHTML = '';
        for (let i = product.minSweetnessLevel; i <= product.maxSweetnessLevel; i++) {
            sweetnessSelect.innerHTML += `<option value="${i}">${getSweetnessLabel(i)}</option>`;
        }
        // 預選全糖或最大甜度 (如果可選)
        if (product.maxSweetnessLevel >= 5) {
             sweetnessSelect.value = 5; // 預設全糖
        } else if (product.maxSweetnessLevel >= 0) {
             sweetnessSelect.value = product.maxSweetnessLevel; // 如果沒有全糖，則預設最大甜度
        }


        // 生成冰塊選項
        iceSelect.innerHTML = '';
        for (let i = product.minIceLevel; i <= product.maxIceLevel; i++) {
            iceSelect.innerHTML += `<option value="${i}">${getIceLevelLabel(i)}</option>`;
        }
        // 預選正常冰或最大冰塊 (如果可選)
        if (product.maxIceLevel >= 3) {
            iceSelect.value = 3; // 預設正常冰
        } else if (product.maxIceLevel >= 0) {
            iceSelect.value = product.maxIceLevel; // 如果沒有正常冰，則預設最大冰塊
        }


        // 生成副料選項
        toppingsListDiv.innerHTML = '';
        toppings.filter(t => t.isActive).forEach(t => {
            const toppingItemDiv = document.createElement('div');
            toppingItemDiv.innerHTML = `
                <input type="checkbox" id="topping-${t.id}" value="${t.id}" data-price="${t.price.toFixed(2)}">
                <label for="topping-${t.id}">${t.name} ($${t.price.toFixed(2)})</label>
            `;
            toppingsListDiv.appendChild(toppingItemDiv);
        });

        quantityInput.value = 1; // 數量重置為1

        productOptionsModal.style.display = 'flex'; // 顯示模態視窗
    }

    // 輔助函數：獲取甜度描述
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

    // 輔助函數：獲取冰塊描述
    function getIceLevelLabel(level) {
        switch (level) {
            case 0: return '去冰';
            case 1: return '微冰';
            case 2: return '少冰';
            case 3: return '正常冰';
            default: return `冰塊 ${level}`;
        }
    }

    // --- 從模態視窗收集產品選項 ---
    function collectProductOptions(product) {
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
             // 如果選了不支持的尺寸
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
            itemPrice: itemPrice, // 單個品項的價格（含加料）
            selectedToppings: selectedToppings
        };
    }

    // --- 加入購物車 ---
    function addToCart(item) {
        // 檢查是否已存在相同的飲料配置，如果是則增加數量
        const existingItemIndex = cart.findIndex(cartItem =>
            cartItem.productId === item.productId &&
            cartItem.size === item.size &&
            cartItem.temperature === item.temperature &&
            cartItem.sweetnessLevel === item.sweetnessLevel &&
            cartItem.iceLevel === item.iceLevel &&
            JSON.stringify(cartItem.selectedToppings.map(t => t.id).sort()) === JSON.stringify(item.selectedToppings.map(t => t.id).sort())
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += item.quantity;
        } else {
            cart.push(item);
        }
        updateCartDisplay();
        alert(`已將 ${item.productName} x ${item.quantity} 加入購物車！`);
    }

    // --- 更新購物車顯示 ---
    function updateCartDisplay() {
        cartList.innerHTML = '';
        let totalAmount = 0;

        if (cart.length === 0) {
            cartList.innerHTML = '<p>購物車是空的。</p>';
        } else {
            cart.forEach((item, index) => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');

                let toppingsText = item.selectedToppings.map(t => t.name).join(', ');
                if (toppingsText) toppingsText = `加料: (${toppingsText})`;

                cartItemElement.innerHTML = `
                    <p>${item.productName} (${item.size}, ${item.temperature}, 甜度: ${getSweetnessLabel(item.sweetnessLevel)}, 冰塊: ${getIceLevelLabel(item.iceLevel)}) x ${item.quantity}</p>
                    <p class="item-details">${toppingsText}</p>
                    <p class="item-price">NT$ ${(item.itemPrice * item.quantity).toFixed(2)}</p>
                    <div class="item-actions">
                        <button class="edit-cart-item btn btn-secondary" data-index="${index}">編輯</button>
                        <button class="remove-cart-item btn btn-danger" data-index="${index}">移除</button>
                    </div>
                `;
                cartList.appendChild(cartItemElement);
                totalAmount += item.itemPrice * item.quantity;
            });
        }
        totalPriceSpan.textContent = totalAmount.toFixed(2);

        // 將購物車數據儲存到 sessionStorage
        sessionStorage.setItem('cart', JSON.stringify(cart));
        sessionStorage.setItem('totalAmount', totalAmount.toFixed(2));

        // 重新綁定移除和編輯按鈕的事件
        document.querySelectorAll('.remove-cart-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                if (confirm('確定要從購物車移除此項目嗎？')) {
                    cart.splice(index, 1);
                    updateCartDisplay();
                }
            });
        });

        document.querySelectorAll('.edit-cart-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                editCartItem(index);
            });
        });
    }

    // --- 編輯購物車項目 ---
    function editCartItem(indexToEdit) {
        const itemToEdit = cart[indexToEdit];
        const originalProduct = products.find(p => p.id === itemToEdit.productId);

        if (!originalProduct) {
            alert('找不到原始產品資料，無法編輯。');
            return;
        }

        currentProductInModal = originalProduct; // 設置當前產品為原始產品
        modalProductName.textContent = originalProduct.name;

        // 載入當前項目的值到模態視窗
        // 杯型
        sizeOptionsDiv.innerHTML = '';
        if (originalProduct.priceSmall) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="小杯" id="size-small" ${itemToEdit.size === '小杯' ? 'checked' : ''}> <label for="size-small">小杯 ($${originalProduct.priceSmall.toFixed(2)})</label>`;
        }
        if (originalProduct.priceLarge) {
            sizeOptionsDiv.innerHTML += `<input type="radio" name="size" value="大杯" id="size-large" ${itemToEdit.size === '大杯' ? 'checked' : ''}> <label for="size-large">大杯 ($${originalProduct.priceLarge.toFixed(2)})</label>`;
        }

        // 冰熱
        temperatureOptionsDiv.innerHTML = '';
        if (originalProduct.canBeCold) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="冰" id="temp-cold" ${itemToEdit.temperature === '冰' ? 'checked' : ''}> <label for="temp-cold">冰</label>`;
        }
        if (originalProduct.canBeHot) {
            temperatureOptionsDiv.innerHTML += `<input type="radio" name="temperature" value="熱" id="temp-hot" ${itemToEdit.temperature === '熱' ? 'checked' : ''}> <label for="temp-hot">熱</label>`;
        }

        // 甜度
        sweetnessSelect.innerHTML = '';
        for (let i = originalProduct.minSweetnessLevel; i <= originalProduct.maxSweetnessLevel; i++) {
            sweetnessSelect.innerHTML += `<option value="${i}" ${itemToEdit.sweetnessLevel === i ? 'selected' : ''}>${getSweetnessLabel(i)}</option>`;
        }

        // 冰塊
        iceSelect.innerHTML = '';
        for (let i = originalProduct.minIceLevel; i <= originalProduct.maxIceLevel; i++) {
            iceSelect.innerHTML += `<option value="${i}" ${itemToEdit.iceLevel === i ? 'selected' : ''}>${getIceLevelLabel(i)}</option>`;
        }

        // 副料
        toppingsListDiv.innerHTML = '';
        const selectedToppingIds = new Set(itemToEdit.selectedToppings.map(t => t.id));
        toppings.filter(t => t.isActive).forEach(t => {
            const toppingItemDiv = document.createElement('div');
            const isChecked = selectedToppingIds.has(t.id);
            toppingItemDiv.innerHTML = `
                <input type="checkbox" id="topping-${t.id}" value="${t.id}" data-price="${t.price.toFixed(2)}" ${isChecked ? 'checked' : ''}>
                <label for="topping-${t.id}">${t.name} ($${t.price.toFixed(2)})</label>
            `;
            toppingsListDiv.appendChild(toppingItemDiv);
        });

        quantityInput.value = itemToEdit.quantity;

        // 將 "加入購物車" 按鈕的行為改為 "更新購物車項目"
        addToCartModalBtn.textContent = '更新購物車';
        addToCartModalBtn.onclick = () => {
            const updatedItem = collectProductOptions(originalProduct);
            if (updatedItem) {
                cart[indexToEdit] = updatedItem; // 直接替換掉原項目
                updateCartDisplay();
                productOptionsModal.style.display = 'none';
                alert('購物車項目已更新！');
            }
            // 恢復按鈕文字和行為
            addToCartModalBtn.textContent = '加入購物車';
            addToCartModalBtn.onclick = () => {
                 if (currentProductInModal) {
                    const result = collectProductOptions(currentProductInModal);
                    if (result) {
                        addToCart(result);
                        productOptionsModal.style.display = 'none';
                    }
                }
            };
        };
        productOptionsModal.style.display = 'flex';
    }


    // 啟動頁面
    initOrderingPage();
});