// API Configuration - Frontend: 3000, Backend: 8080
const API_BASE_URL = 'http://localhost:8080';
const PRODUCTS_API = `${API_BASE_URL}/product`;

// Global variables
let allProducts = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frontend initialized - Port 3000');
    console.log('Backend API:', PRODUCTS_API);
    
    if (window.location.pathname.endsWith('index.html') || 
        window.location.pathname === '/') {
        loadProductsCount();
        checkBackendConnection();
    }
    
    if (window.location.pathname.endsWith('products.html')) {
        loadProducts();
        setupEventListeners();
        checkBackendConnection();
    }
    
    if (window.location.pathname.endsWith('add-product.html')) {
        setupAddProductForm();
        checkBackendConnection();
    }
});

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch(PRODUCTS_API, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const statusElement = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        
        if (statusElement && statusText) {
            if (response.ok) {
                statusText.textContent = 'Connected successfully ✓';
                statusElement.className = 'alert alert-success';
            } else {
                statusText.textContent = `Connection issue: ${response.status}`;
                statusElement.className = 'alert alert-warning';
            }
            statusElement.style.display = 'block';
        }
    } catch (error) {
        const statusElement = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        
        if (statusElement && statusText) {
            statusText.textContent = 'Cannot connect to backend. Make sure Spring Boot is running on port 8080';
            statusElement.className = 'alert alert-danger';
            statusElement.style.display = 'block';
        }
        console.error('Backend connection failed:', error);
    }
}

// Event Listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Product API Functions
async function loadProducts() {
    showLoading(true);
    hideMessages();

    try {
        const response = await fetch(PRODUCTS_API, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allProducts = await response.json();
        displayProducts(allProducts);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Make sure Spring Boot backend is running on port 8080');
    } finally {
        showLoading(false);
    }
}

async function loadProductsCount() {
    try {
        const response = await fetch(PRODUCTS_API);
        if (response.ok) {
            const products = await response.json();
            const countElement = document.getElementById('productsCount');
            if (countElement) {
                countElement.textContent = products.length;
            }
        }
    } catch (error) {
        console.error('Error loading products count:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProductsMessage = document.getElementById('noProductsMessage');

    if (!products || products.length === 0) {
        container.innerHTML = '';
        noProductsMessage.style.display = 'block';
        return;
    }

    noProductsMessage.style.display = 'none';

    container.innerHTML = products.map(product => `
        <div class="col-lg-4 col-md-6">
            <div class="card product-card fade-in">
                <div class="product-image">
                    <i class="fas fa-${getProductIcon(product.category)}"></i>
                </div>
                <div class="card-body">
                    <h5 class="product-title">${escapeHtml(product.name)}</h5>
                    <p class="card-text text-muted">${escapeHtml(product.description)}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</span>
                        <span class="product-category">${escapeHtml(product.category)}</span>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="${product.quantity > 0 ? 'stock-in' : 'stock-out'}">
                            <i class="fas fa-${product.quantity > 0 ? 'check' : 'times'} me-1"></i>
                            ${product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                        <div class="btn-group">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewProductDetails('${product.id}')">
                                <i class="fas fa-eye me-1"></i>View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getProductIcon(category) {
    const icons = {
        'Electronics': 'laptop',
        'Clothing': 'tshirt',
        'Books': 'book',
        'Home': 'home',
        'Sports': 'futbol',
        'Beauty': 'spa',
        'Toys': 'gamepad',
        'Other': 'box'
    };
    return icons[category] || 'box';
}

async function viewProductDetails(productId) {
    try {
        const response = await fetch(`${PRODUCTS_API}/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Product not found');
        }

        const product = await response.json();
        
        const modalBody = document.getElementById('productModalBody');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <div class="product-image mb-3" style="height: 150px; border-radius: 10px;">
                        <i class="fas fa-${getProductIcon(product.category)} fa-3x"></i>
                    </div>
                    <h4 class="text-primary">$${product.price ? product.price.toFixed(2) : '0.00'}</h4>
                    <span class="badge bg-${product.quantity > 0 ? 'success' : 'danger'} fs-6">
                        ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                <div class="col-md-8">
                    <h4>${escapeHtml(product.name)}</h4>
                    <p class="text-muted">${escapeHtml(product.description)}</p>
                    
                    <div class="row mt-4">
                        <div class="col-6">
                            <strong><i class="fas fa-box me-2 text-warning"></i>Quantity:</strong>
                            <p class="mb-0">${product.quantity} units</p>
                        </div>
                        <div class="col-6">
                            <strong><i class="fas fa-folder me-2 text-secondary"></i>Category:</strong>
                            <p class="mb-0">${escapeHtml(product.category)}</p>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <strong><i class="fas fa-id-card me-2 text-info"></i>Product ID:</strong>
                            <p class="mb-0"><small>${product.id}</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();

    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Failed to load product details');
    }
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (!searchTerm) {
        displayProducts(allProducts);
        return;
    }

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );

    displayProducts(filteredProducts);
}

// Add Product Functions
function setupAddProductForm() {
    const form = document.getElementById('addProductForm');
    form.addEventListener('submit', handleAddProduct);
}

async function handleAddProduct(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
    submitBtn.disabled = true;

    const productData = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        category: document.getElementById('productCategory').value
    };

    try {
        const response = await fetch(PRODUCTS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const newProduct = await response.json();
        showSuccess(`Product "${newProduct.name}" added successfully! Redirecting...`);
        clearForm();

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
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

function clearForm() {
    document.getElementById('addProductForm').reset();
    const inputs = document.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    hideMessages();
}

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
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Make functions globally available
window.loadProducts = loadProducts;
window.searchProducts = searchProducts;
window.viewProductDetails = viewProductDetails;
window.clearForm = clearForm;