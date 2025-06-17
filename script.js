document.addEventListener('DOMContentLoaded', function() {
    
    // --- PENGATURAN & DATA ---
    const WHATSAPP_NUMBER = '62895391539843'; // GANTI DENGAN NOMOR WHATSAPP ANDA
    const savedCart = localStorage.getItem('shoppingCart');
    let cart = savedCart ? JSON.parse(savedCart) : [];

    // --- ELEMEN DOM ---
    const cartBadge = document.getElementById('cart-badge');
    const sideCartOverlay = document.getElementById('side-cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const checkoutFromCartBtn = document.getElementById('cart-checkout-btn');
    const allModals = document.querySelectorAll('.modal-overlay');
    const slider = document.querySelector('.product-slider');
    const checkoutModal = document.getElementById('checkout-modal');

    // --- FUNGSI-FUNGSI BANTUAN ---
    function formatCurrency(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✔' : '✖'}</span><p class="toast-message">${message}</p><button class="toast-close-btn">&times;</button>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 100);
        const timeoutId = setTimeout(() => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 5000);
        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            clearTimeout(timeoutId);
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        });
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    // --- FUNGSI KERANJANG ---
    function addToCart(product) {
        if (!product || !product.id) return;
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        showNotification(`${product.title} ditambahkan ke keranjang!`);
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    }

    function updateCartUI() {
        if (!cartBadge || !cartItemsContainer || !cartTotalPriceEl) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.classList.toggle('visible', totalItems > 0);
        if (totalItems === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Keranjang Anda kosong.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${formatCurrency(item.price)}</div>
                        <div class="cart-item-actions">
                            <span class="cart-item-quantity">Jumlah: ${item.quantity}</span>
                            <button class="remove-item-btn" data-id="${item.id}">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = formatCurrency(totalPrice);
    }

    // --- FUNGSI MODAL ---
    function openModal(modal, data) {
        if (!modal || !data) return;
        modal.dataset.productId = data.id;
        if (modal.id === 'product-modal') {
            const cardElement = document.querySelector(`.product-card[data-id="${data.id}"]`);
            const featuresHTML = cardElement ? cardElement.querySelector('.features').innerHTML : 'Deskripsi tidak tersedia.';
            modal.querySelector('#modal-img').src = data.img;
            modal.querySelector('#modal-title').innerText = data.title;
            modal.querySelector('#modal-desc-content').innerHTML = featuresHTML;
            modal.querySelector('#modal-price').innerText = "Harga: " + formatCurrency(parseInt(data.price));
        }
        if (modal.id === 'checkout-modal') {
            modal.dataset.unitPrice = parseInt(data.price);
            modal.querySelector('#checkout-product-name').innerText = data.title;
            modal.querySelector('#quantity-input').value = 1;
            modal.querySelector('#nama-penerima').value = '';
            updateCheckoutSummary();
        }
        modal.classList.add('visible');
    }

    function closeModal(modal) {
        if (modal) modal.classList.remove('visible');
    }

    function updateCheckoutSummary() {
        if (!checkoutModal) return;
        const unitPrice = parseInt(checkoutModal.dataset.unitPrice) || 0;
        const quantity = parseInt(checkoutModal.querySelector('#quantity-input').value) || 1;
        const subtotal = unitPrice * quantity;
        checkoutModal.querySelector('#summary-unit-price').innerText = formatCurrency(unitPrice);
        checkoutModal.querySelector('#summary-quantity').innerText = quantity;
        checkoutModal.querySelector('#summary-subtotal').innerText = formatCurrency(subtotal);
        checkoutModal.querySelector('#summary-total').innerText = formatCurrency(subtotal);
    };

    // --- EVENT LISTENERS ---

    // Listener Utama pada Body untuk Tombol-tombol Dinamis
    document.body.addEventListener('click', function(e) {
        const target = e.target;
        if (target.closest('.btn-keranjang')) {
            const card = target.closest('.product-card') || target.closest('.modal-content');
            let productId = card.dataset.id || (card.closest('.modal-overlay') && card.closest('.modal-overlay').dataset.productId);
            if (productId) {
                const sourceCard = document.querySelector(`.product-card[data-id="${productId}"]`);
                if (sourceCard) {
                    const product = { id: sourceCard.dataset.id, title: sourceCard.dataset.title, price: parseInt(sourceCard.dataset.price), img: sourceCard.dataset.img };
                    addToCart(product);
                }
            }
        }
        if (target.closest('.btn-pesan')) {
            const card = target.closest('.product-card') || target.closest('.modal-content');
            let productId = card.dataset.id || (card.closest('.modal-overlay') && card.closest('.modal-overlay').dataset.productId);
            if (productId) {
                const sourceCard = document.querySelector(`.product-card[data-id="${productId}"]`);
                if (sourceCard) {
                    openModal(document.getElementById('checkout-modal'), sourceCard.dataset);
                }
            }
        }
        if (target.closest('.detail-link')) {
            e.preventDefault();
            const card = target.closest('.product-card');
            if (card && card.dataset.id) {
                openModal(document.getElementById('product-modal'), card.dataset);
            }
        }
    });

    // Listener untuk slider produk
    if (slider) {
        const scrollLeftBtn = document.getElementById('scroll-left');
        const scrollRightBtn = document.getElementById('scroll-right');
        scrollRightBtn.addEventListener('click', () => slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' }));
        scrollLeftBtn.addEventListener('click', () => slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' }));
    }

    // Listener untuk panel keranjang (side cart)
    if (openCartBtn) openCartBtn.addEventListener('click', () => sideCartOverlay.classList.add('open'));
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => sideCartOverlay.classList.remove('open'));
    if (sideCartOverlay) sideCartOverlay.addEventListener('click', (e) => (e.target === sideCartOverlay) && sideCartOverlay.classList.remove('open'));
    if (cartItemsContainer) cartItemsContainer.addEventListener('click', (e) => (e.target.classList.contains('remove-item-btn')) && removeFromCart(e.target.dataset.id));
    if (checkoutFromCartBtn) {
        checkoutFromCartBtn.addEventListener('click', function() {
            if (cart.length === 0) return alert('Keranjang Anda kosong!');
            saveCart();
            window.location.href = 'payment.html';
        });
    }

    // Listener untuk menutup semua modal
    allModals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
        modal.addEventListener('click', (e) => (e.target === modal) && closeModal(modal));
    });
    document.addEventListener('keydown', (e) => (e.key === 'Escape') && allModals.forEach(closeModal));

    // Listener untuk form checkout
    if (checkoutModal) {
        checkoutModal.querySelector('#quantity-plus').addEventListener('click', () => { checkoutModal.querySelector('#quantity-input').value++; updateCheckoutSummary(); });
        checkoutModal.querySelector('#quantity-minus').addEventListener('click', () => { if (checkoutModal.querySelector('#quantity-input').value > 1) { checkoutModal.querySelector('#quantity-input').value--; updateCheckoutSummary(); } });
        checkoutModal.querySelector('#quantity-input').addEventListener('input', updateCheckoutSummary);

        // INILAH BAGIAN YANG DIPERBAIKI
        checkoutModal.querySelector('#checkout-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const nama = checkoutModal.querySelector('#nama-penerima').value;
            if (!nama) return alert('Nama penerima tidak boleh kosong!');
            
            const productId = checkoutModal.closest('.modal-overlay').dataset.productId;
            const sourceCard = document.querySelector(`.product-card[data-id="${productId}"]`);
            if (!sourceCard) return alert('Terjadi kesalahan, produk tidak ditemukan.');

            const quantity = parseInt(checkoutModal.querySelector('#quantity-input').value);

            const singleItemCart = [{
                id: sourceCard.dataset.id,
                title: sourceCard.dataset.title,
                price: parseInt(sourceCard.dataset.price),
                img: sourceCard.dataset.img,
                quantity: quantity
            }];

            // Simpan pesanan tunggal ini dan arahkan ke halaman pembayaran
            localStorage.setItem('shoppingCart', JSON.stringify(singleItemCart));
            window.location.href = 'payment.html';
        });
    }

    // --- INISIALISASI ---
    updateCartUI();
});