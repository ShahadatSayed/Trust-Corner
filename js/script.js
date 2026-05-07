// Trust Corner - Frontend Logic

// Product Data (Mock Database)
const products = [
    {
        id: 1,
        name: "Radiance Serum",
        price: 85.00,
        image: "images/product_serum.png",
        category: "skincare"
    },
    {
        id: 2,
        name: "Hydrating Day Cream",
        price: 65.00,
        image: "images/product_cream.png",
        category: "skincare"
    },
    {
        id: 3,
        name: "Gentle Foaming Cleanser",
        price: 35.00,
        image: "images/product_cleanser.png",
        category: "skincare"
    },
    {
        id: 4,
        name: "Rosewater Toner",
        price: 40.00,
        image: "images/product_serum.png", // Reusing image for demo
        category: "skincare"
    },
    {
        id: 5,
        name: "Night Repair Cream",
        price: 90.00,
        image: "images/product_cream.png", // Reusing image for demo
        category: "skincare"
    },
    {
        id: 6,
        name: "Exfoliating Scrub",
        price: 45.00,
        image: "images/product_cleanser.png", // Reusing image for demo
        category: "skincare"
    }
];

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize Cart Count on Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Setup 'Add to Cart' buttons if on shop or home page
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(btn.getAttribute('data-id'));
            const quantityInput = document.getElementById(`qty-${id}`);
            const qty = quantityInput ? parseInt(quantityInput.value) : 1;
            addToCart(id, qty);
        });
    });

    // Render Cart Page if on cart.html
    if (document.getElementById('cart-container')) {
        renderCart();
    }

    // Checkout form handling
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!checkoutForm.checkValidity()) {
                e.stopPropagation();
                checkoutForm.classList.add('was-validated');
            } else {
                // Clear cart and show success
                localStorage.removeItem('cart');
                cart = [];
                updateCartCount();
                alert('Thank you for your order! Your payment was processed successfully.');
                window.location.href = 'index.html';
            }
        });
        renderCheckoutSummary();
    }
});

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.name} added to your cart.`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart(); // Re-render if on cart page
    if (document.getElementById('checkout-summary')) {
        renderCheckoutSummary();
    }
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
            if (document.getElementById('checkout-summary')) {
                renderCheckoutSummary();
            }
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function renderCart() {
    const container = document.getElementById('cart-container');
    const totalsContainer = document.getElementById('cart-totals');
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center py-5">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
        if (totalsContainer) totalsContainer.style.display = 'none';
        return;
    }

    if (totalsContainer) totalsContainer.style.display = 'block';

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const html = `
            <div class="row cart-item align-items-center">
                <div class="col-md-2 col-4">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid cart-item-img">
                </div>
                <div class="col-md-4 col-8">
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="text-muted mb-0">$${item.price.toFixed(2)}</p>
                </div>
                <div class="col-md-3 col-6 mt-3 mt-md-0">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control form-control-sm quantity-input mx-2" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="col-md-2 col-4 text-end mt-3 mt-md-0 fw-bold">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <div class="col-md-1 col-2 text-end mt-3 mt-md-0">
                    <button class="btn btn-sm text-danger" onclick="removeFromCart(${item.id})"><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    // Update Totals
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

function renderCheckoutSummary() {
    const summaryList = document.getElementById('checkout-summary');
    if (!summaryList) return;
    
    summaryList.innerHTML = '';
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between lh-sm';
        li.innerHTML = `
            <div>
                <h6 class="my-0">${item.name}</h6>
                <small class="text-muted">Qty: ${item.quantity}</small>
            </div>
            <span class="text-muted">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        summaryList.appendChild(li);
    });

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    summaryList.insertAdjacentHTML('beforeend', `
        <li class="list-group-item d-flex justify-content-between bg-light">
            <div class="text-success">
                <h6 class="my-0">Tax (8%)</h6>
            </div>
            <span class="text-success">$${tax.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
            <span>Total (USD)</span>
            <strong>$${total.toFixed(2)}</strong>
        </li>
    `);
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-dark border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
