const API_URL = "https://dummyjson.com/products?limit=100";

let allProducts = [];

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

function showLoading() {
    loadingEl.hidden = false;
    errorEl.hidden = true;
}

function hideLoading() {
    loadingEl.hidden = true;
}

function showError(message) {
    errorEl.textContent = `Gagal memuat data: ${message}`;
    errorEl.hidden = false;
}

async function loadData() {
    try {
        showLoading();
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        allProducts = data.products;
        console.log("Jumlah produk:", allProducts.length);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function init() {
    loadData();
}

document.addEventListener("DOMContentLoaded", init);