/**
 * js/core.js - Tiện ích, xác thực Admin, quản lý Tab, Backup và Khởi chạy ứng dụng
 */
window.checkAdminPassword = function() {
    const inputPass = document.getElementById('admin-pass-input').value;
    if (inputPass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        const badge = document.getElementById('home-admin-status-badge');
        if(badge) {
            badge.innerHTML = `<i class="fa-solid fa-lock-open text-emerald-600"></i> Đã Mở Khóa Admin`;
            badge.className = "text-xs font-bold text-emerald-700 flex items-center gap-1";
        }
        alert("🔑 Xác thực Admin thành công!");
        window.refreshAllViews();
    } else {
        alert("❌ Mật khẩu Admin không đúng!");
    }
};

window.requireAdminAuth = function(actionCallback) {
    if (window.isAdminUnlocked) {
        actionCallback();
    } else {
        const pass = prompt("🔒 Vui lòng nhập mật khẩu Admin để thực hiện:");
        if (pass === window.ADMIN_PASSWORD) {
            window.isAdminUnlocked = true;
            alert("🔑 Xác thực Admin thành công!");
            actionCallback();
        } else if (pass !== null) {
            alert("❌ Mật khẩu Admin không đúng!");
        }
    }
};

window.formatVND = function(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

window.formatDate = function(dateStr) {
    if(!dateStr) return '';
    if(dateStr.includes('/')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
};

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-slate-700', 'text-yellow-400'));
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('bg-slate-700', 'text-yellow-400');

    if(tabId === 'home' && typeof renderHomeClosestDateView === 'function') renderHomeClosestDateView();
    if(tabId === 'tonghop' && typeof renderTongHopTab === 'function') renderTongHopTab();
    if(tabId === 'day_detail' && typeof renderDayDetailView === 'function') renderDayDetailView();
    if(tabId === 'fund_manager' && typeof updateFundDashboard === 'function') updateFundDashboard();
    if(tabId === 'minigame1' && typeof renderMinigameTeamTab === 'function') renderMinigameTeamTab();
    if(tabId === 'minigame2' && typeof renderDynamicMinigameDropdowns === 'function') renderDynamicMinigameDropdowns();
};

window.autoBackupData = function() {
    try {
        const backupData = {
            players: window.players,
            dates: window.dates,
            matchesData: window.matchesData,
            fundIncomes: window.fundIncomes,
            fundExpenses: window.fundExpenses
        };
        localStorage.setItem("auto_backup_minigame", JSON.stringify(backupData));
    } catch (err) { console.error("Lỗi autoBackup:", err); }
};

window.restoreAutoBackup = function(silent = false) {
    const rawData = localStorage.getItem("auto_backup_minigame");
    if (!rawData) return;
    try {
        const data = JSON.parse(rawData);
        if (data.players) window.players = data.players;
        if (data.dates) window.dates = data.dates;
        if (data.matchesData) window.matchesData = data.matchesData;
        if (data.fundIncomes) window.fundIncomes = data.fundIncomes;
        if (data.fundExpenses) window.fundExpenses = data.fundExpenses;
    } catch (err) { console.error("Lỗi restoreAutoBackup:", err); }
};

window.refreshAllViews = function() {
    if (typeof renderPlayers === 'function') renderPlayers();
    if (typeof renderMinigameTeamTab === 'function') renderMinigameTeamTab();
    if (typeof renderM2 === 'function') renderM2();
    if (typeof renderDayDetailView === 'function') renderDayDetailView();
    if (typeof renderTongHopTab === 'function') renderTongHopTab();
    if (typeof updateFundDashboard === 'function') updateFundDashboard();
    if (typeof renderHomeClosestDateView === 'function') renderHomeClosestDateView();
};

// ⚡ QUAN TRỌNG: Kích hoạt tự động khi trang tải xong
window.onload = function() {
    window.restoreAutoBackup(true);
    window.refreshAllViews();
    console.log("🚀 Ứng dụng Pickleball CMTD đã khởi chạy thành công!");
};
