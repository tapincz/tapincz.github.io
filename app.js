// app.js

// Data uložená v localStorage
let products = JSON.parse(localStorage.getItem('tapin_products')) || [];
let sales = JSON.parse(localStorage.getItem('tapin_sales')) || [];

const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productListEl = document.getElementById('product-list');

const saleProductsEl = document.getElementById('sale-products');
const saleTotalEl = document.getElementById('sale-total');
const completeSaleBtn = document.getElementById('complete-sale-btn');

const salesListEl = document.getElementById('sales-list');

let currentSale = {};

// --- Funkce ---

function saveData() {
  localStorage.setItem('tapin_products', JSON.stringify(products));
  localStorage.setItem('tapin_sales', JSON.stringify(sales));
}

function renderProducts() {
  productListEl.innerHTML = '';
  products.forEach((p, i) => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = p.name;
    nameSpan.classList.add('product-item-name');
    nameSpan.title = "Klikni pro přidání do prodeje";

    nameSpan.addEventListener('click', () => {
      addProductToSale(i);
    });

    const priceSpan = document.createElement('span');
    priceSpan.textContent = p.price.toFixed(2) + ' Kč';
    priceSpan.classList.add('product-item-price');

    // Upravit produkt po kliknutí pravým tlačítkem
    li.addEventListener('contextmenu', e => {
      e.preventDefault();
      editProduct(i);
    });

    li.appendChild(nameSpan);
    li.appendChild(priceSpan);
    productListEl.appendChild(li);
  });
}

function renderSale() {
  saleProductsEl.innerHTML = '';
  let total = 0;
  for (const id in currentSale) {
    const product = products[id];
    const count = currentSale[id];
    total += product.price * count;

    const span = document.createElement('span');
    span.textContent = `${product.name} x${count}`;
    span.classList.add('sale-product');
    span.title = "Klikni pro odebrání";

    span.addEventListener('click', () => {
      removeProductFromSale(id);
    });

    saleProductsEl.appendChild(span);
  }
  saleTotalEl.textContent = total.toFixed(2);
  completeSaleBtn.disabled = total === 0;
}

function renderSalesHistory() {
  salesListEl.innerHTML = '';
  sales.slice().reverse().forEach(sale => {
    const li = document.createElement('li');
    const date = new Date(sale.timestamp);
    const dateStr = date.toLocaleString();
    const items = sale.items.map(item => `${item.name} x${item.count}`).join(', ');
    li.textContent = `${dateStr}: ${items} - Celkem: ${sale.total.toFixed(2)} Kč`;
    salesListEl.appendChild(li);
  });
}

function addProductToSale(id) {
  if (!currentSale[id]) currentSale[id] = 0;
  currentSale[id]++;
  renderSale();
}

function removeProductFromSale(id) {
  if (!currentSale[id]) return;
  currentSale[id]--;
  if (currentSale[id] <= 0) delete currentSale[id];
  renderSale();
}

function editProduct(id) {
  const p = products[id];
  productNameInput.value = p.name;
  productPriceInput.value = p.price;
  productForm.dataset.editing = id;
}

productForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  if (!name || isNaN(price) || price < 0) return;

  if (productForm.dataset.editing !== undefined) {
    // Upravit existující produkt
    const id = productForm.dataset.editing;
    products[id] = { name, price };
    delete productForm.dataset.editing;
  } else {
    // Přidat nový produkt
    products.push({ name, price });
  }
  productNameInput.value = '';
  productPriceInput.value = '';
  saveData();
  renderProducts();
  renderSale();
});

completeSaleBtn.addEventListener('click', () => {
  // Uložit aktuální prodej
  const items = [];
  let total = 0;
  for (const id in currentSale) {
    const p = products[id];
    const count = currentSale[id];
    items.push({ name: p.name, count });
    total += p.price * count;
  }
  sales.push({ timestamp: Date.now(), items, total });
  currentSale = {};
  saveData();
  renderSale();
  renderSalesHistory();
});

// --- Inicializace ---

renderProducts();
renderSale();
renderSalesHistory();
