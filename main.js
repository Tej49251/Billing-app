// Add Customer
document.getElementById('customer-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = Object.fromEntries(formData);

    const response = await fetch('/customers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    });
    const result = await response.text();
    alert(result);
});

// Add Product
document.getElementById('product-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = Object.fromEntries(formData);

    const response = await fetch('/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
    });
    const result = await response.text();
    alert(result);
});

// Add Billing
document.getElementById('billing-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const billing = Object.fromEntries(formData);

    const response = await fetch('/billing/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billing),
    });
    const result = await response.text();
    alert(result);
});

// View Customers
document.querySelector('#ViewCustomer .home-button a').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/customers/');
        const customers = await response.json();
        const customerList = document.getElementById('customer-list');
        customerList.innerHTML = customers.map(customer => 
            `<tr><td>${customer.name}</td><td>${customer.gender}</td><td>${customer.contact}</td><td>${customer.email}</td></tr>`
        ).join('');
    } catch (error) {
        alert('Error fetching customer data: ' + error.message);
    }
});

// View Products
document.querySelector('#ViewInventory .home-button a').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/products/');
        const products = await response.json();
        const productList = document.getElementById('product-list');
        productList.innerHTML = products.map(product => 
            `<tr><td>${product.name}</td><td>${product.price}</td><td>${product.quantity}</td><td>${product.brand}</td><td>${product.supplier}</td></tr>`
        ).join('');
    } catch (error) {
        alert('Error fetching product data: ' + error.message);
    }
});

// View Billings
document.querySelector('#ViewBilling .home-button a').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/billing/');
        const billings = await response.json();
        const billingList = document.getElementById('billing-list');
        billingList.innerHTML = billings.map(billing => 
            `<tr><td>${billing.customer_name}</td><td>${billing.product_name}</td><td>${billing.quantity}</td><td>${billing.date}</td></tr>`
        ).join('');
    } catch (error) {
        alert('Error fetching billing data: ' + error.message);
    }
});

// Load customers and products when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadProducts();
});

// Function to populate the customer dropdown
async function loadCustomers() {
    try {
        const response = await fetch('/customers/');
        const customers = await response.json();
        const customerDropdown = document.getElementById('customer-dropdown');
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            customerDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// Function to populate the product dropdown
async function loadProducts() {
    try {
        const response = await fetch('/products/');
        const products = await response.json();
        const productDropdown = document.getElementById('product-dropdown');
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Customer Search Implementation
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('customerSearch');
    searchInput.addEventListener('input', async () => {
        const searchValue = searchInput.value.trim();
        if (searchValue.length > 0) {
            try {
                const response = await fetch(`/customers/search?name=${encodeURIComponent(searchValue)}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const customers = await response.json();
                displaySearchResults(customers);
            } catch (error) {
                console.error('Error fetching customer records:', error);
            }
        } else {
            clearSearchResults();
        }
    });
});

function displaySearchResults(customers) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';  // Clear previous results
    if (customers.length === 0) {
        resultsContainer.innerHTML = '<p>No customers found.</p>';
        return;
    }
    customers.forEach(customer => {
        const customerDiv = document.createElement('div');
        customerDiv.className = 'customer-result';
        customerDiv.textContent = `${customer.name} - ${customer.email}`;
        resultsContainer.appendChild(customerDiv);
    });
}

function clearSearchResults() {
    document.getElementById('searchResults').innerHTML = '';  // Clear previous results
}
