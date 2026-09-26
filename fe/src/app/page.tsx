import React from "react";
import Link from "next/link";
import { Sparkles, Box, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WrapFit Platform — EXE101 FPT University</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-tight">
          Make Every Present, <span className="text-amber-700 italic">Present.</span>
        </h1>

        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Nền tảng đóng gói quà tặng thông minh & cá nhân hóa. Thiết kế chiếc hộp bao quanh món quà với bản vẽ bế 2D chuẩn xác, mô phỏng gập 3D trực quan và xuất file vector sẵn sàng in ấn thực tế.
        </p>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link
            href="/editor/demo"
            className="px-6 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition flex items-center gap-2"
          >
            <span>Mở Studio Thiết Kế</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium hover:bg-stone-100 transition"
          >
            Tìm hiểu thêm
          </a>
        </div>
      </div>
    </main>
  );
}
