// ================================================
// PANEL ADMIN - YUSSXY STORE
// Fitur Close & Open Store dengan API Vercel
// ================================================

const ADMIN_USERNAME = "YussXy";
const ADMIN_PASSWORD = "Yuss#260982";

// API Endpoints
const API_STATUS_URL = "https://backend-delta-steel-38.vercel.app/api/store-setting";

const API_TOGGLE_URL = "https://backend-delta-steel-38.vercel.app/api/store-toggle";

// ========== FUNGSI AMBIL STATUS TOKO DARI API ==========
async function fetchStoreStatus() {
    try {
        const response = await fetch(API_STATUS_URL, {
            cache: "no-store"
        });
        const data = await response.json();

        console.log("RAW STATUS:", data);

        if (!data.success) throw new Error(data.error || "API error");

        const DEFAULT_CLOSE_MESSAGE =
"Haloo, Saya close dulu ya. Ini dilakukan untuk menghindari orderan yang lama diproses. Kamu masih bisa menggunakan tools di aplikasi ini kok";

        return {
            closed: data.is_closed,
            reason: data.reason || "",
            message: data.message || DEFAULT_CLOSE_MESSAGE,
            open_time: data.open_time || "",
            title: data.title || ""
        };

    } catch (error) {
        console.error("Gagal ambil status:", error);
        return null;
    }
}

// ========== FUNGSI BUKA TOKO ==========
async function openStore() {
    const openBtn = document.getElementById("openStoreBtn");
    const closeBtn = document.getElementById("closeStoreBtn");
    const actionMessage = document.getElementById("storeActionMessage");
    
    if (!openBtn) return;
    
    openBtn.disabled = true;
    closeBtn.disabled = true;
    openBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Memproses...';
    
    actionMessage.style.display = "block";
    actionMessage.className = "store-action-message";
    actionMessage.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Mengirim permintaan...';
    
    try {
        const response = await fetch(API_TOGGLE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "open",
                reason: "normal kembali",
                open_time: ""
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            actionMessage.className = "store-action-message success";
            actionMessage.innerHTML = '<i class="ri-check-line"></i> Toko berhasil dibuka!';
            setTimeout(() => {
                actionMessage.style.display = "none";
            }, 3000);
            await displayStoreStatus();
            showToast("✅ Toko berhasil dibuka", false);
        } else {
            throw new Error(result.message || "Gagal membuka toko");
        }
    } catch (error) {
        actionMessage.className = "store-action-message error";
        actionMessage.innerHTML = '<i class="ri-alert-line"></i> Gagal membuka toko: ' + error.message;
        showToast("❌ Gagal membuka toko", true);
    }
    
    openBtn.disabled = false;
    closeBtn.disabled = false;
    openBtn.innerHTML = '<i class="ri-store-3-line"></i> Buka Toko';
}

// ========== FUNGSI TUTUP TOKO (UPDATED: kirim open_time) ==========
async function closeStore() {
    const openBtn = document.getElementById("openStoreBtn");
    const closeBtn = document.getElementById("closeStoreBtn");
    const reasonInput = document.getElementById("closeReasonInput");
    const openTimeInput = document.getElementById("openTimeInput");
    const actionMessage = document.getElementById("storeActionMessage");
    
    if (!closeBtn) return;
    
    const reason = reasonInput ? reasonInput.value.trim() : "";
    const open_time = openTimeInput ? openTimeInput.value : "";

    const defaultCloseMessage =
"Haloo, Saya close dulu ya. Ini dilakukan untuk menghindari orderan yang lama diproses. Kamu masih bisa menggunakan tools di aplikasi ini kok";
    
    openBtn.disabled = true;
    closeBtn.disabled = true;
    closeBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Memproses...';
    
    actionMessage.style.display = "block";
    actionMessage.className = "store-action-message";
    actionMessage.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Mengirim permintaan...';
    
    try {
        const response = await fetch(API_TOGGLE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "close",
                reason: reason || defaultCloseMessage,
                open_time: open_time || "Belum ditentukan"
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            actionMessage.className = "store-action-message success";
            actionMessage.innerHTML = '<i class="ri-check-line"></i> Toko berhasil ditutup!';
            setTimeout(() => {
                actionMessage.style.display = "none";
            }, 3000);
            await displayStoreStatus();
            showToast("✅ Toko berhasil ditutup", false);
        } else {
            throw new Error(result.message || "Gagal menutup toko");
        }
    } catch (error) {
        actionMessage.className = "store-action-message error";
        actionMessage.innerHTML = '<i class="ri-alert-line"></i> Gagal menutup toko: ' + error.message;
        showToast("❌ Gagal menutup toko", true);
    }
    
    openBtn.disabled = false;
    closeBtn.disabled = false;
    closeBtn.innerHTML = '<i class="ri-lock-line"></i> Tutup Toko';
}

// ========== TAMPILKAN STATUS TOKO DI DASHBOARD (UPDATED: pakai open_time dari API) ==========
async function displayStoreStatus() {
    const statusBadge = document.getElementById("storeStatusBadge");
    const estimatedTimeSpan = document.getElementById("estimatedOpenTime");
    const reasonInput = document.getElementById("closeReasonInput");
    const openTimeInput = document.getElementById("openTimeInput");
    
    if (!statusBadge) return;
    
    statusBadge.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Memuat...';
    statusBadge.className = "store-status-badge loading";
    
    const status = await fetchStoreStatus();
    
    if (status) {
        if (status.closed) {
            statusBadge.innerHTML = '<i class="ri-lock-line"></i> Toko Tutup';
            statusBadge.className = "store-status-badge closed";
            // Gunakan open_time dari API, bukan estimatedOpenHour
            estimatedTimeSpan.innerText = status.open_time || "Belum ditentukan";
            if (reasonInput) reasonInput.value = status.reason || "";
            if (openTimeInput) openTimeInput.value = status.open_time || "";
        } else {
            statusBadge.innerHTML = '<i class="ri-store-3-line"></i> Toko Buka';
            statusBadge.className = "store-status-badge open";
            estimatedTimeSpan.innerText = "-";
            if (reasonInput) reasonInput.value = "";
            if (openTimeInput) openTimeInput.value = "";
        }
    } else {
        statusBadge.innerHTML = '<i class="ri-alert-line"></i> Gagal memuat';
        statusBadge.className = "store-status-badge loading";
        estimatedTimeSpan.innerText = "Error";
    }
}

// ========== FUNGSI AMBIL DATA PRODUK & VERSI ==========
async function fetchTotalProducts() {
    try {
        const response = await fetch('../script.js');
        const scriptText = await response.text();
        const match = scriptText.match(/(?:let|const)\s+products\s*=\s*\[([\s\S]*?)\];/);
        if (match) {
            const productCount = (match[1].match(/\{\s*id\s*:/g) || []).length;
            return productCount;
        }
        return '?';
    } catch (error) {
        console.error('Gagal mengambil data produk:', error);
        return '?';
    }
}

async function fetchAppVersion() {
    try {
        const response = await fetch('../versi.js');
        const scriptText = await response.text();
        const match = scriptText.match(/APP_VERSION\s*=\s*["']([^"']+)["']/);
        if (match) {
            return match[1];
        }
        return '?';
    } catch (error) {
        console.error('Gagal mengambil versi:', error);
        return '?';
    }
}

async function loadStoreData() {
    const totalElem = document.getElementById('totalProducts');
    const versionElem = document.getElementById('appVersion');
    const lastUserElem = document.getElementById('lastUser');
    
    if (totalElem) {
        totalElem.innerHTML = '<i class="ri-loader-4-line animate-spin"></i>';
        const total = await fetchTotalProducts();
        totalElem.innerText = total;
    }
    
    if (versionElem) {
        versionElem.innerHTML = '<i class="ri-loader-4-line animate-spin"></i>';
        const version = await fetchAppVersion();
        versionElem.innerText = version;
    }
    
    const userData = localStorage.getItem('app_user');
    if (lastUserElem) {
        if (userData) {
            try {
                const u = JSON.parse(userData);
                lastUserElem.innerText = u.name + (u.isGuest ? ' (Guest)' : '');
            } catch(e) {
                lastUserElem.innerText = '-';
            }
        } else {
            lastUserElem.innerText = '-';
        }
    }
}

// ========== FUNGSI LOGIN & SESSION ==========
function isAdminLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true';
}

function setAdminLoggedIn(value) {
    if (value) {
        localStorage.setItem('admin_logged_in', 'true');
    } else {
        localStorage.removeItem('admin_logged_in');
    }
}

async function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    await loadStoreData();
    await displayStoreStatus();
}

function logout() {
    setAdminLoggedIn(false);
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

function showError(msg) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerHTML = '<i class="ri-alert-line"></i> ' + msg;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 4000);
}

function attemptLogin(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setAdminLoggedIn(true);
        showDashboard();
        return true;
    } else {
        showError("Username atau password salah!");
        return false;
    }
}

function resetCache() {
    if (confirm("⚠️ Reset cache akan menghapus keranjang, library musik, dan data pengguna. Lanjutkan?")) {
        const keysToKeep = ['admin_logged_in'];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        }
        alert("Cache telah direset.");
        window.location.reload();
    }
}

function viewUsers() {
    const appUser = localStorage.getItem('app_user');
    if (appUser) {
        try {
            const u = JSON.parse(appUser);
            alert(`User aktif: ${u.name} (${u.isGuest ? 'Guest' : 'Registered'})\nLogin: ${new Date(u.loginTime).toLocaleString()}`);
        } catch(e) {
            alert("Tidak ada data user tersimpan.");
        }
    } else {
        alert("Tidak ada data user tersimpan.");
    }
}

function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#ef4444' : '#10b981'};
        color: white;
        padding: 8px 16px;
        border-radius: 30px;
        font-size: 12px;
        z-index: 2000;
        white-space: nowrap;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', () => {
    if (isAdminLoggedIn()) {
        showDashboard();
    }

    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        attemptLogin(username, password);
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('resetCacheBtn').addEventListener('click', resetCache);
    document.getElementById('viewUsersBtn').addEventListener('click', viewUsers);
    
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadStoreData();
            await displayStoreStatus();
            showToast("Data diperbarui", false);
        });
    }
    
    const openStoreBtn = document.getElementById('openStoreBtn');
    const closeStoreBtn = document.getElementById('closeStoreBtn');
    
    if (openStoreBtn) {
        openStoreBtn.addEventListener('click', openStore);
    }
    if (closeStoreBtn) {
        closeStoreBtn.addEventListener('click', closeStore);
    }

    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const username = document.getElementById('adminUsername').value.trim();
            const password = e.target.value;
            attemptLogin(username, password);
        }
    });
});