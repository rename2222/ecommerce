// API Configuration
const API_BASE_URL = 'http://localhost:8080';
const PRODUCTS_API = `${API_BASE_URL}/api/products`;
const TEST_API = `${API_BASE_URL}/api/test`;

// Global variables
window.allProducts = [];

// Utility Functions
function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

function showSuccess(message) {
    hideMessages();
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    if (successMessage && successText) {
        successText.textContent = message;
        successMessage.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

function showError(message) {
    hideMessages();
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideMessages() {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Backend Connection
async function testBackendConnection() {
    const statusElement = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');

    if (!statusElement || !statusText) return;

    try {
        statusText.textContent = 'Testing backend connection...';
        statusElement.className = 'alert alert-info';

        const response = await fetch(`${TEST_API}/hello`);
        const result = await response.text();

        statusText.textContent = `✅ Backend Connected: ${result}`;
        statusElement.className = 'alert alert-success';

        console.log('Backend connection successful:', result);
    } catch (error) {
        statusText.textContent = '❌ Cannot connect to backend. Make sure Spring Boot is running on port 8080';
        statusElement.className = 'alert alert-danger';
        console.error('Backend connection failed:', error);
    }
}

// Product Functions
async function loadProducts() {
    showLoading(true);
    hideMessages();

    try {
        console.log('Loading products from:', `${PRODUCTS_API}/public/all`);

        const response = await fetch(`${PRODUCTS_API}/public/all`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        window.allProducts = await response.json();
        console.log('Loaded products:', window.allProducts);

        displayProducts(window.allProducts);
        showSuccess(`Loaded ${window.allProducts.length} products successfully!`);

    } catch (error) {
        console.error('Error loading products:', error);
        showError(`Failed to load products: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function loadProductsCount() {
    try {
        const response = await fetch(`${PRODUCTS_API}/public/all`);
        if (response.ok) {
            const products = await response.json();
            const countElement = document.getElementById('productsCount');
            if (countElement) {
                countElement.textContent = products.length;
                showSuccess(`Products count updated: ${products.length} products`);
            }
        }
    } catch (error) {
        console.error('Error loading products count:', error);
        showError('Failed to load products count');
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProductsMessage = document.getElementById('noProductsMessage');

    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '';
        if (noProductsMessage) noProductsMessage.style.display = 'block';
        return;
    }

    if (noProductsMessage) noProductsMessage.style.display = 'none';

    container.innerHTML = products.map(product => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(product.proname || 'No Name')}</h5>
                    <p class="card-text text-muted">${escapeHtml(product.discription || 'No description')}</p>

                    <div class="mb-3">
                        <span class="badge bg-primary">${escapeHtml(product.category || 'Uncategorized')}</span>
                        <span class="badge bg-${product.quantity > 0 ? 'success' : 'danger'} ms-1">
                            ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h5 text-success">$${product.price ? product.price.toFixed(2) : '0.00'}</span>
                        <span class="text-muted">Qty: ${product.quantity || 0}</span>
                    </div>

                    <div class="mt-3">
                        <button class="btn btn-outline-primary btn-sm w-100" onclick="viewProductDetails('${product.productId}')">
                            <i class="fas fa-eye me-1"></i>View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function viewProductDetails(productId) {
    try {
        const response = await fetch(`${PRODUCTS_API}/public/${productId}`);

        if (!response.ok) {
            throw new Error('Product not found');
        }

        const product = await response.json();

        const modalBody = document.getElementById('productModalBody');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h4>${escapeHtml(product.proname)}</h4>
                        <p class="text-muted">${escapeHtml(product.discription)}</p>
                        <p><strong>Category:</strong> ${escapeHtml(product.category)}</p>
                        <p><strong>Price:</strong> $${product.price ? product.price.toFixed(2) : '0.00'}</p>
                        <p><strong>Quantity:</strong> ${product.quantity}</p>
                        <p><strong>Review:</strong> ${escapeHtml(product.review || 'No review')}</p>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body text-center">
                                <i class="fas fa-box fa-3x text-primary mb-3"></i>
                                <p><strong>Product ID:</strong></p>
                                <code>${product.productId}</code>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();

    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Failed to load product details');
    }
}

// Add Product Functions
async function handleAddProduct(event) {
    event.preventDefault();
    console.log('Add product form submitted');

    if (!validateForm()) {
        showError('Please fill all required fields correctly');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
    submitBtn.disabled = true;

    const productData = {
        proname: document.getElementById('productName').value.trim(),
        discription: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        category: document.getElementById('productCategory').value,
        review: document.getElementById('productReview').value.trim() || "No review yet"
    };

    console.log('Sending product data:', productData);

    try {
        const response = await fetch(PRODUCTS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        console.log('Add product response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const newProduct = await response.json();
        console.log('Product added successfully:', newProduct);

        showSuccess(`Product "${newProduct.proname}" added successfully!`);
        document.getElementById('addProductForm').reset();

        // Redirect to products page after 2 seconds
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);

    } catch (error) {
        console.error('Error adding product:', error);
        showError('Failed to add product: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function validateForm() {
    const form = document.getElementById('addProductForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Make functions globally available
window.loadProducts = loadProducts;
window.loadProductsCount = loadProductsCount;
window.viewProductDetails = viewProductDetails;
window.handleAddProduct = handleAddProduct;
window.testBackendConnection = testBackendConnection;