// ===== 1. Konfigurasi =====
const API_URL = "https://dummyjson.com/products/category/groceries?limit=100";
const USD_TO_IDR = 16000;

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

let allProducts = [];

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const productListEl = document.getElementById("product-list");

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

    card.append(image, title, category, price, rating);
    item.append(card);
    return item;
}

function renderProducts(products) {
    productListEl.replaceChildren();

    if (products.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Produk tidak ditemukan.";
        productListEl.append(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach((product) => {
        fragment.append(createProductCard(product));
    });
    productListEl.append(fragment);
}

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