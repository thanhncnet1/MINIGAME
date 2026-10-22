<div class="bg-white/95 rounded-xl shadow-md p-6 max-w-3xl mx-auto text-slate-800">
    <div class="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 class="text-2xl font-black text-amber-600 flex items-center gap-2">
            <i class="fa-solid fa-trophy text-amber-500"></i> TẠO GIẢI ĐẤU MINIGAME MỚI
        </h2>
        <button onclick="history.back()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold">
            <i class="fa-solid fa-arrow-left"></i> Quay lại
        </button>
    </div>

    <div class="space-y-6">
        <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Tên Giải Đấu / Minigame</label>
            <input type="text" id="new-tourney-name" placeholder="Ví dụ: Minigame Mùa Hè, Giải Giao Lưu..." class="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-semibold">
        </div>

        <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">Chọn Thể Thức Thi Đấu</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label class="border rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-emerald-50 transition border-slate-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                    <input type="radio" name="tourney-type" value="bracket" checked class="mt-1 accent-emerald-600">
                    <div>
                        <div class="font-bold text-slate-800 text-sm">MINIGAME BẢNG & VÒNG TRÒN</div>
                        <p class="text-xs text-slate-500 mt-0.5">Chia các Cặp đấu Bảng A - B, thi đấu Vòng tròn & Vòng Knockout.</p>
                    </div>
                </label>
            </div>
        </div>

        <div class="pt-4 border-t flex justify-end gap-3">
            <button onclick="showTab('home')" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg">Hủy</button>
            <button onclick="submitNewTournament()" class="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-extrabold rounded-lg shadow-md flex items-center gap-2">
                <i class="fa-solid fa-plus-circle"></i> Bắt Đầu Khởi Tạo Giải Đấu
            </button>
        </div>
    </div>
</div>
