// ===== 1. Konfigurasi =====
const API_URL = "https://dummyjson.com/products/category/groceries?limit=100";
const USD_TO_IDR = 16000;
const SEARCH_DELAY = 400;
const FAVORITES_KEY = "stokme-favorites";
const MIN_NAME_LENGTH = 3;
const LOW_STOCK_LIMIT = 10; // BARU: stok <= 10 dianggap menipis

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
const statsContentEl = document.getElementById("stats-content"); // BARU
const productListEl = document.getElementById("product-list");
const favoriteListEl = document.getElementById("favorite-list");
const searchFormEl = document.getElementById("search-form");
const searchInputEl = document.getElementById("search-input");
const resultCountEl = document.getElementById("result-count");
const marginFormEl = document.getElementById("margin-form");
const itemNameEl = document.getElementById("item-name");
const buyPriceEl = document.getElementById("buy-price");
const sellPriceEl = document.getElementById("sell-price");
const formResultEl = document.getElementById("form-success");

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
    productListEl.setAttribute("aria-busy", "true"); // BARU
}

function hideLoading() {
    loadingEl.hidden = true;
    productListEl.setAttribute("aria-busy", "false"); // BARU
}

// BARU: pesan error yang mudah dipahami
function getErrorMessage(error) {
    if (error instanceof TypeError) {
        return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    }
    if (error.message.includes("404")) {
        return "Data tidak ditemukan di server (HTTP 404).";
    }
    if (error.message.includes("500")) {
        return "Server sedang bermasalah (HTTP 500). Coba lagi nanti.";
    }
    return error.message;
}

function showError(message) {
    errorEl.textContent = `Gagal memuat data: ${message}`;
    errorEl.hidden = false;
}

// ===== 4. Favorit dengan localStorage =====
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
let favoriteIds = loadFavorites();

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

function renderFavorites() {
    const favoriteProducts = allProducts.filter((product) => isFavorite(product.id));
    renderList(
        favoriteListEl,
        favoriteProducts,
        "Belum ada produk prioritas. Klik tombol Prioritas pada kartu produk."
    );
}

// ===== 7. Analisis data (statistik) ===== BARU
function calculateStats(products) {
    if (products.length === 0) {
        return null;
    }
    const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
    const mostExpensive = products.reduce((max, product) =>
        product.price > max.price ? product : max
    );
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStockCount = products.filter(
        (product) => product.stock <= LOW_STOCK_LIMIT
    ).length;

    return {
        averagePrice: totalPrice / products.length,
        mostExpensive,
        totalStock,
        lowStockCount
    };
}

function createStatItem(label, value) {
    const item = document.createElement("li");
    item.className = "stat-item";

    const labelEl = document.createElement("p");
    labelEl.className = "stat-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("p");
    valueEl.className = "stat-value";
    valueEl.textContent = value;

    item.append(labelEl, valueEl);
    return item;
}

function renderStats(products) {
    statsContentEl.replaceChildren();
    const stats = calculateStats(products);

    if (!stats) {
        const empty = document.createElement("li");
        empty.textContent = "Statistik belum tersedia.";
        statsContentEl.append(empty);
        return;
    }

    statsContentEl.append(
        createStatItem("Rata-rata harga", formatPrice(stats.averagePrice)),
        createStatItem(
            "Produk termahal",
            `${translateTitle(stats.mostExpensive.title)} (${formatPrice(stats.mostExpensive.price)})`
        ),
        createStatItem("Total stok", `${stats.totalStock.toLocaleString("id-ID")} unit`),
        createStatItem(
            "Stok menipis",
            `${stats.lowStockCount} produk (stok ${LOW_STOCK_LIMIT} atau kurang)`
        )
    );
}

// ===== 8. Pencarian dengan debounce =====
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

// ===== 9. Form dan validasi (Z=4) =====
function setFieldError(input, message) {
    const errorMsgEl = document.getElementById(`${input.id}-error`);
    errorMsgEl.textContent = `⚠ ${message}`;
    input.setAttribute("aria-invalid", "true");
    return false;
}

function clearFieldError(input) {
    const errorMsgEl = document.getElementById(`${input.id}-error`);
    errorMsgEl.textContent = "";
    input.removeAttribute("aria-invalid");
    return true;
}

function validateItemName() {
    const value = itemNameEl.value.trim();
    if (value === "") {
        return setFieldError(itemNameEl, "Nama barang wajib diisi.");
    }
    if (value.length < MIN_NAME_LENGTH) {
        return setFieldError(
            itemNameEl,
            `Nama barang minimal ${MIN_NAME_LENGTH} karakter.`
        );
    }
    return clearFieldError(itemNameEl);
}

function validatePrice(input, label) {
    const raw = input.value.trim();
    if (raw === "") {
        return setFieldError(input, `${label} wajib diisi dengan angka.`);
    }
    if (Number(raw) <= 0) {
        return setFieldError(input, `${label} harus lebih dari 0.`);
    }
    return clearFieldError(input);
}

function validateBuyPrice() {
    return validatePrice(buyPriceEl, "Harga beli");
}

function validateSellPrice() {
    return validatePrice(sellPriceEl, "Harga jual");
}

// Dua input yang saling berkaitan: harga jual harus lebih besar dari harga beli
function validatePricePair() {
    const buyPrice = Number(buyPriceEl.value);
    const sellPrice = Number(sellPriceEl.value);
    if (sellPrice <= buyPrice) {
        return setFieldError(
            sellPriceEl,
            "Harga jual harus lebih besar dari harga beli."
        );
    }
    return clearFieldError(sellPriceEl);
}

function checkPairIfReady() {
    const bothFilled = buyPriceEl.value.trim() !== "" && sellPriceEl.value.trim() !== "";
    if (bothFilled && validateBuyPrice() && validateSellPrice()) {
        validatePricePair();
    }
}

function showFormResult(message, isError) {
    formResultEl.textContent = message;
    formResultEl.classList.toggle("is-error", isError);
}

function calculateMargin(buyPrice, sellPrice) {
    const marginValue = sellPrice - buyPrice;
    const marginPercent = (marginValue / buyPrice) * 100;
    return { marginValue, marginPercent };
}

function handleFormSubmit(event) {
    event.preventDefault();
    showFormResult("", false);

    const nameOk = validateItemName();
    const buyOk = validateBuyPrice();
    const sellOk = validateSellPrice();
    const pairOk = buyOk && sellOk ? validatePricePair() : true;

    const checks = [
        [itemNameEl, nameOk],
        [buyPriceEl, buyOk],
        [sellPriceEl, sellOk && pairOk]
    ];
    const firstInvalid = checks.find(([, isValid]) => !isValid);
    if (firstInvalid) {
        showFormResult("Periksa kembali isian yang bertanda ⚠.", true);
        firstInvalid[0].focus();
        return;
    }

    const buyPrice = Number(buyPriceEl.value);
    const sellPrice = Number(sellPriceEl.value);
    const { marginValue, marginPercent } = calculateMargin(buyPrice, sellPrice);

    showFormResult(
        `Berhasil! Margin ${itemNameEl.value.trim()}: ` +
        `${rupiahFormatter.format(marginValue)} per unit (${marginPercent.toFixed(1)}%).`,
        false
    );
}

// ===== 10. Mengambil data dari REST API =====
async function loadData() {
    try {
        showLoading();
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // BARU: pastikan bentuk data sesuai harapan
        if (!Array.isArray(data.products)) {
            throw new Error("Format data dari server tidak sesuai.");
        }

        allProducts = data.products.filter(
            (product) => !EXCLUDED_TITLES.includes(product.title)
        );
        renderStats(allProducts); // BARU
        renderProducts(allProducts);
        renderFavorites();
        updateResultCount(allProducts.length, "");
    } catch (error) {
        showError(getErrorMessage(error)); // BARU
        renderStats([]);                   // BARU
    } finally {
        hideLoading();
    }
}

// ===== 11. Titik awal aplikasi =====
function init() {
    loadData();
    searchInputEl.addEventListener("input", debouncedSearch);
    searchFormEl.addEventListener("submit", (event) => {
        event.preventDefault();
        handleSearch();
    });
    productListEl.addEventListener("click", handleFavoriteClick);
    favoriteListEl.addEventListener("click", handleFavoriteClick);

    marginFormEl.addEventListener("submit", handleFormSubmit);
    itemNameEl.addEventListener("blur", validateItemName);
    buyPriceEl.addEventListener("blur", () => {
        validateBuyPrice();
        checkPairIfReady();
    });
    sellPriceEl.addEventListener("blur", () => {
        validateSellPrice();
        checkPairIfReady();
    });
}

document.addEventListener("DOMContentLoaded", init);