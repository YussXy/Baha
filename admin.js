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



const API_BAN = "https://backend-delta-steel-38.vercel.app/api/ban";
const API_CEKBAN = "https://backend-delta-steel-38.vercel.app/api/cekban";

let mode = "";

function setMode(type) {
    mode = type;

    deviceBtn.textContent =
        type === "ban"
            ? "Ban Device"
            : type === "unban"
            ? "Unban Device"
            : "Cek Device";

    reason.style.display = type === "ban" ? "block" : "none";

    deviceResult.style.display = "none";
    deviceResult.className = "";
    deviceResult.innerHTML = "";
}

deviceBtn.onclick = async () => {
    const device_id = deviceId.value.trim();

    if (!device_id) {
        deviceResult.style.display = "block";
        deviceResult.className = "error";
        deviceResult.innerHTML = `
            <i class="ri-error-warning-line"></i>
            Masukkan Device ID terlebih dahulu
        `;
        return;
    }

    try {

        // ================= BAN =================
        if (mode === "ban") {

            const res = await fetch(API_BAN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "ban",
                    device_id,
                    reason: reason.value || "no reason"
                })
            });

            const data = await res.json();

            deviceResult.style.display = "block";
            deviceResult.className = "success";

            deviceResult.innerHTML = `
                <i class="ri-forbid-2-line"></i>
                <b>Device Berhasil Diblokir</b><br>
                ${data.message || "OK"}
            `;
        }

        // ================= UNBAN =================
        else if (mode === "unban") {

            const res = await fetch(API_BAN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "unban",
                    device_id
                })
            });

            const data = await res.json();

            deviceResult.style.display = "block";
            deviceResult.className = "success";

            deviceResult.innerHTML = `
                <i class="ri-shield-check-line"></i>
                <b>Device Berhasil Dibuka</b><br>
                ${data.message || "OK"}
            `;
        }

        // ================= CEK =================
        else if (mode === "cek") {

            const res = await fetch(
                `${API_CEKBAN}?device_id=${encodeURIComponent(device_id)}`
            );

            const data = await res.json();

            deviceResult.style.display = "block";

            if (data.banned) {

                const info = data.data?.[0];

                deviceResult.className = "error";

                deviceResult.innerHTML = `
                    <i class="ri-forbid-2-line"></i>
                    <b>Device Diblokir</b><br>
                    ID: ${device_id}<br>
                    Alasan: ${info?.reason || "-"}<br>
                    Waktu: ${info?.created_at || "-"}
                `;

            } else {

                deviceResult.className = "success";

                deviceResult.innerHTML = `
                    <i class="ri-checkbox-circle-line"></i>
                    <b>Device Tidak Diblokir</b><br>
                    ID: ${device_id}
                `;
            }
        }

    } catch (err) {

        deviceResult.style.display = "block";
        deviceResult.className = "error";

        deviceResult.innerHTML = `
            <i class="ri-error-warning-line"></i>
            Gagal konek ke server
        `;
    }
};




//💦💦💦💦💦💦💦💦


const API_BALANCE = "https://backend-delta-steel-38.vercel.app/api/balance";

async function balanceAction(action) {
    const identifier = document.getElementById("balanceDeviceId").value.trim();
    const amount = parseInt(document.getElementById("balanceAmount").value);
    const resultBox = document.getElementById("balanceResult");

    if (!identifier) {
        resultBox.innerHTML = "❌ Masukkan Device ID atau Nomor HP";
        return;
    }

    resultBox.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Memproses...';

    try {
        let device_id = null;
        let username = null;
        let phone = null;

        // Cek apakah identifier adalah device_id (16 karakter hex)
        const isDeviceId = /^[A-F0-9]{16}$/.test(identifier.toUpperCase());

        if (isDeviceId) {
            device_id = identifier.toUpperCase();
            const res = await fetch(API_BALANCE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "sb_secret_Ok9VVXILGV6zybDzN0zVpA_U5k___GF"
                },
                body: JSON.stringify({ action: "get", device_id: device_id })
            });
            const data = await res.json();
            if (data.success && data.data) {
                username = data.data.username || null;
                phone = data.data.phone || null;
            } else {
                resultBox.innerHTML = `❌ Device ID tidak ditemukan: ${identifier}`;
                return;
            }
        } else {
            // Cari berdasarkan username atau nomor HP
            const searchRes = await fetch(API_BALANCE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "sb_secret_Ok9VVXILGV6zybDzN0zVpA_U5k___GF"
                },
                body: JSON.stringify({ action: "search_user", query: identifier })
            });
            const searchData = await searchRes.json();
            if (searchData.success && searchData.data) {
                device_id = searchData.data.device_id;
                username = searchData.data.username;
                phone = searchData.data.phone;
            } else {
                resultBox.innerHTML = `❌ User tidak ditemukan: ${identifier}`;
                return;
            }
        }

        if (!device_id) {
            resultBox.innerHTML = `❌ User ${username || phone || identifier} tidak memiliki device_id`;
            return;
        }

        // CEK SALDO
        if (action === "get") {
            const res = await fetch(API_BALANCE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "sb_secret_Ok9VVXILGV6zybDzN0zVpA_U5k___GF"
                },
                body: JSON.stringify({ action: "get", device_id: device_id })
            });
            const data = await res.json();
            if (data.success) {
                resultBox.innerHTML = `
                    <div style="background: rgba(16,185,129,0.1); padding: 12px; border-radius: 12px;">
                        <b>👤 User:</b> ${username || phone || '-'}<br>
                        <b>📞 Nomor:</b> ${phone || '-'}<br>
                        <b>📱 Device ID:</b> ${device_id}<br>
                        <b>💰 Saldo:</b> <span style="color: #10b981; font-size: 16px;">Rp ${data.data.balance.toLocaleString("id-ID")}</span>
                    </div>
                `;
            } else {
                resultBox.innerHTML = `❌ ${data.message}`;
            }
            return;
        }

        // ADD / SUB
        if (!amount || amount <= 0) {
            resultBox.innerHTML = "❌ Amount tidak valid";
            return;
        }

        const res = await fetch(API_BALANCE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "sb_secret_Ok9VVXILGV6zybDzN0zVpA_U5k___GF"
            },
            body: JSON.stringify({ action: action, device_id: device_id, amount: amount })
        });

        const data = await res.json();

        if (data.success) {
            const actionText = action === "add" ? "Ditambahkan" : "Dikurangi";
            const actionColor = action === "add" ? "#10b981" : "#f59e0b";
            resultBox.innerHTML = `
                <div style="background: rgba(16,185,129,0.1); padding: 12px; border-radius: 12px;">
                    <b>✅ ${actionText}</b><br>
                    👤 User: ${username || phone || '-'}<br>
                    📞 Nomor: ${phone || '-'}<br>
                    📱 Device: ${device_id}<br>
                    💰 Jumlah: <span style="color: ${actionColor};">Rp ${amount.toLocaleString("id-ID")}</span><br>
                    💵 Sisa Saldo: <span style="color: #10b981; font-size: 15px;">Rp ${data.data.balance.toLocaleString("id-ID")}</span>
                </div>
            `;
        } else {
            resultBox.innerHTML = `❌ ${data.message}`;
        }

    } catch (err) {
        console.error("Error:", err);
        resultBox.innerHTML = "❌ Server error";
    }
}





// ================================================
// CEK ID TRANSAKSI - SCAN SEMUA DEVICE
// ================================================

async function searchTransactionById() {
    const transactionId = document.getElementById("searchTransactionId").value.trim();
    const resultDiv = document.getElementById("transactionResult");
    
    if (!transactionId) {
        resultDiv.style.display = "block";
        resultDiv.className = "transaction-result notfound";
        resultDiv.innerHTML = '<i class="ri-error-warning-line"></i> Masukkan ID Transaksi terlebih dahulu';
        return;
    }
    
    resultDiv.style.display = "block";
    resultDiv.className = "transaction-result";
    resultDiv.innerHTML = '<div class="history-loading" style="padding: 20px;"><i class="ri-loader-4-line animate-spin"></i> Mencari transaksi di semua device...</div>';
    
    try {
        // Ambil semua user dari database
        const allUsersRes = await fetch("https://backend-delta-steel-38.vercel.app/api/balance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "sb_secret_Ok9VVXILGV6zybDzN0zVpA_U5k___GF"
            },
            body: JSON.stringify({ action: "get_all_users" })
        });
        
        const allUsersData = await allUsersRes.json();
        
        if (!allUsersData.success || !allUsersData.users) {
            resultDiv.className = "transaction-result notfound";
            resultDiv.innerHTML = '<i class="ri-error-warning-line"></i> Gagal mengambil data user';
            return;
        }
        
        let foundTransaction = null;
        let foundDeviceId = null;
        let foundUser = null;
        
        // Loop ke semua user
        for (const user of allUsersData.users) {
            if (user.trx_id && Array.isArray(user.trx_id)) {
                const found = user.trx_id.find(t => t.id === transactionId);
                if (found) {
                    foundTransaction = found;
                    foundDeviceId = user.device_id;
                    foundUser = user;
                    break;
                }
            }
        }
        
        if (foundTransaction) {
            const t = foundTransaction;
            const date = new Date(t.created_at);
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            let statusClass = "success";
            let statusText = "✅ Sukses";
            if (t.status === "pending") {
                statusClass = "pending";
                statusText = "⏳ Pending";
            } else if (t.status === "failed") {
                statusClass = "failed";
                statusText = "❌ Gagal";
            }
            
            let typeIcon = "ri-shopping-bag-line";
            let typeName = "Produk";
            switch(t.type) {
                case 'apk': typeIcon = "ri-android-line"; typeName = "APK"; break;
                case 'design': typeIcon = "ri-palette-line"; typeName = "Design"; break;
                case 'reaction': typeIcon = "ri-emotion-line"; typeName = "Reaction"; break;
                case 'deposit': typeIcon = "ri-wallet-line"; typeName = "Deposit"; break;
                case 'transfer': typeIcon = "ri-bank-card-line"; typeName = "Transfer"; break;
                default: typeIcon = "ri-shopping-bag-line"; typeName = "Produk";
            }
            
            resultDiv.className = "transaction-result found";
            resultDiv.innerHTML = `
                <div class="transaction-header">
                    <i class="${typeIcon}"></i>
                    <div style="flex:1;">
                        <h4>${escapeHtml(t.product_name || "Produk Digital")}</h4>
                        <span style="font-size: 11px; color: var(--text-secondary);">${typeName} • ${t.type || '-'}</span>
                    </div>
                    <span class="history-status status-${statusClass}" style="font-size: 11px;">${statusText}</span>
                </div>
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-qr-code-line"></i> ID Transaksi</span>
                    <span class="transaction-value" style="font-family: monospace;">${escapeHtml(t.id)}</span>
                </div>
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-user-line"></i> Username</span>
                    <span class="transaction-value">${escapeHtml(foundUser?.username || '-')}</span>
                </div>
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-phone-line"></i> Nomor HP</span>
                    <span class="transaction-value">${escapeHtml(foundUser?.phone || '-')}</span>
                </div>
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-device-line"></i> Device ID</span>
                    <span class="transaction-value" style="font-family: monospace; font-size: 11px;">${escapeHtml(foundDeviceId || '-')}</span>
                </div>
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-money-dollar-circle-line"></i> Jumlah</span>
                    <span class="transaction-value" style="color: #10b981;">Rp ${(t.amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-calendar-line"></i> Tanggal</span>
                    <span class="transaction-value">${formattedDate} ${formattedTime}</span>
                </div>
                ${t.phone ? `
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-whatsapp-line"></i> Dikirim ke</span>
                    <span class="transaction-value">+${escapeHtml(t.phone)}</span>
                </div>
                ` : ''}
                ${t.target_link ? `
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-link"></i> Target Link</span>
                    <span class="transaction-value" style="word-break: break-all;">${escapeHtml(t.target_link.substring(0, 50))}${t.target_link.length > 50 ? '...' : ''}</span>
                </div>
                ` : ''}
                ${t.emoji ? `
                <div class="transaction-detail">
                    <span class="transaction-label"><i class="ri-emotion-line"></i> Emoji</span>
                    <span class="transaction-value">${escapeHtml(t.emoji)}</span>
                </div>
                ` : ''}
            `;
        } else {
            resultDiv.className = "transaction-result notfound";
            resultDiv.innerHTML = `
                <i class="ri-error-warning-line"></i> 
                Transaksi dengan ID <strong>${escapeHtml(transactionId)}</strong> tidak ditemukan
                <br><small style="display: block; margin-top: 8px;">Pastikan ID Transaksi benar</small>
            `;
        }
    } catch (error) {
        console.error("Error searching transaction:", error);
        resultDiv.className = "transaction-result notfound";
        resultDiv.innerHTML = '<i class="ri-error-warning-line"></i> Gagal mencari transaksi. Coba lagi nanti.';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Event listener untuk tombol cari transaksi
const searchBtn = document.getElementById('searchTransactionBtn');
if (searchBtn) {
    const newSearchBtn = searchBtn.cloneNode(true);
    searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
    newSearchBtn.addEventListener('click', searchTransactionById);
}

// Enter key support
const searchInput = document.getElementById('searchTransactionId');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchTransactionById();
        }
    });
            }
