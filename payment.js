document.addEventListener('DOMContentLoaded', function () {
    // --- PENGATURAN ---
    const WHATSAPP_NUMBER = '62895391539843'; // GANTI DENGAN NOMOR WHATSAPP ANDA

    // --- ELEMEN DOM ---
    const orderItemsContainer = document.getElementById('order-summary-items');
    const totalPaymentEl = document.getElementById('total-payment');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const qrisToggle = document.getElementById('qris-toggle');
    const qrisContent = document.getElementById('qris-content');
    const qrisImage = document.getElementById('qris-image');
    const imageModalOverlay = document.getElementById('image-modal-overlay');
    const enlargedQrisImage = document.getElementById('enlarged-qris-image');
    const imageModalCloseBtn = document.querySelector('.image-modal-close-btn');
    const whatsappConfirmBtn = document.getElementById('whatsapp-confirm-btn'); // Tombol baru

    function formatCurrency(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    const cartDataString = localStorage.getItem('shoppingCart');
    let cart = []; // Definisikan cart di scope yang lebih luas

    if (cartDataString) {
        cart = JSON.parse(cartDataString);
        let total = 0;

        if (cart.length > 0) {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                itemElement.innerHTML = `<span class="order-item-name">${item.title} (x${item.quantity})</span><span>${formatCurrency(itemTotal)}</span>`;
                orderItemsContainer.appendChild(itemElement);
            });
            totalPaymentEl.textContent = formatCurrency(total);
        } else {
            displayEmptyCart();
        }
    } else {
        displayEmptyCart();
    }

    function displayEmptyCart() {
        orderItemsContainer.innerHTML = '<p>Tidak ada item pesanan.</p>';
        totalPaymentEl.textContent = formatCurrency(0);
        if (whatsappConfirmBtn) {
            whatsappConfirmBtn.style.display = 'none'; // Sembunyikan tombol jika keranjang kosong
        }
    }
    
    // --- BUAT PESAN WHATSAPP DAN SET LINK TOMBOL ---
    if (whatsappConfirmBtn && cart.length > 0) {
        let message = "Halo, saya ingin konfirmasi pembayaran untuk pesanan berikut:\n\n";
        cart.forEach(item => {
            message += `*Produk:* ${item.title}\n`;
            message += `*Jumlah:* ${item.quantity}\n\n`;
        });
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `*Total Pembayaran: ${formatCurrency(total)}*\n\n`;
        message += "Berikut saya akan kirimkan bukti transfer. Terima kasih!";

        const encodedMessage = encodeURIComponent(message);
        whatsappConfirmBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    }

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetElement = document.getElementById(targetId);
            navigator.clipboard.writeText(targetElement.innerText).then(() => {
                const originalText = button.innerText;
                button.innerText = 'Disalin!';
                setTimeout(() => { button.innerText = originalText; }, 2000);
            });
        });
    });

    if (qrisToggle) {
        qrisToggle.addEventListener('click', () => {
            qrisContent.classList.toggle('visible');
            qrisToggle.classList.toggle('open');
        });
    }

    if (qrisImage && imageModalOverlay) {
        qrisImage.addEventListener('click', () => {
            enlargedQrisImage.src = qrisImage.src;
            imageModalOverlay.style.display = 'flex';
        });
        imageModalCloseBtn.addEventListener('click', () => {
            imageModalOverlay.style.display = 'none';
        });
        imageModalOverlay.addEventListener('click', (e) => {
            if (e.target === imageModalOverlay) {
                imageModalOverlay.style.display = 'none';
            }
        });
    }
});