// js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const checkoutCartList = document.getElementById('checkout-cart-list');
    const checkoutTotalPriceSpan = document.getElementById('checkout-total-price');
    const phoneNumberInput = document.getElementById('phone-number');
    const memberPointsSpan = document.getElementById('member-points');
    const checkoutForm = document.getElementById('checkout-form');
    const pickupDeliveryDetailsDiv = document.getElementById('pickup-delivery-details');
    const datetimeInput = document.getElementById('datetime-input');
    const datetimeLabel = document.getElementById('datetime-label');
    const deliveryAddressGroup = document.getElementById('delivery-address-group');
    const orderNotesInput = document.getElementById('order-notes');

    // Payment options
    const paymentCash = document.getElementById('payment-cash');
    const paymentOnline = document.getElementById('payment-online');
    const paymentSite = document.getElementById('payment-site');
    const paymentDeliveryOnSite = document.getElementById('payment-delivery-on-site');
    const cashPaymentOptionDiv = document.getElementById('cash-payment-option');
    const onlinePaymentOptionDiv = document.getElementById('online-payment-option');
    const sitePaymentOptionDiv = document.getElementById('site-payment-option');
    const deliveryPaymentOptionDiv = document.getElementById('delivery-payment-option');


    let cart = [];
    let totalAmount = 0;
    let currentMember = null; // 儲存查詢到的會員資訊

    async function initCheckoutPage() {
        loadCartFromSession();
        displayCartSummary();
        setupEventListeners();

        // 預設選擇內用和現金結帳
        document.getElementById('delivery-dine-in').checked = true;
        paymentCash.checked = true;
        updatePaymentOptions(); // 確保初始狀態正確
    }

    function loadCartFromSession() {
        const storedCart = sessionStorage.getItem('cart');
        const storedTotal = sessionStorage.getItem('totalAmount');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            totalAmount = parseFloat(storedTotal || '0');
        } else {
            alert('購物車沒有內容，請先前往點餐頁面。');
            window.location.href = 'ordering.html';
        }
    }

    function displayCartSummary() {
        checkoutCartList.innerHTML = '';
        if (cart.length === 0) {
            checkoutCartList.innerHTML = '<li>購物車是空的。</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                let toppingsText = item.selectedToppings.map(t => t.name).join(', ');
                if (toppingsText) toppingsText = ` (+ ${toppingsText})`;

                li.innerHTML = `
                    <span>${item.productName} (${item.size}, ${item.temperature}${toppingsText}) x ${item.quantity}</span>
                    <span>NT$ ${(item.itemPrice * item.quantity).toFixed(2)}</span>
                `;
                checkoutCartList.appendChild(li);
            });
        }
        checkoutTotalPriceSpan.textContent = totalAmount.toFixed(2);
    }

    function setupEventListeners() {
        // 手機號碼輸入事件 (即時查詢點數)
        phoneNumberInput.addEventListener('blur', async () => {
            const phoneNumber = phoneNumberInput.value.trim();
            if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
                try {
                    const member = await apiRequest(`/customer/members?phoneNumber=${phoneNumber}`);
                    if (member && member.points !== undefined) {
                        currentMember = member; // 儲存會員資訊
                        memberPointsSpan.textContent = member.points;
                        alert(`會員 ${phoneNumber} 您好，目前累積 ${member.points} 點。`);
                    } else {
                        currentMember = null;
                        memberPointsSpan.textContent = '0';
                        alert('此手機號碼無會員資料，將自動註冊並累積點數。');
                    }
                } catch (error) {
                    currentMember = null;
                    memberPointsSpan.textContent = '0';
                    console.error('查詢會員失敗:', error);
                    alert('查詢會員點數失敗，請確認手機號碼或網路。');
                }
            } else if (phoneNumber !== '') {
                memberPointsSpan.textContent = '0';
                currentMember = null;
            }
        });

        // 取餐方式選擇事件
        document.querySelectorAll('input[name="delivery-type"]').forEach(radio => {
            radio.addEventListener('change', updatePaymentOptions);
        });

        // 結帳表單提交
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    function updatePaymentOptions() {
        const selectedDeliveryType = document.querySelector('input[name="delivery-type"]:checked').value;

        // 重置支付選項顯示
        cashPaymentOptionDiv.style.display = 'block'; // 內用/自取 線上結帳
        onlinePaymentOptionDiv.style.display = 'block'; // 內用/自取 線上結帳
        sitePaymentOptionDiv.style.display = 'none'; // 僅自取
        deliveryPaymentOptionDiv.style.display = 'none'; // 僅外送

        // 隱藏時間和地址欄位
        pickupDeliveryDetailsDiv.style.display = 'none';
        deliveryAddressGroup.style.display = 'none';
        datetimeInput.removeAttribute('required');
        datetimeInput.value = '';
        document.getElementById('delivery-address').removeAttribute('required');


        switch (selectedDeliveryType) {
            case '內用':
                paymentCash.checked = true; // 預設現金
                // sitePaymentOptionDiv, deliveryPaymentOptionDiv 保持隱藏
                break;
            case '自取':
                paymentSite.style.display = 'block'; // 顯示現場結帳
                paymentSite.checked = true; // 預設現場結帳
                cashPaymentOptionDiv.style.display = 'none'; // 隱藏現金結帳
                datetimeLabel.textContent = '選擇自取時間:';
                pickupDeliveryDetailsDiv.style.display = 'block';
                datetimeInput.setAttribute('required', 'required');
                setMinimumDatetime(datetimeInput);
                break;
            case '外送':
                paymentDeliveryOnSite.style.display = 'block'; // 顯示送達結帳
                paymentOnline.checked = true; // 預設線上結帳
                cashPaymentOptionDiv.style.display = 'none'; // 隱藏現金結帳
                onlinePaymentOptionDiv.style.display = 'block'; // 線上結帳仍然可用
                datetimeLabel.textContent = '選擇送達時間:';
                pickupDeliveryDetailsDiv.style.display = 'block';
                deliveryAddressGroup.style.display = 'block';
                datetimeInput.setAttribute('required', 'required');
                document.getElementById('delivery-address').setAttribute('required', 'required');
                setMinimumDatetime(datetimeInput);
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

    async function handleCheckoutSubmit(event) {
        event.preventDefault();

        const selectedDeliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const phoneNumber = phoneNumberInput.value.trim();
        const pickupDeliveryTime = datetimeInput.value ? new Date(datetimeInput.value).toISOString() : null; // ISO 8601 format
        const deliveryAddress = document.getElementById('delivery-address').value.trim();
        const notes = orderNotesInput.value.trim();

        if (cart.length === 0) {
            alert('購物車是空的，無法結帳！');
            return;
        }

        // 基本驗證
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


        // 轉換購物車項目為後端 DTO 格式
        const orderItemsDTO = cart.map(item => ({
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

        const orderData = {
            phoneNumber: phoneNumber || null,
            totalAmount: totalAmount,
            paymentMethod: selectedPaymentMethod,
            deliveryType: selectedDeliveryType,
            pickupDeliveryTime: pickupDeliveryTime,
            notes: notes,
            orderItems: orderItemsDTO
        };

        try {
            const response = await apiRequest('/customer/order', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            if (response) {
                alert('訂單建立成功！');
                sessionStorage.removeItem('cart'); // 清空購物車
                sessionStorage.removeItem('totalAmount');

                // 處理金流跳轉 (模擬綠界)
                if (selectedPaymentMethod === '線上結帳') {
                    // 在這裡，您需要向後端請求綠界的支付 URL
                    // 為了範例，我們假設後端會回傳一個支付連結或跳轉數據
                    // 實際應用中，這裡可能還會包含訂單 ID 等參數
                    alert('即將跳轉至線上支付頁面 (綠界模擬)...');
                    // 實際情況應是後端生成並返回綠界支付網址
                    // window.location.href = 'YOUR_ECPAY_PAYMENT_URL';
                    // 這裡只是演示，實際綠界整合複雜得多
                    window.location.href = 'index.html'; // 假設支付成功後回到首頁
                } else {
                    alert('訂單已送出，請等待店家處理。');
                    window.location.href = 'index.html'; // 結帳完成後回到首頁
                }
            }
        } catch (error) {
            console.error('結帳失敗:', error);
            // 錯誤處理已在 apiRequest 中處理，這裡可以做額外 UI 反饋
        }
    }

    initCheckoutPage();
});