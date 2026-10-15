// ===== 1. Konfigurasi =====
const API_URL = "https://dummyjson.com/products/category/groceries?limit=100";
const USD_TO_IDR = 16000;
const SEARCH_DELAY = 400;
const FAVORITES_KEY = "stokme-favorites"; // BARU

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
});

const EXCLUDED_TITLES = [
    "Cat Food",
    "Dog Food",
    "Protein Powder",
    "Tissue Paper Box",
    "Ice Cream",
    "Soft Drinks"
];

const TITLE_LABELS = {
    "Apple": "Apel",
    "Beef Steak": "Daging Sapi",
    "Chicken Meat": "Daging Ayam",
    "Cooking Oil": "Minyak Goreng",
    "Cucumber": "Mentimun",
    "Eggs": "Telur",
    "Fish Steak": "Ikan",
    "Green Bell Pepper": "Paprika Hijau",
    "Green Chili Pepper": "Cabai Hijau",
    "Honey Jar": "Madu",
    "Juice": "Jus Buah",
    "Kiwi": "Kiwi",
    "Lemon": "Lemon",
    "Milk": "Susu",
    "Mulberry": "Murbei",
    "Nescafe Coffee": "Kopi Nescafe",
    "Potatoes": "Kentang",
    "Red Onions": "Bawang Merah",
    "Rice": "Beras",
    "Strawberry": "Stroberi",
    "Water": "Air Mineral"
};

const TAG_LABELS = {
    "fruits": "Buah",
    "meat": "Daging",
    "vegetables": "Sayuran",
    "dairy": "Susu dan Telur",
    "seafood": "Makanan Laut",
    "beverages": "Minuman",
    "grains": "Biji-bijian",
    "condiments": "Bumbu",
    "cooking essentials": "Kebutuhan Masak"
};

// ===== 2. Referensi elemen DOM (semua di luar fungsi) =====
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const productListEl = document.getElementById("product-list");
const favoriteListEl = document.getElementById("favorite-list"); // BARU
const searchFormEl = document.getElementById("search-form");
const searchInputEl = document.getElementById("search-input");
const resultCountEl = document.getElementById("result-count");

// ===== 3. Fungsi bantu tampilan =====
function translateTitle(title) {
    return TITLE_LABELS[title] ?? title;
}

function translateTag(tag) {
    return TAG_LABELS[tag] ?? tag;
}

function formatPrice(usdValue) {
    return rupiahFormatter.format(usdValue * USD_TO_IDR);
}

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

// ===== 4. Favorit dengan localStorage ===== (BARU)
function loadFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Gagal membaca favorit:", error.message);
        return [];
    }
}

function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
        console.warn("Gagal menyimpan favorit:", error.message);
    }
}

function isFavorite(id) {
    return favoriteIds.includes(id);
}

function setFavoriteButtonState(button, active) {
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "★ Prioritas" : "☆ Prioritas";
}

function syncFavoriteButtons() {
    productListEl.querySelectorAll(".favorite-btn").forEach((button) => {
        setFavoriteButtonState(button, isFavorite(Number(button.dataset.id)));
    });
}

function toggleFavorite(id) {
    if (isFavorite(id)) {
        favoriteIds = favoriteIds.filter((favoriteId) => favoriteId !== id);
    } else {
        favoriteIds = [...favoriteIds, id];
    }
    saveFavorites();
    syncFavoriteButtons();
    renderFavorites();
}

function handleFavoriteClick(event) {
    const button = event.target.closest(".favorite-btn");
    if (!button) {
        return;
    }
    toggleFavorite(Number(button.dataset.id));
}

// ===== 5. State aplikasi =====
let allProducts = [];
let favoriteIds = loadFavorites(); // BARU

// ===== 6. Render data ke DOM =====
function createProductCard(product) {
    const name = translateTitle(product.title);

    const item = document.createElement("li");
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;

    const image = document.createElement("img");
    image.src = product.thumbnail;
    image.alt = name;
    image.loading = "lazy";

    const title = document.createElement("h3");
    title.textContent = name;

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = translateTag(product.tags[0]);

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${product.rating}`;

    // BARU: tombol favorit
    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "favorite-btn";
    favoriteButton.dataset.id = product.id;
    favoriteButton.setAttribute("aria-label", `Prioritaskan ${name}`);
    setFavoriteButtonState(favoriteButton, isFavorite(product.id));

    card.append(image, title, category, price, rating, favoriteButton);
    item.append(card);
    return item;
}

function renderList(listEl, products, emptyMessage) {
    listEl.replaceChildren();

    if (products.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = emptyMessage;
        listEl.append(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach((product) => {
        fragment.append(createProductCard(product));
    });
    listEl.append(fragment);
}

function renderProducts(products) {
    renderList(productListEl, products, "Produk tidak ditemukan.");
}

function renderFavorites() { // BARU
    const favoriteProducts = allProducts.filter((product) => isFavorite(product.id));
    renderList(
        favoriteListEl,
        favoriteProducts,
        "Belum ada produk prioritas. Klik tombol Prioritas pada kartu produk."
    );
}

// ===== 7. Pencarian dengan debounce =====
function debounce(callback, delay) {
    let timerId;
    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => callback.apply(this, args), delay);
    };
}

function filterProducts(keyword) {
    const query = keyword.trim().toLowerCase();
    if (query === "") {
        return allProducts;
    }
    return allProducts.filter((product) => {
        const indonesianName = translateTitle(product.title).toLowerCase();
        const originalName = product.title.toLowerCase();
        return indonesianName.includes(query) || originalName.includes(query);
    });
}

function updateResultCount(count, keyword) {
    const query = keyword.trim();
    resultCountEl.textContent = query === ""
        ? `Menampilkan ${count} produk`
        : `Ditemukan ${count} produk untuk "${query}"`;
}

function handleSearch() {
    const results = filterProducts(searchInputEl.value);
    renderProducts(results);
    updateResultCount(results.length, searchInputEl.value);
}

const debouncedSearch = debounce(handleSearch, SEARCH_DELAY);

// ===== 8. Mengambil data dari REST API =====
async function loadData() {
    try {
        showLoading();
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        allProducts = data.products.filter(
            (product) => !EXCLUDED_TITLES.includes(product.title)
        );
        renderProducts(allProducts);
        renderFavorites(); // BARU
        updateResultCount(allProducts.length, "");
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function init() {
    loadData();
    searchInputEl.addEventListener("input", debouncedSearch);
    searchFormEl.addEventListener("submit", (event) => {
        event.preventDefault();
        handleSearch();
    });
    productListEl.addEventListener("click", handleFavoriteClick); 
    favoriteListEl.addEventListener("click", handleFavoriteClick); 
}

document.addEventListener("DOMContentLoaded", init);