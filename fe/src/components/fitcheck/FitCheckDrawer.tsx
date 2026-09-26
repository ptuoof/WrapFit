"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { FitCheckReport } from "@wrapfit/shared";

interface FitCheckDrawerProps {
  report: FitCheckReport;
  onAutoFix?: () => void;
}

export const FitCheckDrawer: React.FC<FitCheckDrawerProps> = ({ report, onAutoFix }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <h3 className="font-serif font-bold text-stone-900 text-base">FitCheck™ Validation</h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            report.isValidForProduction
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {report.score}/100 Điểm
        </span>
      </div>

      <div className="text-xs text-stone-600">
        {report.isValidForProduction ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Thiết kế đạt chuẩn 100% dung sai kỹ thuật, sẵn sàng xuất file in!</span>
          </div>
        ) : (
          <p>Phát hiện {report.violations.length} điểm cần lưu ý trước khi gửi file tới xưởng in:</p>
        )}
      </div>

      {report.violations.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {report.violations.map((v) => (
            <div
              key={v.id}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                v.severity === "error"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {v.severity === "error" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{v.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{v.message}</p>
              <p className="text-[11px] italic font-medium pt-1 text-stone-600">👉 {v.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {onAutoFix && !report.isValidForProduction && (
        <button
          type="button"
          onClick={onAutoFix}
          className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
        >
          Tự Động Sửa Lỗi Tràn Lề & Nếp Gấp
        </button>
      )}
    </div>
  );
};
