// app.js

// Načtení dat z localStorage
let products = JSON.parse(localStorage.getItem('tapin_products')) || [];
let sales = JSON.parse(localStorage.getItem('tapin_sales')) || [];

const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productPhotoInput = document.getElementById('product-photo');
const productListEl = document.getElementById('product-list');

const saleProductsEl = document.getElementById('sale-products');
const saleTotalEl = document.getElementById('sale-total');
const completeSaleBtn = document.getElementById('complete-sale-btn');

const salesListEl = document.getElementById('sales-list');
const cancelEditBtn = document.getElementById('cancel-edit');

let currentSale = {};
let editingIndex = null;

// --- Uložíme data do local
