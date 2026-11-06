/**
 * js/core.js - Tiện ích, xác thực Admin, quản lý Tab và Backup
 */
function checkAdminPassword() {
    const inputPass = document.getElementById('admin-pass-input').value;
    if (inputPass === window.ADMIN_PASSWORD) {
        window.isAdminUnlocked = true;
        alert("🔑 Xác thực Admin thành công!");
        refreshAllViews();
    } else {
        alert("❌ Mật khẩu Admin không đúng!");
    }
}

function requireAdminAuth(actionCallback) {
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
}

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr) {
    if(!dateStr) return '';
    if(dateStr.includes('/')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-slate-700', 'text-yellow-400'));
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('bg-slate-700', 'text-yellow-400');

    if(tabId === 'home') renderHomeClosestDateView();
    if(tabId === 'tonghop') renderTongHopTab();
    if(tabId === 'day_detail') renderDayDetailView();
    if(tabId === 'fund_manager') updateFundDashboard();
    if(tabId === 'minigame1') renderMinigameTeamTab();
    if(tabId === 'minigame2') renderDynamicMinigameDropdowns();
}

function toggleMenu(menuId, e) {
    e.stopPropagation();
    const targetMenu = document.getElementById(menuId);
    const isAlreadyShow = targetMenu.classList.contains("show");
    closeAllDropdowns();
    if (!isAlreadyShow) targetMenu.classList.add("show");
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
}

function autoBackupData() {
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
}

function refreshAllViews() {
    if (typeof renderPlayers === 'function') renderPlayers();
    if (typeof renderMinigameTeamTab === 'function') renderMinigameTeamTab();
    if (typeof renderM2 === 'function') renderM2();
    if (typeof renderDayDetailView === 'function') renderDayDetailView();
    if (typeof renderTongHopTab === 'function') renderTongHopTab();
    if (typeof updateFundDashboard === 'function') updateFundDashboard();
    if (typeof renderHomeClosestDateView === 'function') renderHomeClosestDateView();
}
