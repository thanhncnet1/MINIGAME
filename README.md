<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLB-PICKLEBALL-CMTD - Quản Lý Giải Đấu</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .excel-table th {
            background-color: #1e3a8a;
            color: white;
            text-align: center;
            font-size: 0.75rem;
            padding: 6px 4px;
            white-space: nowrap;
        }
        @media (min-width: 768px) {
            .excel-table th { font-size: 0.85rem; padding: 6px 8px; }
        }
        .excel-table td {
            padding: 4px 4px;
            font-size: 0.75rem;
            border: 1px solid #e5e7eb;
            white-space: nowrap;
        }
        @media (min-width: 768px) {
            .excel-table td { font-size: 0.85rem; padding: 4px 6px; }
        }
        .excel-table input, .excel-table select {
            width: 100%;
            padding: 2px 4px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        @media (min-width: 768px) {
            .excel-table input, .excel-table select { font-size: 0.85rem; }
        }
        /* Custom scrollbar for mobile responsiveness */
        .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
    </style>
</head>
<body class="bg-slate-100 min-h-screen flex flex-col font-sans">

    <!-- 1. BANNER TRÊN CÙNG -->
    <header class="w-full bg-slate-900 shadow-md">
        <img src="banner.jpg" alt="CLB Pickleball CMTD Banner" class="w-full h-auto max-h-[260px] object-cover mx-auto block" id="main-banner" onerror="this.src='https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80'">
    </header>

    <!-- 2. THANH TIÊU ĐỀ & THANH ĐIỀU HƯỚNG (NAVIGATION BAR) -->
    <nav class="bg-slate-800 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-14 md:h-16">
            <!-- Vị trí đặt logo trước chữ CLB-PICKLEBALL-CMTD -->
            <div class="flex items-center space-x-2 cursor-pointer" onclick="showTab('home')">
                <img src="logo1.png" alt="Logo" class="h-9 w-9 md:h-11 md:w-11 object-contain" onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/33/33736.png'">
                <span class="font-black text-sm sm:text-base md:text-xl tracking-tight text-yellow-400 whitespace-nowrap">CLB-PICKLEBALL-CMTD</span>
            </div>

            <!-- Các nút điều hướng -->
            <div class="flex items-center space-x-1 sm:space-x-2 md:space-x-4 text-xs md:text-sm font-semibold">
                <button onclick="showTab('home')" id="btn-home" class="nav-btn hover:bg-slate-700 px-2 py-1.5 md:px-3 md:py-2 rounded-lg transition flex items-center gap-1 text-yellow-400">
                    <i class="fa-solid fa-house"></i> <span class="hidden sm:inline">HOME</span>
                </button>
                <button onclick="showTab('players')" id="btn-players" class="nav-btn hover:bg-slate-700 px-2 py-1.5 md:px-3 md:py-2 rounded-lg transition flex items-center gap-1">
                    <i class="fa-solid fa-users"></i> <span class="hidden sm:inline">Pick Thủ</span>
                </button>
                <button onclick="showTab('minigame1')" id="btn-minigame1" class="nav-btn hover:bg-slate-700 px-2 py-1.5 md:px-3 md:py-2 rounded-lg transition flex items-center gap-1">
                    <i class="fa-solid fa-trophy"></i> <span>MG1</span>
                </button>
                <button onclick="showTab('minigame2')" id="btn-minigame2" class="nav-btn hover:bg-slate-700 px-2 py-1.5 md:px-3 md:py-2 rounded-lg transition flex items-center gap-1">
                    <i class="fa-solid fa-medal"></i> <span>MG2</span>
                </button>
            </div>
        </div>
    </nav>

    <!-- NỘI DUNG CHÍNH (MAIN CONTAINER) -->
    <main class="max-w-7xl mx-auto w-full p-2 sm:p-4 flex-grow">

        <!-- ================= TRANG CHỦ (HOME) ================= -->
        <section id="tab-home" class="tab-content">
            <div class="bg-white rounded-xl shadow-md p-4 sm:p-8 text-center my-4 sm:my-6">
                <div class="flex justify-center mb-4">
                    <img src="logo1.png" alt="Logo CMTD" class="h-20 sm:h-28 object-contain" onerror="this.style.display='none'">
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-800 mb-2 sm:mb-4 uppercase">CLB PICKLEBALL CMTD - "GẶP LÀ VỰT"</h2>
                <p class="text-xs sm:text-sm text-slate-600 mb-6 max-w-2xl mx-auto">Hệ thống quản lý lịch thi đấu, danh sách vận động viên và tính điểm tự động cho các Minigame nội bộ.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    <div onclick="showTab('players')" class="cursor-pointer bg-blue-50 border border-blue-200 p-5 rounded-xl hover:shadow-lg transition text-center group">
                        <i class="fa-solid fa-user-gear text-3xl sm:text-4xl text-blue-600 mb-3 group-hover:scale-110 transition-transform"></i>
                        <h3 class="font-bold text-base sm:text-lg text-slate-800">Danh Sách Pick Thủ</h3>
                        <p class="text-xs text-slate-500 mt-1">Thêm, xoá, sửa thông tin các VĐV trong CLB</p>
                    </div>
                    <div onclick="showTab('minigame1')" class="cursor-pointer bg-amber-50 border border-amber-200 p-5 rounded-xl hover:shadow-lg transition text-center group">
                        <i class="fa-solid fa-people-group text-3xl sm:text-4xl text-amber-600 mb-3 group-hover:scale-110 transition-transform"></i>
                        <h3 class="font-bold text-base sm:text-lg text-slate-800">MINIGAME 1</h3>
                        <p class="text-xs text-slate-500 mt-1">Đấu Team A vs Team B (24 trận xoay vòng & bảng tổng hợp)</p>
                    </div>
                    <div onclick="showTab('minigame2')" class="cursor-pointer bg-emerald-50 border border-emerald-200 p-5 rounded-xl hover:shadow-lg transition text-center group">
                        <i class="fa-solid fa-diagram-project text-3xl sm:text-4xl text-emerald-600 mb-3 group-hover:scale-110 transition-transform"></i>
                        <h3 class="font-bold text-base sm:text-lg text-slate-800">MINIGAME 2</h3>
                        <p class="text-xs text-slate-500 mt-1">Giải Phú Thọ Open (Chia Bảng, Bán Kết, Chung Kết)</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= DANH SÁCH PICK THỦ ================= -->
        <section id="tab-players" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div class="flex flex-wrap justify-between items-center mb-4 pb-3 border-b gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                            <i class="fa-solid fa-users text-blue-600"></i> Danh Sách Pick Thủ CLB
                        </h2>
                        <p class="text-xs text-slate-500">Quản lý danh sách thành viên tham gia giải đấu</p>
                    </div>
                    <button onclick="openPlayerModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow">
                        <i class="fa-solid fa-plus"></i> Thêm Pick Thủ
                    </button>
                </div>

                <!-- Bảng danh sách VĐV -->
                <div class="table-responsive">
                    <table class="w-full text-left border-collapse border border-slate-200 min-w-[500px]">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 text-xs sm:text-sm">
                                <th class="p-2 sm:p-3 border w-12 text-center">STT</th>
                                <th class="p-2 sm:p-3 border">Tên Pick Thủ</th>
                                <th class="p-2 sm:p-3 border w-24">Giới tính</th>
                                <th class="p-2 sm:p-3 border text-center w-36">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody id="player-table-body" class="text-xs sm:text-sm divide-y divide-slate-200">
                            <!-- JS render -->
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- ================= MINIGAME 1 ================= -->
        <section id="tab-minigame1" class="tab-content hidden">
            <!-- 1. Chia Team A & B -->
            <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 class="text-base sm:text-lg font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
                    <i class="fa-solid fa-users-rectangle text-amber-600"></i> Danh Sách Pick Thủ Chia 2 Team (A & B)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Team A -->
                    <div class="border border-blue-200 bg-blue-50/40 rounded-lg p-3 sm:p-4">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="font-bold text-sm sm:text-base text-blue-800 uppercase flex items-center gap-1.5">
                                <i class="fa-solid fa-shield-halved"></i> Team A
                            </h4>
                            <button onclick="addTeamMember('A')" class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                                <i class="fa-solid fa-plus"></i> Thêm VĐV
                            </button>
                        </div>
                        <div id="team-A-list" class="space-y-1.5">
                            <!-- JS render -->
                        </div>
                    </div>
                    <!-- Team B -->
                    <div class="border border-orange-200 bg-orange-50/40 rounded-lg p-3 sm:p-4">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="font-bold text-sm sm:text-base text-orange-800 uppercase flex items-center gap-1.5">
                                <i class="fa-solid fa-shield-halved"></i> Team B
                            </h4>
                            <button onclick="addTeamMember('B')" class="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700">
                                <i class="fa-solid fa-plus"></i> Thêm VĐV
                            </button>
                        </div>
                        <div id="team-B-list" class="space-y-1.5">
                            <!-- JS render -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Bảng Lịch Thi Đấu (Chuẩn Ảnh Mẫu 1) -->
            <div class="bg-white rounded-xl shadow-md p-3 sm:p-6 mb-4 sm:mb-6">
                <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
                    <div>
                        <h2 class="text-lg sm:text-2xl font-black text-blue-900 tracking-wide uppercase">LỊCH THI ĐẤU - <span id="m1-match-count">24</span> TRẬN</h2>
                        <p class="text-[11px] sm:text-xs italic text-slate-500">3 sân thi đấu, 8 lượt; mỗi VĐV chỉ xuất hiện tối đa 1 lần trong một lượt.</p>
                    </div>
                    <button onclick="addM1Match()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded shadow flex items-center gap-1 font-bold">
                        <i class="fa-solid fa-plus"></i> Thêm Trận
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="w-full excel-table border-collapse min-w-[900px]">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Lượt</th>
                                <th>Sân</th>
                                <th>Nội dung</th>
                                <th>Đội A - VĐV 1</th>
                                <th>Đội A - VĐV 2</th>
                                <th class="w-12">Tỷ số A</th>
                                <th>VS</th>
                                <th class="w-12">Tỷ số B</th>
                                <th>Đội B - VĐV 1</th>
                                <th>Đội B - VĐV 2</th>
                                <th>Đội thắng</th>
                                <th>Hiệu số A-B</th>
                                <th>Điểm A</th>
                                <th>Điểm B</th>
                                <th>Trạng thái</th>
                                <th>Xoá</th>
                            </tr>
                        </thead>
                        <tbody id="m1-schedule-body">
                            <!-- Rendered by JS -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. Bảng Tổng hợp Chung Minigame 1 -->
            <div class="bg-white rounded-xl shadow-md p-3 sm:p-6">
                <h3 class="text-base sm:text-lg font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
                    <i class="fa-solid fa-chart-pie text-indigo-600"></i> Bảng Tổng Hợp Chung Minigame 1
                </h3>
                <div class="table-responsive">
                    <table class="w-full text-center border-collapse border border-slate-300 min-w-[500px]">
                        <thead>
                            <tr class="bg-slate-800 text-white text-xs sm:text-sm">
                                <th class="p-2 border">Team</th>
                                <th class="p-2 border">Số Trận Đã Đánh</th>
                                <th class="p-2 border">Điểm Số</th>
                                <th class="p-2 border">Hiệu Số Tổng</th>
                                <th class="p-2 border">Trạng Thái Hiện Tại</th>
                            </tr>
                        </thead>
                        <tbody id="m1-summary-body" class="text-xs sm:text-sm font-semibold">
                            <!-- JS Render -->
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- ================= MINIGAME 2 ================= -->
        <section id="tab-minigame2" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-md p-3 sm:p-6 mb-6">
                <div class="flex flex-wrap justify-between items-center mb-4 border-b pb-3 gap-2">
                    <h2 class="text-base sm:text-xl font-bold text-slate-800 uppercase flex items-center gap-2">
                        <i class="fa-solid fa-trophy text-yellow-500"></i> Lịch Thi Đấu Giải Phú Thọ Open (Minigame 2)
                    </h2>
                    <div class="flex gap-2">
                        <button onclick="addPairM2('A')" class="bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded hover:bg-blue-700">
                            + Cặp Bảng A
                        </button>
                        <button onclick="addPairM2('B')" class="bg-orange-600 text-white text-xs px-2.5 py-1.5 rounded hover:bg-orange-700">
                            + Cặp Bảng B
                        </button>
                    </div>
                </div>

                <!-- Thiết lập Cặp VĐV cho Bảng A & B -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="border rounded-lg p-3 bg-slate-50">
                        <h4 class="font-bold text-xs sm:text-sm text-blue-800 mb-2">Cặp VĐV Bảng A</h4>
                        <div id="m2-pairs-A" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
                    </div>
                    <div class="border rounded-lg p-3 bg-slate-50">
                        <h4 class="font-bold text-xs sm:text-sm text-orange-800 mb-2">Cặp VĐV Bảng B</h4>
                        <div id="m2-pairs-B" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
                    </div>
                </div>

                <!-- Bảng Hiển thị Vòng Bảng (Ảnh Mẫu 2 Layout) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- BẢNG A -->
                    <div class="space-y-4">
                        <h3 class="font-extrabold text-blue-900 border-b-2 border-blue-900 pb-1 text-sm sm:text-base">BẢNG A</h3>
                        <!-- Bảng xếp hạng Bảng A -->
                        <div class="table-responsive">
                            <p class="text-xs font-bold text-slate-700 mb-1">Bảng Xếp Hạng Bảng A</p>
                            <table class="w-full text-xs text-center border-collapse border border-slate-300 min-w-[320px]">
                                <thead class="bg-orange-500 text-white font-bold">
                                    <tr>
                                        <th class="p-1 border w-8">A</th>
                                        <th class="p-1 border">Pickleball - Bảng A</th>
                                        <th class="p-1 border w-12">Điểm</th>
                                        <th class="p-1 border w-12">Hiệu số</th>
                                        <th class="p-1 border w-16">Đối đầu</th>
                                    </tr>
                                </thead>
                                <tbody id="m2-rank-A"></tbody>
                            </table>
                        </div>
                        <!-- Lịch thi đấu Bảng A -->
                        <div class="table-responsive">
                            <p class="text-xs font-bold text-slate-700 mb-1">Lịch Thi Đấu Bảng A</p>
                            <table class="w-full text-xs text-center border-collapse border border-slate-300 min-w-[320px]">
                                <thead class="bg-blue-600 text-white font-bold">
                                    <tr>
                                        <th class="p-1 border w-10">Trận</th>
                                        <th class="p-1 border">Đội 1</th>
                                        <th class="p-1 border w-12">KQ Đội 1</th>
                                        <th class="p-1 border w-12">KQ Đội 2</th>
                                        <th class="p-1 border">Đội 2</th>
                                    </tr>
                                </thead>
                                <tbody id="m2-schedule-A"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- BẢNG B -->
                    <div class="space-y-4">
                        <h3 class="font-extrabold text-orange-900 border-b-2 border-orange-900 pb-1 text-sm sm:text-base">BẢNG B</h3>
                        <!-- Bảng xếp hạng Bảng B -->
                        <div class="table-responsive">
                            <p class="text-xs font-bold text-slate-700 mb-1">Bảng Xếp Hạng Bảng B</p>
                            <table class="w-full text-xs text-center border-collapse border border-slate-300 min-w-[320px]">
                                <thead class="bg-orange-500 text-white font-bold">
                                    <tr>
                                        <th class="p-1 border w-8">B</th>
                                        <th class="p-1 border">Pickleball - Bảng B</th>
                                        <th class="p-1 border w-12">Điểm</th>
                                        <th class="p-1 border w-12">Hiệu số</th>
                                        <th class="p-1 border w-16">Đối đầu</th>
                                    </tr>
                                </thead>
                                <tbody id="m2-rank-B"></tbody>
                            </table>
                        </div>
                        <!-- Lịch thi đấu Bảng B -->
                        <div class="table-responsive">
                            <p class="text-xs font-bold text-slate-700 mb-1">Lịch Thi Đấu Bảng B</p>
                            <table class="w-full text-xs text-center border-collapse border border-slate-300 min-w-[320px]">
                                <thead class="bg-blue-600 text-white font-bold">
                                    <tr>
                                        <th class="p-1 border w-10">Trận</th>
                                        <th class="p-1 border">Đội 1</th>
                                        <th class="p-1 border w-12">KQ Đội 1</th>
                                        <th class="p-1 border w-12">KQ Đội 2</th>
                                        <th class="p-1 border">Đội 2</th>
                                    </tr>
                                </thead>
                                <tbody id="m2-schedule-B"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- VÒNG KNOCKOUT (BÁN KẾT, CHUNG KẾT, TRANH 3/4) -->
                <div class="max-w-2xl mx-auto space-y-4 sm:space-y-6 pt-4 border-t">
                    <h3 class="text-center font-extrabold text-slate-800 text-base sm:text-lg uppercase">VÒNG KNOCKOUT</h3>

                    <!-- BÁN KẾT -->
                    <div class="border rounded overflow-hidden">
                        <div class="bg-blue-700 text-white text-xs font-bold p-1 text-center">VÒNG BÁN KẾT</div>
                        <div class="table-responsive">
                            <table class="w-full text-xs text-center border-collapse min-w-[300px]">
                                <thead class="bg-slate-100">
                                    <tr>
                                        <th class="p-1 border">Trận</th>
                                        <th class="p-1 border">Đội 1</th>
                                        <th class="p-1 border w-24">Kết quả</th>
                                        <th class="p-1 border">Đội 2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="border p-1 font-bold">BKC1-1</td>
                                        <td id="bk1-team1-name" class="border p-1">Nhất A</td>
                                        <td class="border p-1">
                                            <div class="flex justify-center items-center gap-1">
                                                <input type="number" id="bk1-s1" class="w-8 border text-center font-bold" onchange="renderM2()">-
                                                <input type="number" id="bk1-s2" class="w-8 border text-center font-bold" onchange="renderM2()">
                                            </div>
                                        </td>
                                        <td id="bk1-team2-name" class="border p-1">Nhì B</td>
                                    </tr>
                                    <tr>
                                        <td class="border p-1 font-bold">BKC1-2</td>
                                        <td id="bk2-team1-name" class="border p-1">Nhất B</td>
                                        <td class="border p-1">
                                            <div class="flex justify-center items-center gap-1">
                                                <input type="number" id="bk2-s1" class="w-8 border text-center font-bold" onchange="renderM2()">-
                                                <input type="number" id="bk2-s2" class="w-8 border text-center font-bold" onchange="renderM2()">
                                            </div>
                                        </td>
                                        <td id="bk2-team2-name" class="border p-1">Nhì A</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- TRANH 3/4 -->
                    <div class="border rounded overflow-hidden">
                        <div class="bg-blue-700 text-white text-xs font-bold p-1 text-center">TRANH 3/4</div>
                        <div class="table-responsive">
                            <table class="w-full text-xs text-center border-collapse min-w-[300px]">
                                <tbody>
                                    <tr>
                                        <td class="border p-1 font-bold w-16">3/4</td>
                                        <td id="t3-team1-name" class="border p-1">Thua BK1</td>
                                        <td class="border p-1 w-24">
                                            <div class="flex justify-center items-center gap-1">
                                                <input type="number" id="t3-s1" class="w-8 border text-center font-bold" onchange="renderM2()">-
                                                <input type="number" id="t3-s2" class="w-8 border text-center font-bold" onchange="renderM2()">
                                            </div>
                                        </td>
                                        <td id="t3-team2-name" class="border p-1">Thua BK2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- TRANH CHUNG KẾT -->
                    <div class="border rounded overflow-hidden">
                        <div class="bg-blue-700 text-white text-xs font-bold p-1 text-center">TRANH CHUNG KẾT</div>
                        <div class="table-responsive">
                            <table class="w-full text-xs text-center border-collapse min-w-[300px]">
                                <tbody>
                                    <tr>
                                        <td class="border p-1 font-bold w-16">CK</td>
                                        <td id="ck-team1-name" class="border p-1">Thắng BK1</td>
                                        <td class="border p-1 w-24">
                                            <div class="flex justify-center items-center gap-1">
                                                <input type="number" id="ck-s1" class="w-8 border text-center font-bold" onchange="renderM2()">-
                                                <input type="number" id="ck-s2" class="w-8 border text-center font-bold" onchange="renderM2()">
                                            </div>
                                        </td>
                                        <td id="ck-team2-name" class="border p-1">Thắng BK2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- BẢNG CHUNG CUỘC -->
                    <div class="border rounded overflow-hidden bg-amber-50 border-amber-300">
                        <div class="bg-amber-600 text-white text-xs font-bold p-1 text-center">BẢNG CHUNG CUỘC MINIGAME 2</div>
                        <table class="w-full text-xs border-collapse">
                            <tbody>
                                <tr class="border-b border-amber-200">
                                    <td class="p-2 font-bold w-28 sm:w-32 flex items-center gap-1"><i class="fa-solid fa-trophy text-yellow-500"></i> Vô Địch:</td>
                                    <td id="winner-1" class="p-2 font-black text-blue-900 text-sm">---</td>
                                </tr>
                                <tr class="border-b border-amber-200">
                                    <td class="p-2 font-bold flex items-center gap-1"><i class="fa-solid fa-medal text-slate-400"></i> Hạng Nhì:</td>
                                    <td id="winner-2" class="p-2 font-bold text-slate-800">---</td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold flex items-center gap-1"><i class="fa-solid fa-award text-amber-700"></i> Hạng Ba:</td>
                                    <td id="winner-3" class="p-2 font-bold text-slate-800">---</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </section>

    </main>

    <!-- MODAL THÊM / SỬA PICK THỦ -->
    <div id="player-modal" class="fixed inset-0 bg-black/50 hidden flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6">
            <h3 id="modal-title" class="text-base sm:text-lg font-bold text-slate-800 mb-4">Thêm Pick Thủ Mới</h3>
            <input type="hidden" id="player-id">
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Họ & Tên VĐV</label>
                    <input type="text" id="player-name" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập tên VĐV...">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Giới Tính</label>
                    <select id="player-gender" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
                <button onclick="closePlayerModal()" class="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg hover:bg-slate-300">Hủy</button>
                <button onclick="savePlayer()" class="px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 font-semibold">Lưu Pick Thủ</button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT LOGIC XỬ LÝ -->
    <script>
        // DỮ LIỆU CƠ SỞ
        let players = [
            { id: 1, name: "Tiến Thọ", gender: "Nam" },
            { id: 2, name: "Châu Sĩ", gender: "Nam" },
            { id: 3, name: "Vân Đình", gender: "Nữ" },
            { id: 4, name: "Ly", gender: "Nữ" },
            { id: 5, name: "Phú Mỗ", gender: "Nam" },
            { id: 6, name: "Hà Giấy", gender: "Nam" },
            { id: 7, name: "Long Diễm", gender: "Nam" },
            { id: 8, name: "Tuấn La", gender: "Nam" },
            { id: 9, name: "Trí Đô", gender: "Nam" },
            { id: 10, name: "Thành Sóc", gender: "Nam" },
            { id: 11, name: "Quỳnh Cool", gender: "Nữ" },
            { id: 12, name: "Hải Hà", gender: "Nữ" },
            { id: 13, name: "Dũng Ngạc", gender: "Nam" },
            { id: 14, name: "Lợi Trì", gender: "Nam" },
            { id: 15, name: "Thành Đàm", gender: "Nam" },
            { id: 16, name: "Điền Chèm", gender: "Nam" },
            { id: 17, name: "Hạnh", gender: "Nữ" },
            { id: 18, name: "Minh Vương", gender: "Nam" }
        ];

        // Minigame 1: Danh sách Team A, Team B
        let m1TeamA = ["Tiến Thọ", "Châu Sĩ", "Vân Đình", "Ly", "Phú Mỗ", "Hà Giấy", "Long Diễm", "Tuấn La", "Hạnh"];
        let m1TeamB = ["Trí Đô", "Thành Sóc", "Quỳnh Cool", "Hải Hà", "Dũng Ngạc", "Lợi Trì", "Thành Đàm", "Điền Chèm", "Minh Vương"];

        // Minigame 1: 24 trận theo mẫu
        let m1Matches = [
            { id:1, luot:1, san:1, content:"Nam xoay vòng", a1:"Tiến Thọ", a2:"Châu Sĩ", scoreA:"", scoreB:"", b1:"Trí Đô", b2:"Thành Sóc" },
            { id:2, luot:1, san:2, content:"Nữ xoay vòng", a1:"Vân Đình", a2:"Ly", scoreA:"", scoreB:"", b1:"Quỳnh Cool", b2:"Hải Hà" },
            { id:3, luot:1, san:3, content:"Nam xoay vòng", a1:"Phú Mỗ", a2:"Hà Giấy", scoreA:"", scoreB:"", b1:"Dũng Ngạc", b2:"Lợi Trì" },
            { id:4, luot:2, san:1, content:"Nam xoay vòng", a1:"Long Diễm", a2:"Châu Sĩ", scoreA:"", scoreB:"", b1:"Thành Đàm", b2:"Thành Sóc" },
            { id:5, luot:2, san:2, content:"Nam-Nữ không xoay vòng", a1:"Tuấn La", a2:"Ly", scoreA:"", scoreB:"", b1:"Điền Chèm", b2:"Hải Hà" },
            { id:6, luot:2, san:3, content:"Nam-Nữ không xoay vòng", a1:"Hà Giấy", a2:"Vân Đình", scoreA:"", scoreB:"", b1:"Lợi Trì", b2:"Quỳnh Cool" },
            { id:7, luot:3, san:1, content:"Nam xoay vòng", a1:"Tiến Thọ", a2:"Hà Giấy", scoreA:"", scoreB:"", b1:"Trí Đô", b2:"Lợi Trì" },
            { id:8, luot:3, san:2, content:"Nam xoay vòng", a1:"Long Diễm", a2:"Phú Mỗ", scoreA:"", scoreB:"", b1:"Thành Đàm", b2:"Dũng Ngạc" },
            { id:9, luot:3, san:3, content:"Nữ xoay vòng", a1:"Ly", a2:"Hạnh", scoreA:"", scoreB:"", b1:"Hải Hà", b2:"Minh Vương" },
            { id:10, luot:4, san:1, content:"Nam-Nữ không xoay vòng", a1:"Châu Sĩ", a2:"Hạnh", scoreA:"", scoreB:"", b1:"Thành Sóc", b2:"Minh Vương" },
            { id:11, luot:4, san:2, content:"Nam xoay vòng", a1:"Long Diễm", a2:"Tuấn La", scoreA:"", scoreB:"", b1:"Thành Đàm", b2:"Điền Chèm" },
            { id:12, luot:4, san:3, content:"Nam xoay vòng", a1:"Tiến Thọ", a2:"Phú Mỗ", scoreA:"", scoreB:"", b1:"Trí Đô", b2:"Dũng Ngạc" },
            { id:13, luot:5, san:1, content:"Nam xoay vòng", a1:"Hà Giấy", a2:"Châu Sĩ", scoreA:"", scoreB:"", b1:"Lợi Trì", b2:"Thành Sóc" },
            { id:14, luot:5, san:2, content:"Nam-Nữ không xoay vòng", a1:"Long Diễm", a2:"Ly", scoreA:"", scoreB:"", b1:"Thành Đàm", b2:"Hải Hà" },
            { id:15, luot:5, san:3, content:"Nam xoay vòng", a1:"Tiến Thọ", a2:"Tuấn La", scoreA:"", scoreB:"", b1:"Trí Đô", b2:"Điền Chèm" },
            { id:16, luot:6, san:1, content:"Nam xoay vòng", a1:"Tiến Thọ", a2:"Long Diễm", scoreA:"", scoreB:"", b1:"Trí Đô", b2:"Thành Đàm" },
            { id:17, luot:6, san:2, content:"Nam xoay vòng", a1:"Phú Mỗ", a2:"Tuấn La", scoreA:"", scoreB:"", b1:"Dũng Ngạc", b2:"Điền Chèm" },
            { id:18, luot:6, san:3, content:"Nữ xoay vòng", a1:"Vân Đình", a2:"Hạnh", scoreA:"", scoreB:"", b1:"Quỳnh Cool", b2:"Minh Vương" },
            { id:19, luot:7, san:1, content:"Nam-Nữ không xoay vòng", a1:"Tiến Thọ", a2:"Vân Đình", scoreA:"", scoreB:"", b1:"Trí Đô", b2:"Quỳnh Cool" },
            { id:20, luot:7, san:2, content:"Nam xoay vòng", a1:"Hà Giấy", a2:"Tuấn La", scoreA:"", scoreB:"", b1:"Lợi Trì", b2:"Điền Chèm" },
            { id:21, luot:7, san:3, content:"Nam xoay vòng", a1:"Phú Mỗ", a2:"Châu Sĩ", scoreA:"", scoreB:"", b1:"Dũng Ngạc", b2:"Thành Sóc" },
            { id:22, luot:8, san:1, content:"Nam-Nữ không xoay vòng", a1:"Phú Mỗ", a2:"Hạnh", scoreA:"", scoreB:"", b1:"Dũng Ngạc", b2:"Minh Vương" },
            { id:23, luot:8, san:2, content:"Nam xoay vòng", a1:"Long Diễm", a2:"Hà Giấy", scoreA:"", scoreB:"", b1:"Thành Đàm", b2:"Lợi Trì" },
            { id:24, luot:8, san:3, content:"Nam xoay vòng", a1:"Tuấn La", a2:"Châu Sĩ", scoreA:"", scoreB:"", b1:"Điền Chèm", b2:"Thành Sóc" }
        ];

        // Minigame 2: Cặp VĐV
        let m2PairsA = [
            { code:"a", name:"Đội a" }, { code:"b", name:"Đội b" },
            { code:"c", name:"Đội c" }, { code:"d", name:"Đội d" }
        ];
        let m2PairsB = [
            { code:"e", name:"Đội e" }, { code:"f", name:"Đội f" },
            { code:"g", name:"Đội g" }, { code:"h", name:"Đội h" }
        ];

        let m2MatchesA = [];
        let m2MatchesB = [];

        // KHỞI TẠO ĐIỀU HƯỚNG TAB
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById(`tab-${tabId}`).classList.remove('hidden');

            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('text-yellow-400'));
            const activeBtn = document.getElementById(`btn-${tabId}`);
            if(activeBtn) activeBtn.classList.add('text-yellow-400');
        }

        // XỬ LÝ PLAYERS
        function renderPlayers() {
            const tbody = document.getElementById('player-table-body');
            tbody.innerHTML = '';
            players.forEach((p, index) => {
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50">
                        <td class="p-2 sm:p-3 border text-center font-bold">${index + 1}</td>
                        <td class="p-2 sm:p-3 border font-semibold text-slate-800">${p.name}</td>
                        <td class="p-2 sm:p-3 border">${p.gender}</td>
                        <td class="p-2 sm:p-3 border text-center space-x-1">
                            <button onclick="openPlayerModal(${p.id})" class="text-blue-600 hover:text-blue-800 font-semibold text-xs border border-blue-200 px-2 py-0.5 rounded bg-blue-50">
                                <i class="fa-solid fa-pen"></i> Sửa
                            </button>
                            <button onclick="deletePlayer(${p.id})" class="text-red-600 hover:text-red-800 font-semibold text-xs border border-red-200 px-2 py-0.5 rounded bg-red-50">
                                <i class="fa-solid fa-trash"></i> Xoá
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        function openPlayerModal(id = null) {
            document.getElementById('player-modal').classList.remove('hidden');
            if(id) {
                const player = players.find(p => p.id === id);
                document.getElementById('modal-title').innerText = "Sửa Thông Tin Pick Thủ";
                document.getElementById('player-id').value = player.id;
                document.getElementById('player-name').value = player.name;
                document.getElementById('player-gender').value = player.gender;
            } else {
                document.getElementById('modal-title').innerText = "Thêm Pick Thủ Mới";
                document.getElementById('player-id').value = "";
                document.getElementById('player-name').value = "";
                document.getElementById('player-gender').value = "Nam";
            }
        }

        function closePlayerModal() {
            document.getElementById('player-modal').classList.add('hidden');
        }

        function savePlayer() {
            const id = document.getElementById('player-id').value;
            const name = document.getElementById('player-name').value.trim();
            const gender = document.getElementById('player-gender').value;

            if(!name) { alert("Vui lòng nhập tên VĐV!"); return; }

            if(id) {
                const player = players.find(p => p.id == id);
                player.name = name;
                player.gender = gender;
            } else {
                players.push({ id: Date.now(), name: name, gender: gender });
            }
            closePlayerModal();
            renderPlayers();
            renderM1TeamLists();
            renderM1Schedule();
        }

        function deletePlayer(id) {
            if(confirm("Bạn có chắc chắn xoá Pick thủ này?")) {
                players = players.filter(p => p.id !== id);
                renderPlayers();
            }
        }

        // XỬ LÝ MINIGAME 1
        function renderM1TeamLists() {
            const renderList = (team, containerId) => {
                const container = document.getElementById(containerId);
                container.innerHTML = '';
                team.forEach((name, idx) => {
                    container.innerHTML += `
                        <div class="flex justify-between items-center bg-white p-1.5 sm:p-2 rounded border text-xs">
                            <span class="font-semibold">${idx + 1}. ${name}</span>
                            <div class="space-x-1">
                                <button onclick="editTeamMember('${containerId}', ${idx})" class="text-blue-600 hover:underline">Sửa</button>
                                <button onclick="removeTeamMember('${containerId}', ${idx})" class="text-red-600 hover:underline">Xoá</button>
                            </div>
                        </div>
                    `;
                });
            };
            renderList(m1TeamA, 'team-A-list');
            renderList(m1TeamB, 'team-B-list');
        }

        function addTeamMember(teamType) {
            const name = prompt(`Nhập tên VĐV mới cho Team ${teamType}:`);
            if(name) {
                if(teamType === 'A') m1TeamA.push(name);
                else m1TeamB.push(name);
                renderM1TeamLists();
            }
        }

        function editTeamMember(containerId, idx) {
            const isTeamA = containerId === 'team-A-list';
            const currentName = isTeamA ? m1TeamA[idx] : m1TeamB[idx];
            const newName = prompt("Sửa tên VĐV:", currentName);
            if(newName) {
                if(isTeamA) m1TeamA[idx] = newName;
                else m1TeamB[idx] = newName;
                renderM1TeamLists();
            }
        }

        function removeTeamMember(containerId, idx) {
            if(confirm("Xoá VĐV khỏi danh sách team?")) {
                if(containerId === 'team-A-list') m1TeamA.splice(idx, 1);
                else m1TeamB.splice(idx, 1);
                renderM1TeamLists();
            }
        }

        function renderM1Schedule() {
            const tbody = document.getElementById('m1-schedule-body');
            tbody.innerHTML = '';
            document.getElementById('m1-match-count').innerText = m1Matches.length;

            m1Matches.forEach((m, idx) => {
                let winner = "";
                let diff = "";
                let ptsA = "";
                let ptsB = "";
                let status = "Chưa đấu";

                if(m.scoreA !== "" && m.scoreB !== "") {
                    const sa = parseInt(m.scoreA);
                    const sb = parseInt(m.scoreB);
                    status = "Đã đấu";
                    diff = sa - sb;
                    if(sa > sb) { winner = "Team A"; ptsA = 1; ptsB = 0; }
                    else if(sb > sa) { winner = "Team B"; ptsA = 0; ptsB = 1; }
                    else { winner = "Hòa"; ptsA = 0.5; ptsB = 0.5; }
                }

                const optsA = m1TeamA.map(p => `<option value="${p}">${p}</option>`).join('');
                const optsB = m1TeamB.map(p => `<option value="${p}">${p}</option>`).join('');

                tbody.innerHTML += `
                    <tr>
                        <td class="font-bold text-center">${idx + 1}</td>
                        <td><input type="number" value="${m.luot}" onchange="m1Matches[${idx}].luot=this.value" class="text-center"></td>
                        <td><input type="number" value="${m.san}" onchange="m1Matches[${idx}].san=this.value" class="text-center"></td>
                        <td><input type="text" value="${m.content}" onchange="m1Matches[${idx}].content=this.value"></td>
                        <td><select onchange="m1Matches[${idx}].a1=this.value">${optsA}</select></td>
                        <td><select onchange="m1Matches[${idx}].a2=this.value">${optsA}</select></td>
                        <td><input type="number" value="${m.scoreA}" onchange="updateM1Score(${idx}, 'A', this.value)" class="text-center font-bold bg-yellow-50"></td>
                        <td class="font-bold text-center">vs</td>
                        <td><input type="number" value="${m.scoreB}" onchange="updateM1Score(${idx}, 'B', this.value)" class="text-center font-bold bg-yellow-50"></td>
                        <td><select onchange="m1Matches[${idx}].b1=this.value">${optsB}</select></td>
                        <td><select onchange="m1Matches[${idx}].b2=this.value">${optsB}</select></td>
                        <td class="font-bold text-center ${winner==='Team A'?'text-blue-600':winner==='Team B'?'text-orange-600':''}">${winner}</td>
                        <td class="text-center font-medium">${diff}</td>
                        <td class="text-center font-bold">${ptsA}</td>
                        <td class="text-center font-bold">${ptsB}</td>
                        <td class="text-center text-xs ${status==='Đã đấu'?'text-green-600 font-bold':'text-slate-400'}">${status}</td>
                        <td class="text-center">
                            <button onclick="deleteM1Match(${idx})" class="text-red-600 hover:text-red-800">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            setTimeout(() => {
                const rows = tbody.querySelectorAll('tr');
                m1Matches.forEach((m, idx) => {
                    if(rows[idx]) {
                        const selects = rows[idx].querySelectorAll('select');
                        selects[0].value = m.a1; selects[1].value = m.a2;
                        selects[2].value = m.b1; selects[3].value = m.b2;
                    }
                });
            }, 0);

            renderM1Summary();
        }

        function updateM1Score(index, team, val) {
            if(team === 'A') m1Matches[index].scoreA = val;
            if(team === 'B') m1Matches[index].scoreB = val;
            renderM1Schedule();
        }

        function addM1Match() {
            m1Matches.push({
                id: Date.now(), luot: 1, san: 1, content: "Đôi Nam/Nữ",
                a1: m1TeamA[0] || "", a2: m1TeamA[1] || "", scoreA: "", scoreB: "",
                b1: m1TeamB[0] || "", b2: m1TeamB[1] || ""
            });
            renderM1Schedule();
        }

        function deleteM1Match(index) {
            if(confirm("Xoá trận đấu này khỏi danh sách?")) {
                m1Matches.splice(index, 1);
                renderM1Schedule();
            }
        }

        function renderM1Summary() {
            let playedA = 0, playedB = 0, ptsA = 0, ptsB = 0, diffA = 0, diffB = 0;

            m1Matches.forEach(m => {
                if(m.scoreA !== "" && m.scoreB !== "") {
                    const sa = parseInt(m.scoreA);
                    const sb = parseInt(m.scoreB);
                    playedA++; playedB++;
                    diffA += (sa - sb);
                    diffB += (sb - sa);

                    if(sa > sb) ptsA += 1;
                    else if(sb > sa) ptsB += 1;
                    else { ptsA += 0.5; ptsB += 0.5; }
                }
            });

            const totalMatches = m1Matches.length;
            let statusA = "Đang hoà", statusB = "Đang hoà";

            if(playedA === totalMatches && totalMatches > 0) {
                if(ptsA > ptsB) { statusA = "Thắng chung cuộc"; statusB = "Thua chung cuộc"; }
                else if(ptsB > ptsA) { statusA = "Thua chung cuộc"; statusB = "Thắng chung cuộc"; }
                else { statusA = "Hoà chung cuộc"; statusB = "Hoà chung cuộc"; }
            } else {
                if(ptsA > ptsB) { statusA = "Tạm dẫn trước"; statusB = "Tạm thua"; }
                else if(ptsB > ptsA) { statusA = "Tạm thua"; statusB = "Tạm dẫn trước"; }
            }

            const tbody = document.getElementById('m1-summary-body');
            tbody.innerHTML = `
                <tr class="bg-blue-50">
                    <td class="p-2 border font-bold text-blue-900">TEAM A</td>
                    <td class="p-2 border">${playedA} / ${totalMatches}</td>
                    <td class="p-2 border text-blue-700 font-extrabold">${ptsA}</td>
                    <td class="p-2 border">${diffA > 0 ? '+'+diffA : diffA}</td>
                    <td class="p-2 border text-xs font-bold ${statusA.includes('Thắng')?'text-green-600':statusA.includes('Thua')?'text-red-600':'text-amber-600'}">${statusA}</td>
                </tr>
                <tr class="bg-orange-50">
                    <td class="p-2 border font-bold text-orange-900">TEAM B</td>
                    <td class="p-2 border">${playedB} / ${totalMatches}</td>
                    <td class="p-2 border text-orange-700 font-extrabold">${ptsB}</td>
                    <td class="p-2 border">${diffB > 0 ? '+'+diffB : diffB}</td>
                    <td class="p-2 border text-xs font-bold ${statusB.includes('Thắng')?'text-green-600':statusB.includes('Thua')?'text-red-600':'text-amber-600'}">${statusB}</td>
                </tr>
            `;
        }

        // XỬ LÝ MINIGAME 2
        function renderM2Pairs() {
            const renderGroup = (pairs, group, containerId) => {
                const container = document.getElementById(containerId);
                container.innerHTML = '';
                pairs.forEach((p, idx) => {
                    container.innerHTML += `
                        <div class="flex items-center gap-1.5 text-xs bg-white p-1.5 rounded border">
                            <span class="font-bold w-6 text-slate-500">${p.code.toUpperCase()}:</span>
                            <input type="text" value="${p.name}" onchange="updateM2PairName('${group}', ${idx}, this.value)" class="border p-1 rounded font-semibold flex-grow">
                            <button onclick="removePairM2('${group}', ${idx})" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-circle-xmark"></i></button>
                        </div>
                    `;
                });
            };
            renderGroup(m2PairsA, 'A', 'm2-pairs-A');
            renderGroup(m2PairsB, 'B', 'm2-pairs-B');
        }

        function updateM2PairName(group, idx, name) {
            if(group === 'A') m2PairsA[idx].name = name;
            else m2PairsB[idx].name = name;
            generateM2RoundRobin();
            renderM2();
        }

        function addPairM2(group) {
            const pairs = group === 'A' ? m2PairsA : m2PairsB;
            const code = String.fromCharCode(97 + pairs.length + (group === 'B' ? 4 : 0));
            pairs.push({ code: code, name: `Đội ${code}` });
            renderM2Pairs();
            generateM2RoundRobin();
            renderM2();
        }

        function removePairM2(group, idx) {
            const pairs = group === 'A' ? m2PairsA : m2PairsB;
            if(pairs.length <= 2) { alert("Tối thiểu phải có 2 cặp!"); return; }
            pairs.splice(idx, 1);
            renderM2Pairs();
            generateM2RoundRobin();
            renderM2();
        }

        function generateM2RoundRobin() {
            const createMatches = (pairs, existingMatches) => {
                let matches = [];
                let matchId = 1;
                for(let i = 0; i < pairs.length; i++) {
                    for(let j = i + 1; j < pairs.length; j++) {
                        const oldMatch = existingMatches.find(m => 
                            (m.team1Code === pairs[i].code && m.team2Code === pairs[j].code) ||
                            (m.team1Code === pairs[j].code && m.team2Code === pairs[i].code)
                        );
                        matches.push({
                            id: matchId++,
                            team1Code: pairs[i].code,
                            team2Code: pairs[j].code,
                            s1: oldMatch ? oldMatch.s1 : "",
                            s2: oldMatch ? oldMatch.s2 : ""
                        });
                    }
                }
                return matches;
            };

            m2MatchesA = createMatches(m2PairsA, m2MatchesA);
            m2MatchesB = createMatches(m2PairsB, m2MatchesB);
        }

        function renderM2() {
            const processTable = (pairs, matches, schedId, rankId) => {
                const schedTbody = document.getElementById(schedId);
                schedTbody.innerHTML = '';

                let stats = {};
                pairs.forEach(p => {
                    stats[p.code] = { pair: p, pts: 0, diff: 0, headToHead: {} };
                });

                matches.forEach((m, idx) => {
                    const p1 = pairs.find(p => p.code === m.team1Code);
                    const p2 = pairs.find(p => p.code === m.team2Code);

                    if(m.s1 !== "" && m.s2 !== "") {
                        const s1 = parseInt(m.s1);
                        const s2 = parseInt(m.s2);
                        const diff = s1 - s2;

                        stats[m.team1Code].diff += diff;
                        stats[m.team2Code].diff -= diff;

                        stats[m.team1Code].headToHead[m.team2Code] = diff;
                        stats[m.team2Code].headToHead[m.team1Code] = -diff;

                        if(s1 > s2) stats[m.team1Code].pts += 1;
                        else if(s2 > s1) stats[m.team2Code].pts += 1;
                    }

                    schedTbody.innerHTML += `
                        <tr>
                            <td class="border p-1 font-bold">${m.id}</td>
                            <td class="border p-1 font-semibold">${p1 ? p1.name : m.team1Code}</td>
                            <td class="border p-1"><input type="number" value="${m.s1}" onchange="matches[${idx}].s1=this.value; renderM2();" class="w-8 text-center border font-bold"></td>
                            <td class="border p-1"><input type="number" value="${m.s2}" onchange="matches[${idx}].s2=this.value; renderM2();" class="w-8 text-center border font-bold"></td>
                            <td class="border p-1 font-semibold">${p2 ? p2.name : m.team2Code}</td>
                        </tr>
                    `;
                });

                let ranked = Object.values(stats).sort((a, b) => {
                    if(b.pts !== a.pts) return b.pts - a.pts;
                    if(b.diff !== a.diff) return b.diff - a.diff;
                    if(a.headToHead[b.pair.code] !== undefined) {
                        return b.headToHead[a.pair.code] - a.headToHead[b.pair.code];
                    }
                    return 0;
                });

                const rankTbody = document.getElementById(rankId);
                rankTbody.innerHTML = '';
                ranked.forEach((item, index) => {
                    rankTbody.innerHTML += `
                        <tr class="${index < 2 ? 'bg-yellow-50 font-bold' : ''}">
                            <td class="border p-1">${index + 1}</td>
                            <td class="border p-1 text-left font-semibold">${item.pair.name}</td>
                            <td class="border p-1 font-extrabold text-blue-700">${item.pts}</td>
                            <td class="border p-1">${item.diff > 0 ? '+'+item.diff : item.diff}</td>
                            <td class="border p-1 text-slate-500 text-[10px]">-</td>
                        </tr>
                    `;
                });

                return ranked;
            };

            const rankA = processTable(m2PairsA, m2MatchesA, 'm2-schedule-A', 'm2-rank-A');
            const rankB = processTable(m2PairsB, m2MatchesB, 'm2-schedule-B', 'm2-rank-B');

            const firstA = rankA[0] ? rankA[0].pair.name : "Nhất A";
            const secondA = rankA[1] ? rankA[1].pair.name : "Nhì A";
            const firstB = rankB[0] ? rankB[0].pair.name : "Nhất B";
            const secondB = rankB[1] ? rankB[1].pair.name : "Nhì B";

            document.getElementById('bk1-team1-name').innerText = firstA;
            document.getElementById('bk1-team2-name').innerText = secondB;
            document.getElementById('bk2-team1-name').innerText = firstB;
            document.getElementById('bk2-team2-name').innerText = secondA;

            const bk1_s1 = document.getElementById('bk1-s1').value;
            const bk1_s2 = document.getElementById('bk1-s2').value;
            const bk2_s1 = document.getElementById('bk2-s1').value;
            const bk2_s2 = document.getElementById('bk2-s2').value;

            let winBK1 = "Thắng BK1", loseBK1 = "Thua BK1";
            let winBK2 = "Thắng BK2", loseBK2 = "Thua BK2";

            if(bk1_s1 !== "" && bk1_s2 !== "") {
                if(parseInt(bk1_s1) > parseInt(bk1_s2)) { winBK1 = firstA; loseBK1 = secondB; }
                else { winBK1 = secondB; loseBK1 = firstA; }
            }

            if(bk2_s1 !== "" && bk2_s2 !== "") {
                if(parseInt(bk2_s1) > parseInt(bk2_s2)) { winBK2 = firstB; loseBK2 = secondA; }
                else { winBK2 = secondA; loseBK2 = firstB; }
            }

            document.getElementById('t3-team1-name').innerText = loseBK1;
            document.getElementById('t3-team2-name').innerText = loseBK2;

            document.getElementById('ck-team1-name').innerText = winBK1;
            document.getElementById('ck-team2-name').innerText = winBK2;

            const t3_s1 = document.getElementById('t3-s1').value;
            const t3_s2 = document.getElementById('t3-s2').value;
            const ck_s1 = document.getElementById('ck-s1').value;
            const ck_s2 = document.getElementById('ck-s2').value;

            if(ck_s1 !== "" && ck_s2 !== "") {
                if(parseInt(ck_s1) > parseInt(ck_s2)) {
                    document.getElementById('winner-1').innerText = winBK1;
                    document.getElementById('winner-2').innerText = winBK2;
                } else {
                    document.getElementById('winner-1').innerText = winBK2;
                    document.getElementById('winner-2').innerText = winBK1;
                }
            }

            if(t3_s1 !== "" && t3_s2 !== "") {
                if(parseInt(t3_s1) > parseInt(t3_s2)) {
                    document.getElementById('winner-3').innerText = loseBK1;
                } else {
                    document.getElementById('winner-3').innerText = loseBK2;
                }
            }
        }

        // TỰ ĐỘNG CHẠY KHI TẢI TRANG
        window.onload = function() {
            renderPlayers();
            renderM1TeamLists();
            renderM1Schedule();
            renderM2Pairs();
            generateM2RoundRobin();
            renderM2();
        };
    </script>
</body>
</html>
