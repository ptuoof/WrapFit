"use client";
import React, { useState } from 'react';
import { GoiMascot } from '@/components/common/GoiMascot';

export default function Page() {
  const [activeCover, setActiveCover] = useState(0);
  const [pipelineStep, setPipelineStep] = useState(3);

  return (
    <>
      
<header className="fixed top-0 left-0 right-0 z-50 pointer-events-none"><div className="max-w-7xl mx-auto px-gutter py-6 flex items-center justify-between pointer-events-auto"><div className="flex items-center gap-3 cursor-pointer"><div className="w-9 h-9 rounded-lg border-2 border-[#152e22] bg-[#1a382b] flex items-center justify-center text-white shadow-xs"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" x2="12" y1="22.08" y2="12" /></svg></div><span className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tight text-[#152e22]">WrapFit</span></div><div className="flex items-center gap-8"><nav className="hidden md:flex items-center gap-7"><a className="text-sm font-medium text-[#2d3a33] hover:text-[#152e22] transition-colors" href="#thu-vien-mau">How it works</a><a className="text-sm font-medium text-[#2d3a33] hover:text-[#152e22] transition-colors" href="#pipeline">Studio</a></nav><a className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#133020] text-white text-sm font-medium hover:bg-[#1c422d] transition-all shadow-sm active:scale-95" href="#pipeline"><span className="">Start a box</span><span className="material-symbols-outlined text-base">arrow_forward</span></a></div></div></header>
<main className="w-full pt-24 bg-surface min-h-screen"><div className="flex flex-col w-full">
{/*  HERO SECTION  */}
<section className="relative w-full max-w-7xl mx-auto px-gutter pt-space-lg pb-space-xl overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center" style={{"backgroundColor":"rgb(255, 248, 245)","backgroundImage":"url(\"https://lh3.googleusercontent.com/aida/AEtjO1X2Cm_ujP0UdEarmxsBpmrld8nLuSsOqZoodco6iWxp3QkLQMNohbvtMqxgZa6y_dyg22gBHKhNuIx2P81ofNTzWVPn3PkAS9NjcgKwB-UZe59FwFSKWmAeC20HXZCO5sZDJZ79WycgcanWT8bCcoVlgvJqZJKqUPKOUEJerOIIB53CmLlm42QaUT-uTKCm53iZ42Ut6YgKEleshKf3OBFPxmB0YyDxrITNBu1qSEb56ShuS4ZDSAHzDA7f\")","backgroundRepeat":"no-repeat","backgroundPosition":"right 0% center","backgroundSize":"contain"}}><div className="absolute inset-0 pointer-events-none overflow-hidden -z-0"><div className="absolute -top-24 -right-16 w-[560px] h-[560px] rounded-full filter blur-[120px] opacity-40 mix-blend-multiply" style={{"background":"radial-gradient(circle, rgba(254, 215, 170, 0.6) 0%, rgba(251, 191, 36, 0.15) 50%, transparent 75%)"}}></div><div className="absolute top-20 left-[-10%] w-[520px] h-[520px] rounded-full filter blur-[130px] opacity-35" style={{"background":"radial-gradient(circle, rgba(202, 234, 217, 0.55) 0%, rgba(72, 100, 88, 0.1) 60%, transparent 80%)"}}></div><div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[360px] rounded-full filter blur-[140px] opacity-30" style={{"background":"radial-gradient(circle, rgba(255, 237, 213, 0.7) 0%, rgba(245, 239, 228, 0) 70%)"}}></div></div><div className="relative z-10 w-full py-8 lg:py-16"><div className="flex flex-col lg:flex-row items-center justify-between"><div className="max-w-xl flex flex-col items-start max-w-lg"><h1 className="font-headline-lg text-[48px] sm:text-[58px] lg:text-[66px] leading-[1.08] text-[#122e20] tracking-tight font-medium mb-6 font-['Playfair_Display']">A better fit<br />for every<br />thoughtful<br />gift.</h1><p className="font-body-lg text-[17px] text-[#485950] max-w-lg mb-10 leading-relaxed font-['Plus_Jakarta_Sans']">WrapFit turns one little object into a considered unboxing moment. Enter the gift, choose a structure, then watch every fold find its place.</p><div className="flex flex-wrap items-center gap-4 pt-1"><a className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#133020] text-white text-sm font-medium hover:bg-[#1c422d] transition-all shadow-sm active:scale-95 group" href="#pipeline"><span className="">Khám phá 3D Studio</span><span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5">arrow_forward</span></a><a className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#152e22] text-sm font-medium border border-[#e3ded6] shadow-xs transition-all active:scale-95" href="#thu-vien-mau"><span className="material-symbols-outlined text-base text-[#486458]">grid_view</span><span className="">Xem thư viện mẫu dieline</span></a></div></div><div className="hidden lg:flex items-center justify-center relative"><GoiMascot pose="waving" size={240} className="mr-20" /></div></div></div><div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{"background":"linear-gradient(to bottom, transparent 20%, #fff8f5 100%)"}}></div></section>
{/*  RE-ENGINEERED 360° CONTINUOUS CIRCULAR 3D CAROUSEL SECTION  */}
<section className="w-full max-w-7xl mx-auto px-gutter pt-8 pb-14 overflow-hidden relative" id="thu-vien-mau"><div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[520px] rounded-full filter blur-[135px] opacity-40 mix-blend-multiply" style={{"background":"radial-gradient(circle, rgba(202, 234, 217, 0.45) 0%, rgba(238, 244, 241, 0.25) 45%, transparent 70%)"}}></div><div className="absolute -bottom-20 right-[-5%] w-[460px] h-[460px] rounded-full filter blur-[120px] opacity-35" style={{"background":"radial-gradient(circle, rgba(245, 230, 202, 0.5) 0%, rgba(254, 243, 199, 0.1) 50%, transparent 75%)"}}></div></div>
{/*  Minimalist Title Header  */}
<div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
<div>
<div className="flex items-center gap-2 mb-1.5">
<span className="inline-block w-2 h-2 rounded-full bg-[#133020]"></span>
<span className="font-cad-spec-micro text-cad-spec-micro uppercase tracking-widest text-[#4d6657] font-semibold">INTERACTIVE 3D STACKED DECK</span>
</div>
<h2 className="font-headline-lg text-[32px] md:text-[40px] text-[#122e20] font-['Playfair_Display'] font-medium tracking-tight">
  Thư Viện Cấu Trúc Mẫu
</h2>
<p className="font-body-md text-sm md:text-base text-[#485950] mt-1 font-['Plus_Jakarta_Sans']">
  Khám phá các kết cấu hộp chuẩn công nghiệp trong không gian 3D xếp lớp vô tận.
</p>
</div>
{/*  Apple-style Navigation Controls  */}
<div className="flex items-center gap-3 self-end md:self-auto">
<button aria-label="Previous Slide" onClick={() => setActiveCover(prev => Math.max(0, prev - 1))} className="w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-[#ded7cb] text-[#152e22] shadow-xs backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-90">
<span className="material-symbols-outlined text-xl">arrow_back</span>
</button>
<button aria-label="Next Slide" onClick={() => setActiveCover(prev => Math.min(4, prev + 1))} className="w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-[#ded7cb] text-[#152e22] shadow-xs backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-90">
<span className="material-symbols-outlined text-xl">arrow_forward</span>
</button>
</div>
</div>
{/*  Continuous Circular Carousel Stage  */}
<div className="relative w-full py-2 select-none">
<div className="relative w-full h-[500px] md:h-[530px] flex items-center justify-center overflow-visible" id="coverflowContainer">
{/*  Card 0: Hộp Nam Châm Nắp Gập  */}
<div className="coverflow-card absolute top-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center" data-index="0" onClick={() => setActiveCover(0)} style={{
    willChange: 'transform, opacity, filter',
    transition: 'all 0.65s cubic-bezier(0.25, 1, 0.35, 1)',
    transform: activeCover === 0 ? 'translate(-50%, -50%) scale(1.05)' : (activeCover < 0 ? 'translate(calc(-50% + ' + ((0 - activeCover) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (0 - activeCover)*0.15) + ')' : 'translate(calc(-50% - ' + ((activeCover - 0) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (activeCover - 0)*0.15) + ')'),
    left: '50%',
    zIndex: activeCover === 0 ? 35 : 25 - Math.abs(activeCover - 0) * 10,
    opacity: activeCover === 0 ? 1 : Math.max(0.3, 1 - Math.abs(activeCover - 0) * 0.25),
    filter: activeCover === 0 ? 'blur(0px)' : 'blur(' + (Math.abs(activeCover - 0) * 1.5) + 'px)',
    pointerEvents: 'auto'
  }}>
<div className="coverflow-box w-[290px] sm:w-[380px] md:w-[460px] rounded-[30px] border border-[#e3d7c5] p-5 sm:p-6 md:p-7 flex flex-col items-center justify-between transition-all duration-500 border-[#cfc4b0] shadow-md shadow-2xl bg-white/95">
<div className="w-full aspect-[16/10] rounded-[22px] bg-[#fbf9f5]/85 flex items-center justify-center p-3 overflow-hidden shadow-inner">
<img alt="Hộp Nam Châm Nắp Gập" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2zKm10lZA5_uLx_XiKNiDdyCMqwBqAr0jyQUcyg6tebSpZJVIrZ8gavZi33lsz0hzmpyiU8WDJl4IAOeySEiAJjjnVaaz3QTNPhOuKP4nZHJtfwhMWlx9IMsRKKGuxovEaWPX-35mP5x3tozWyVOLhu10LTo-PF6diJwTSW6L15XpwxXjz5frM9_yt0VS8uV9JcILni4Mc235pxwtkAgI72LdG1e1P6pBZsO7i4ujn22m0YCZG_PQbA" />
</div>
<div className="card-caption w-full pt-4 flex flex-col items-center">
<h3 className="font-headline-sm text-base sm:text-lg md:text-xl text-[#122e20] font-semibold text-center font-['Playfair_Display']">Hộp Nam Châm Nắp Gập</h3>
<div className="card-details mt-2.5 flex flex-wrap items-center justify-center gap-2 transition-all duration-300" style={{"maxHeight":"80px","opacity":"1","transform":"translateY(0px)","pointerEvents":"auto"}}>
<span className="px-3.5 py-1 rounded-full bg-white/90 border border-[#ded5c5] font-cad-dimension text-xs text-[#133020] shadow-xs">Ứng dụng: Trang sức &amp; Quà tặng Luxury</span>
<span className="px-3 py-1 rounded-full bg-[#caead9]/60 text-[#133020] font-cad-dimension text-[11px] font-medium">Ivory 350gsm + Ép kim</span>
</div>
</div>
</div>
</div>
{/*  Card 1: Hộp Cài Đáy Khóa  */}
<div className="coverflow-card absolute top-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center" data-index="1" onClick={() => setActiveCover(1)} style={{
    willChange: 'transform, opacity, filter',
    transition: 'all 0.65s cubic-bezier(0.25, 1, 0.35, 1)',
    transform: activeCover === 1 ? 'translate(-50%, -50%) scale(1.05)' : (activeCover < 1 ? 'translate(calc(-50% + ' + ((1 - activeCover) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (1 - activeCover)*0.15) + ')' : 'translate(calc(-50% - ' + ((activeCover - 1) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (activeCover - 1)*0.15) + ')'),
    left: '50%',
    zIndex: activeCover === 1 ? 35 : 25 - Math.abs(activeCover - 1) * 10,
    opacity: activeCover === 1 ? 1 : Math.max(0.3, 1 - Math.abs(activeCover - 1) * 0.25),
    filter: activeCover === 1 ? 'blur(0px)' : 'blur(' + (Math.abs(activeCover - 1) * 1.5) + 'px)',
    pointerEvents: 'auto'
  }}>
<div className="coverflow-box w-[290px] sm:w-[380px] md:w-[460px] rounded-[30px] border border-[#e3d7c5] p-5 sm:p-6 md:p-7 flex flex-col items-center justify-between transition-all duration-500 shadow-md border-[#cfc4b0] bg-gradient-to-b from-[#f7f2ea]/90 to-[#ede3d3]/80">
<div className="w-full aspect-[16/10] rounded-[22px] bg-[#fbf9f5]/85 flex items-center justify-center p-3 overflow-hidden shadow-inner">
<img alt="Hộp Cài Đáy Khóa" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy16QC5UUOnGHZaX6PILgkjlAIJqc2uh0eqEW4QD6MFKx5IgjK1eiYpFcDthcUJgG09wUUnO3J5VHX8gnIrg5JmbibLPygbNvIBYc7BwOgxhMChbqlGwmxfBd4-RrT-8qoQ_OKGKFEBSPt15j5GsbfoVwMl2a3qOms99r-AbOg-573gTnRSj7qAxInsZSlkxo1vunE8aqtJRt1EDbjYK5hGvzFslXxGt9wvn6vrBp5VVR8Zt0oToxetg" />
</div>
<div className="card-caption w-full pt-4 flex flex-col items-center">
<h3 className="font-headline-sm text-base sm:text-lg md:text-xl text-[#122e20] font-semibold text-center font-['Playfair_Display']">Hộp Cài Đáy Khóa</h3>
<div className="card-details mt-2.5 flex flex-wrap items-center justify-center gap-2 transition-all duration-300" style={{"maxHeight":"0px","opacity":"0","transform":"translateY(6px)","pointerEvents":"none"}}>
<span className="px-3.5 py-1 rounded-full bg-white/90 border border-[#ded5c5] font-cad-dimension text-xs text-[#133020] shadow-xs">Ứng dụng: Mỹ phẩm &amp; Chai tinh chất</span>
<span className="px-3 py-1 rounded-full bg-[#caead9]/60 text-[#133020] font-cad-dimension text-[11px] font-medium">Giấy Kraft / Duplex 300gsm</span>
</div>
</div>
</div>
</div>
{/*  Card 2: Túi Kraft Doypack  */}
<div className="coverflow-card absolute top-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center" data-index="2" onClick={() => setActiveCover(2)} style={{
    willChange: 'transform, opacity, filter',
    transition: 'all 0.65s cubic-bezier(0.25, 1, 0.35, 1)',
    transform: activeCover === 2 ? 'translate(-50%, -50%) scale(1.05)' : (activeCover < 2 ? 'translate(calc(-50% + ' + ((2 - activeCover) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (2 - activeCover)*0.15) + ')' : 'translate(calc(-50% - ' + ((activeCover - 2) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (activeCover - 2)*0.15) + ')'),
    left: '50%',
    zIndex: activeCover === 2 ? 35 : 25 - Math.abs(activeCover - 2) * 10,
    opacity: activeCover === 2 ? 1 : Math.max(0.3, 1 - Math.abs(activeCover - 2) * 0.25),
    filter: activeCover === 2 ? 'blur(0px)' : 'blur(' + (Math.abs(activeCover - 2) * 1.5) + 'px)',
    pointerEvents: 'auto'
  }}>
<div className="coverflow-box w-[290px] sm:w-[380px] md:w-[460px] rounded-[30px] border border-[#e3d7c5] p-5 sm:p-6 md:p-7 flex flex-col items-center justify-between transition-all duration-500 shadow-md border-[#cfc4b0] shadow-xs bg-gradient-to-b from-[#f7f2ea]/90 to-[#ede3d3]/80">
<div className="w-full aspect-[16/10] rounded-[22px] bg-[#fbf9f5]/85 flex items-center justify-center p-3 overflow-hidden shadow-inner">
<img alt="Túi Kraft Doypack" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeDih3Kv05iOmH3UmFllzTASy6mCuhpML5nSPIJNUQTBGpWaXDc5itsd9Fpwm6WRNSIFYTBNacVqFUTRTcPwdWshWLNtVgpaP1YSbDpS_bLPgHdp-L6xZe-yYlADodxg9StnvNgSRVup4t2oJyVK-TJwJMaqL_f36N9ooeUgQ84nPqkgxiRO5vut8xHH0aq99s3dI6vBI1Uc9nliHN9UHatOpxrwTtmwhHf831XQIBqIiYLcwDUQ77Wg" />
</div>
<div className="card-caption w-full pt-4 flex flex-col items-center">
<h3 className="font-headline-sm text-base sm:text-lg md:text-xl text-[#122e20] font-semibold text-center font-['Playfair_Display']">Túi Kraft Doypack Đáy Đứng</h3>
<div className="card-details mt-2.5 flex flex-wrap items-center justify-center gap-2 transition-all duration-300" style={{"maxHeight":"0px","opacity":"0","transform":"translateY(6px)","pointerEvents":"none"}}>
<span className="px-3.5 py-1 rounded-full bg-white/90 border border-[#ded5c5] font-cad-dimension text-xs text-[#133020] shadow-xs">Ứng dụng: Cà phê specialty &amp; Hạt sấy</span>
<span className="px-3 py-1 rounded-full bg-[#caead9]/60 text-[#133020] font-cad-dimension text-[11px] font-medium">Màng ghép phức hợp + Van khí</span>
</div>
</div>
</div>
</div>
{/*  Card 3: Hộp Gối Uốn Mỹ Thuật  */}
<div className="coverflow-card absolute top-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center" data-index="3" onClick={() => setActiveCover(3)} style={{
    willChange: 'transform, opacity, filter',
    transition: 'all 0.65s cubic-bezier(0.25, 1, 0.35, 1)',
    transform: activeCover === 3 ? 'translate(-50%, -50%) scale(1.05)' : (activeCover < 3 ? 'translate(calc(-50% + ' + ((3 - activeCover) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (3 - activeCover)*0.15) + ')' : 'translate(calc(-50% - ' + ((activeCover - 3) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (activeCover - 3)*0.15) + ')'),
    left: '50%',
    zIndex: activeCover === 3 ? 35 : 25 - Math.abs(activeCover - 3) * 10,
    opacity: activeCover === 3 ? 1 : Math.max(0.3, 1 - Math.abs(activeCover - 3) * 0.25),
    filter: activeCover === 3 ? 'blur(0px)' : 'blur(' + (Math.abs(activeCover - 3) * 1.5) + 'px)',
    pointerEvents: 'auto'
  }}>
<div className="coverflow-box w-[290px] sm:w-[380px] md:w-[460px] rounded-[30px] border border-[#e3d7c5] p-5 sm:p-6 md:p-7 flex flex-col items-center justify-between transition-all duration-500 shadow-md border-[#cfc4b0] bg-gradient-to-b from-[#f7f2ea]/90 to-[#ede3d3]/80 shadow-xs">
<div className="w-full aspect-[16/10] rounded-[22px] bg-[#fbf9f5]/85 flex items-center justify-center p-3 overflow-hidden shadow-inner">
<img alt="Hộp Gối Uốn Mỹ Thuật" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPvp8dvLTHkSlJZOjnxFBsmkLsp2I-4WavB8GnWYReakxzXHve6yoSunol_OGKcKNnSBYsm8DQdDQy1mMDPoMgLWBjxWGqqx_SpZNnOpIdRDenDPhj2kiHHaX3JbH_ukVueiz7IKaGKco3zi8ZOeYQTEv7iR1t7JCMLZk_-cwNWnoXB9EgkkkSFEN6YLG2TB9hJJGGbyGwyQcJK5myX4chVVfJ2JB8AYucY0Yds0SehKHMRMPnDSsG1w" />
</div>
<div className="card-caption w-full pt-4 flex flex-col items-center">
<h3 className="font-headline-sm text-base sm:text-lg md:text-xl text-[#122e20] font-semibold text-center font-['Playfair_Display']">Hộp Gối Uốn Mỹ Thuật</h3>
<div className="card-details mt-2.5 flex flex-wrap items-center justify-center gap-2 transition-all duration-300" style={{"maxHeight":"0px","opacity":"0","transform":"translateY(6px)","pointerEvents":"none"}}>
<span className="px-3.5 py-1 rounded-full bg-white/90 border border-[#ded5c5] font-cad-dimension text-xs text-[#133020] shadow-xs">Ứng dụng: Phụ kiện thời trang &amp; Khăn lụa</span>
<span className="px-3 py-1 rounded-full bg-[#caead9]/60 text-[#133020] font-cad-dimension text-[11px] font-medium">Mỹ thuật dập chìm gân giấy</span>
</div>
</div>
</div>
</div>
{/*  Card 4: Hộp Nắp Trượt Khay Rút (Additional item for complete continuous ring)  */}
<div className="coverflow-card absolute top-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center" data-index="4" onClick={() => setActiveCover(4)} style={{
    willChange: 'transform, opacity, filter',
    transition: 'all 0.65s cubic-bezier(0.25, 1, 0.35, 1)',
    transform: activeCover === 4 ? 'translate(-50%, -50%) scale(1.05)' : (activeCover < 4 ? 'translate(calc(-50% + ' + ((4 - activeCover) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (4 - activeCover)*0.15) + ')' : 'translate(calc(-50% - ' + ((activeCover - 4) * 310) + 'px), -50%) scale(' + Math.max(0.7, 1.05 - (activeCover - 4)*0.15) + ')'),
    left: '50%',
    zIndex: activeCover === 4 ? 35 : 25 - Math.abs(activeCover - 4) * 10,
    opacity: activeCover === 4 ? 1 : Math.max(0.3, 1 - Math.abs(activeCover - 4) * 0.25),
    filter: activeCover === 4 ? 'blur(0px)' : 'blur(' + (Math.abs(activeCover - 4) * 1.5) + 'px)',
    pointerEvents: 'auto'
  }}>
<div className="coverflow-box w-[290px] sm:w-[380px] md:w-[460px] rounded-[30px] border border-[#e3d7c5] p-5 sm:p-6 md:p-7 flex flex-col items-center justify-between transition-all duration-500 shadow-md border-[#cfc4b0] bg-gradient-to-b from-[#f7f2ea]/90 to-[#ede3d3]/80 shadow-xs">
<div className="w-full aspect-[16/10] rounded-[22px] bg-[#fbf9f5]/85 flex items-center justify-center p-3 overflow-hidden shadow-inner">
<img alt="Hộp Nắp Trượt Khay Rút" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy16QC5UUOnGHZaX6PILgkjlAIJqc2uh0eqEW4QD6MFKx5IgjK1eiYpFcDthcUJgG09wUUnO3J5VHX8gnIrg5JmbibLPygbNvIBYc7BwOgxhMChbqlGwmxfBd4-RrT-8qoQ_OKGKFEBSPt15j5GsbfoVwMl2a3qOms99r-AbOg-573gTnRSj7qAxInsZSlkxo1vunE8aqtJRt1EDbjYK5hGvzFslXxGt9wvn6vrBp5VVR8Zt0oToxetg" />
</div>
<div className="card-caption w-full pt-4 flex flex-col items-center">
<h3 className="font-headline-sm text-base sm:text-lg md:text-xl text-[#122e20] font-semibold text-center font-['Playfair_Display']">Hộp Nắp Trượt Khay Rút</h3>
<div className="card-details mt-2.5 flex flex-wrap items-center justify-center gap-2 transition-all duration-300" style={{"maxHeight":"0px","opacity":"0","transform":"translateY(6px)","pointerEvents":"none"}}>
<span className="px-3.5 py-1 rounded-full bg-white/90 border border-[#ded5c5] font-cad-dimension text-xs text-[#133020] shadow-xs">Ứng dụng: Thiết bị công nghệ &amp; Quà tặng</span>
<span className="px-3 py-1 rounded-full bg-[#caead9]/60 text-[#133020] font-cad-dimension text-[11px] font-medium">Carton cứng bồi C150 cán mờ</span>
</div>
</div>
</div>
</div>
</div>
{/*  Apple-style Minimal Pagination Dots  */}
<div className="flex items-center justify-center gap-2 mt-6" id="coverflowDots">
  {[0, 1, 2, 3, 4].map((idx) => (
    <button
      key={idx}
      aria-label={`Go to slide ${idx + 1}`}
      onClick={() => setActiveCover(idx)}
      className={`transition-all duration-300 rounded-full ${
        activeCover === idx
          ? "h-2.5 w-7 bg-[#133020]"
          : "w-2.5 h-2.5 bg-[#cfc5b3] hover:bg-[#8e8574]"
      }`}
    />
  ))}
</div>
</div>
</section>
{/*  REDESIGNED PRECISION PIPELINE: CONTINUOUS CHART LINE & INTERACTIVE 4-STAGE SHOWCASE  */}
<section className="w-full max-w-7xl mx-auto px-gutter py-space-xl relative" id="pipeline"><div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden"><div className="absolute top-12 left-[10%] w-[580px] h-[340px] rounded-full filter blur-[130px] opacity-45" style={{"background":"radial-gradient(circle, rgba(219, 225, 255, 0.4) 0%, rgba(202, 234, 217, 0.2) 50%, transparent 75%)"}}></div><div className="absolute bottom-8 right-[5%] w-[640px] h-[400px] rounded-full filter blur-[140px] opacity-35 mix-blend-multiply" style={{"background":"radial-gradient(circle, rgba(254, 243, 199, 0.5) 0%, rgba(202, 234, 217, 0.3) 45%, transparent 70%)"}}></div></div>
{/*  Minimal Header & Realtime Stage Selector  */}
<div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
<div className="max-w-xl">
<div className="flex items-center gap-2">
<span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
<span className="font-cad-spec-micro text-cad-spec-micro uppercase tracking-widest text-[#4d6657] font-semibold">Continuous CAD Pipeline</span>
</div>
<h2 className="font-headline-lg text-[32px] md:text-[40px] text-[#122e20] mt-1 font-['Playfair_Display'] font-medium">
        Khuôn Số Hóa Tới Bàn Bế
      </h2>
</div>
{/*  Apple-style Interactive Timeline Pills  */}
<div className="inline-flex p-1.5 rounded-full bg-white/70 border border-[#e5decb] shadow-xs backdrop-blur-md overflow-x-auto max-w-full">
<button className={`pipeline-tab px-4 py-2 rounded-full font-cad-dimension text-xs font-medium transition-all flex items-center gap-2 ${pipelineStep === 0 ? "bg-white text-[#133020] shadow-xs" : "text-[#697d71] hover:text-[#133020]"}`} onClick={() => setPipelineStep(0)} id="pipeline-btn-0">
<span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
<span className="">01 · CAD Dieline</span>
</button>
<button className={`pipeline-tab px-4 py-2 rounded-full font-cad-dimension text-xs font-medium transition-all flex items-center gap-2 ${pipelineStep === 1 ? "bg-white text-[#133020] shadow-xs" : "text-[#697d71] hover:text-[#133020]"}`} onClick={() => setPipelineStep(1)} id="pipeline-btn-1">
<span className="w-2 h-2 rounded-full bg-[#cca72f]"></span>
<span className="">02 · Caliper</span>
</button>
<button className={`pipeline-tab px-4 py-2 rounded-full font-cad-dimension text-xs font-medium transition-all flex items-center gap-2 ${pipelineStep === 2 ? "bg-white text-[#133020] shadow-xs" : "text-[#697d71] hover:text-[#133020]"}`} onClick={() => setPipelineStep(2)} id="pipeline-btn-2">
<span className="w-2 h-2 rounded-full bg-[#486458]"></span>
<span className="">03 · 3D PBR</span>
</button>
<button className={`pipeline-tab px-4 py-2 rounded-full font-cad-dimension text-xs font-medium transition-all flex items-center gap-2 ${pipelineStep === 3 ? "bg-white text-[#133020] shadow-xs" : "text-[#697d71] hover:text-[#133020]"}`} onClick={() => setPipelineStep(3)} id="pipeline-btn-3">
<span className="w-2 h-2 rounded-full bg-[#133020]"></span>
<span className="">04 · CNC Export</span>
</button>
</div>
</div>
{/*  Interactive Continuous Chart Line (Bezier Wave) with moving indicator dot  */}
<div className="relative w-full mb-8 px-2">
<div className="relative w-full h-14 flex items-center">
<svg className="w-full h-12 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 60">
<defs>
<linearGradient id="pipelineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" stopColor="#2563eb" stopOpacity="0.9"></stop>
<stop offset="35%" stopColor="#cca72f" stopOpacity="0.9"></stop>
<stop offset="70%" stopColor="#486458" stopOpacity="0.9"></stop>
<stop offset="100%" stopColor="#133020" stopOpacity="0.9"></stop>
</linearGradient>
<filter height="200%" id="glowDot" width="200%" x="-50%" y="-50%">
<feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
<feMerge>
<feMergeNode in="blur"></feMergeNode>
<feMergeNode in="SourceGraphic"></feMergeNode>
</feMerge>
</filter>
</defs>
{/*  Background guide track  */}
<path d="M 0,30 Q 166,10 333,30 T 666,30 T 1000,30" fill="none" stroke="#e0d6c5" strokeDasharray="4 4" strokeWidth="2" />
{/*  Active progressive bezier path  */}
<path d="M 0,30 Q 166,10 333,30 T 666,30 T 1000,30" fill="none" id="pipelineTrack" stroke="url(#pipelineGradient)" strokeLinecap="round" strokeWidth="3.5" />
{/*  Interactive Milestone Anchor Points  */}
<circle className="cursor-pointer fill-white stroke-[#2563eb] stroke-[3px] hover:scale-125 transition-transform" cx="40" cy="27" r="7" onClick={() => setPipelineStep(0)} />
<circle className="cursor-pointer fill-white stroke-[#cca72f] stroke-[3px] hover:scale-125 transition-transform" cx="350" cy="31" r="7" onClick={() => setPipelineStep(1)} />
<circle className="cursor-pointer fill-white stroke-[#486458] stroke-[3px] hover:scale-125 transition-transform" cx="660" cy="29" r="7" onClick={() => setPipelineStep(2)} />
<circle className="cursor-pointer fill-white stroke-[#133020] stroke-[3px] hover:scale-125 transition-transform" cx="960" cy="30" r="7" onClick={() => setPipelineStep(3)} />
</svg>
{/*  Smooth moving indicator puck  */}
<div className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ease-out flex items-center justify-center -ml-3" id="puckIndicator" style={{ left: pipelineStep === 0 ? "4%" : pipelineStep === 1 ? "35%" : pipelineStep === 2 ? "66%" : "96%" }}>
<span className="w-6 h-6 rounded-full bg-[#133020] border-2 border-white shadow-md flex items-center justify-center">
<span className="w-2 h-2 rounded-full bg-[#ffe088] animate-ping"></span>
</span>
</div>
</div>
{/*  Micro Pipeline Specs Ribbon  */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-[#e8dfcf]">
<div onClick={() => setPipelineStep(0)} className="cursor-pointer group flex items-baseline justify-between pt-2">
<span className={`font-cad-dimension text-xs font-semibold ${pipelineStep === 0 ? "text-[#2563eb] underline" : "text-[#2563eb]"}`}>01. CAD Dieline</span>
<span className="font-cad-spec-micro text-[#697d71] group-hover:text-black">Δ 0.05mm</span>
</div>
<div onClick={() => setPipelineStep(1)} className="cursor-pointer group flex items-baseline justify-between pt-2">
<span className={`font-cad-dimension text-xs font-semibold ${pipelineStep === 1 ? "text-[#735c00] underline" : "text-[#735c00]"}`}>02. Caliper Fix</span>
<span className="font-cad-spec-micro text-[#697d71] group-hover:text-black">Auto Kerf 1:1</span>
</div>
<div onClick={() => setPipelineStep(2)} className="cursor-pointer group flex items-baseline justify-between pt-2">
<span className={`font-cad-dimension text-xs font-semibold ${pipelineStep === 2 ? "text-[#486458] underline" : "text-[#486458]"}`}>03. 3D Studio</span>
<span className="font-cad-spec-micro text-[#697d71] group-hover:text-black">PBR 4K Shader</span>
</div>
<div onClick={() => setPipelineStep(3)} className="cursor-pointer group flex items-baseline justify-between pt-2">
<span className={`font-cad-dimension text-xs font-semibold ${pipelineStep === 3 ? "text-[#133020] underline" : "text-[#133020]"}`}>04. CNC Export</span>
<span className="font-cad-spec-micro text-[#697d71] group-hover:text-black">DXF/DWG/PDF</span>
</div>
</div>
</div>
{/*  HIGH-DENSITY VISUAL HERO CANVAS (Displaying Active State with Mascot & Spec)  */}
<div className="relative w-full rounded-[32px] bg-[#f5efe4]/80 border border-[#e8ded0] p-6 lg:p-9 shadow-xs overflow-hidden">
{/*  Subtle technical grid background  */}
<div className="absolute inset-0 opacity-40 pointer-events-none" style={{"backgroundImage":"linear-gradient(to right, rgba(20,40,25,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,40,25,0.06) 1px, transparent 1px)","backgroundSize":"24px 24px"}}></div>
{/*  Active Stage Slide Container  */}
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px]" id="pipelineStageContainer">
{/*  Stage 01: CAD Dieline  */}
<div className={`stage-panel transition-opacity duration-500 ${pipelineStep === 0 ? "contents" : "hidden"}`} id="stage-panel-0">
{/*  Visual Cad Workspace Simulator  */}
<div className="lg:col-span-7 bg-white/95 rounded-2xl border border-[#ded5c5] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
<span className="font-cad-dimension text-xs font-medium text-[#486458] ml-2">ECMA-210_FoldCheck.cad</span>
</div>
<span className="font-cad-spec-micro bg-[#eef3ff] text-[#2563eb] font-semibold px-2 py-0.5 rounded">Tự Động Trải Phẳng</span>
</div>
{/*  Dieline Vector Blueprint Graphic  */}
<div className="py-6 flex items-center justify-center relative">
<svg className="w-full max-w-[340px] h-48 text-[#2563eb]" fill="none" viewBox="0 0 340 180">
{/*  Cutting Line (Solid Red)  */}
<rect height="130" rx="4" stroke="#e11d48" strokeDasharray="none" strokeWidth="1.8" width="280" x="30" y="25" />
<rect height="130" stroke="#2563eb" strokeDasharray="4 3" strokeWidth="1.5" width="70" x="70" y="25" />
<rect height="130" stroke="#2563eb" strokeDasharray="4 3" strokeWidth="1.5" width="70" x="140" y="25" />
<rect height="130" stroke="#2563eb" strokeDasharray="4 3" strokeWidth="1.5" width="70" x="210" y="25" />
{/*  Glue Flap  */}
<path d="M 30,35 L 12,45 L 12,135 L 30,145" fill="rgba(37,99,235,0.04)" stroke="#e11d48" strokeWidth="1.8" />
{/*  Top/Bottom Tuck Flaps  */}
<path d="M 70,25 L 85,8 L 125,8 L 140,25" stroke="#e11d48" strokeWidth="1.8" />
<path d="M 70,155 L 85,172 L 125,172 L 140,155" stroke="#e11d48" strokeWidth="1.8" />
{/*  Dimension markers  */}
<line stroke="#737686" strokeWidth="1" x1="70" x2="140" y1="18" y2="18" />
<text fill="#434655" fontFamily="JetBrains Mono" fontSize="9" x="96" y="14">85.0 mm</text>
<line stroke="#737686" strokeWidth="1" x1="318" x2="318" y1="25" y2="155" />
<text fill="#434655" fontFamily="JetBrains Mono" fontSize="9" transform="rotate(90 322,92)" x="322" y="92">130.0 mm</text>
</svg>
</div>
{/*  Quick Metrics Bar  */}
<div className="flex items-center justify-between pt-3 border-t border-[#f0e8dc] font-cad-dimension text-xs text-[#697d71]">
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sai số hình học: ±0.05 mm</span>
<span className="text-[#133020] font-semibold">Tỉ lệ 1:1 Vector</span>
</div>
</div>
{/*  Info & Mascot Callout  */}
<div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5">
<div className="flex items-center gap-4">
<GoiMascot pose="measuring" size={64} />
<div>
<span className="font-cad-dimension text-xs font-semibold text-[#2563eb] uppercase tracking-wider">Bước 01 · Thuật Toán Khung Bế</span>
<h3 className="font-headline-sm text-2xl text-[#122e20] font-semibold">Chọn Khuôn Chuẩn CAD</h3>
</div>
</div>
<p className="font-body-md text-sm text-[#485950] leading-relaxed">
            Hệ thống tự nhận diện thông số hộp thực, dựng ma trận đường cấn gấp (crease) và rãnh dao bế (cut) theo chuẩn quốc tế ECMA &amp; FEFCO mà không cần vẽ tay thủ công.
          </p>
<div className="flex items-center gap-3 pt-2">
<span className="px-3 py-1 rounded-full bg-white text-[#133020] border border-[#ded5c5] font-cad-dimension text-xs">120+ Thư viện khuôn</span>
<span className="px-3 py-1 rounded-full bg-[#2563eb]/10 text-[#2563eb] font-cad-dimension text-xs">Tự dựng 2D</span>
</div>
</div>
</div>
{/*  Stage 02: Caliper Calibration (Initially Hidden)  */}
<div className={`stage-panel transition-opacity duration-500 ${pipelineStep === 1 ? "contents" : "hidden"}`} id="stage-panel-1">
<div className="lg:col-span-7 bg-white/95 rounded-2xl border border-[#ded5c5] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
<span className="font-cad-dimension text-xs font-medium text-[#486458] ml-2">Caliper_Kerf_Engine.v4</span>
</div>
<span className="font-cad-spec-micro bg-[#fdf5d6] text-[#735c00] font-semibold px-2 py-0.5 rounded">Tự Cân Bù Nếp Gấp</span>
</div>
{/*  Caliper Diagram Graphic  */}
<div className="py-6 flex items-center justify-center relative">
<svg className="w-full max-w-[340px] h-48" fill="none" viewBox="0 0 340 180">
{/*  Paper cross section folds  */}
<path d="M 40,90 Q 70,90 90,65 L 140,25 Q 160,10 180,10 L 260,10" stroke="#cca72f" strokeLinecap="round" strokeWidth="8" />
<path d="M 40,130 Q 80,130 110,110 L 170,65 Q 190,50 220,50 L 280,50" stroke="#2563eb" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="4" />
{/*  Caliper gauge graphic  */}
<circle cx="160" cy="90" fill="#fff" r="46" stroke="#cca72f" strokeWidth="2.5" />
<line stroke="#b45309" strokeLinecap="round" strokeWidth="2" x1="160" x2="185" y1="90" y2="70" />
<circle cx="160" cy="90" fill="#b45309" r="4" />
<text fill="#133020" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600" x="135" y="115">350 GSM</text>
<text fill="#735c00" fontFamily="JetBrains Mono" fontSize="9" x="140" y="128">+0.42mm</text>
</svg>
</div>
<div className="flex items-center justify-between pt-3 border-t border-[#f0e8dc] font-cad-dimension text-xs text-[#697d71]">
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Giấy Ivory / Kraft / Carton sóng</span>
<span className="text-[#735c00] font-semibold">Chống nứt gân 100%</span>
</div>
</div>
<div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-2xl bg-[#fef9eb] border border-[#f0dfb2] p-1.5 shadow-xs shrink-0 flex items-center justify-center">
<span className="material-symbols-outlined text-3xl text-[#735c00]">straighten</span>
</div>
<div>
<span className="font-cad-dimension text-xs font-semibold text-[#735c00] uppercase tracking-wider">Bước 02 · Vi Đo Giấy Thật</span>
<h3 className="font-headline-sm text-2xl text-[#122e20] font-semibold">Khai Báo Caliper Giấy</h3>
</div>
</div>
<p className="font-body-md text-sm text-[#485950] leading-relaxed">
            Mỗi loại giấy có độ giãn cơ học khác biệt. WrapFit tính toán lực cấn và bù rãnh dao bế theo caliper thực tế, đảm bảo nắp hộp cài khít êm ái mà không bị bung gãy mép.
          </p>
<div className="flex items-center gap-3 pt-2">
<span className="px-3 py-1 rounded-full bg-white text-[#133020] border border-[#ded5c5] font-cad-dimension text-xs">Kerf Compensation</span>
<span className="px-3 py-1 rounded-full bg-[#cca72f]/20 text-[#735c00] font-cad-dimension text-xs">200 - 450 gsm</span>
</div>
</div>
</div>
{/*  Stage 03: 3D PBR Studio (Initially Hidden)  */}
<div className={`stage-panel transition-opacity duration-500 ${pipelineStep === 2 ? "contents" : "hidden"}`} id="stage-panel-2">
<div className="lg:col-span-7 bg-[#212429] rounded-2xl border border-[#3b414a] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between text-white">
<div className="flex items-center justify-between pb-3 border-b border-white/10">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
<span className="font-cad-dimension text-xs font-medium text-slate-300 ml-2">WrapFit_PBR_Viewport.4k</span>
</div>
<span className="font-cad-spec-micro bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">Raytracing 60 FPS</span>
</div>
{/*  3D Gold Foil Simulation Mock  */}
<div className="py-5 flex items-center justify-center relative">
<div className="w-60 h-40 rounded-xl bg-gradient-to-tr from-[#1b1c1e] to-[#2d3036] border border-white/15 p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
{/*  Gold foil shine effect line  */}
<div className="absolute -inset-full bg-gradient-to-r from-transparent via-[#ffe58f]/20 to-transparent rotate-45 pointer-events-none"></div>
<div className="flex justify-between items-start">
<span className="font-cad-spec-micro text-[#d4af37] tracking-widest uppercase">HOT FOIL 24K</span>
<span className="material-symbols-outlined text-[#ffe088] text-sm">wb_sunny</span>
</div>
<div className="text-center my-auto">
<div className="font-['Playfair_Display'] text-xl font-medium tracking-wider text-[#fceec5] drop-shadow-sm">WRAPFIT LUXE</div>
<div className="font-cad-dimension text-[10px] text-slate-400 tracking-widest mt-1">EMBOSS 0.35MM DEPTH</div>
</div>
<div className="flex justify-between text-[10px] font-cad-dimension text-slate-400">
<span className="">MATTE SOFT TOUCH</span>
<span className="">IOR 1.48</span>
</div>
</div>
</div>
<div className="flex items-center justify-between pt-3 border-t border-white/10 font-cad-dimension text-xs text-slate-400">
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Gập mở nắp 360° tương tác thực</span>
<span className="text-[#ffe088] font-semibold">Phủ Kim Loại Chuẩn HDR</span>
</div>
</div>
<div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-2xl bg-[#eef4f1] border border-[#c4dcce] p-1.5 shadow-xs shrink-0 flex items-center justify-center">
<span className="material-symbols-outlined text-3xl text-[#486458]">view_in_ar</span>
</div>
<div>
<span className="font-cad-dimension text-xs font-semibold text-[#486458] uppercase tracking-wider">Bước 03 · Render Vật Lý Thực</span>
<h3 className="font-headline-sm text-2xl text-[#122e20] font-semibold">Phối Cảnh 3D Studio</h3>
</div>
</div>
<p className="font-body-md text-sm text-[#485950] leading-relaxed">
            Xem trước trải nghiệm mở hộp (unboxing moment) của khách hàng. Trực quan hóa các hiệu ứng gia công đắt giá như dập nổi, ép kim 24K, cán màng nhám dưới nguồn sáng môi trường.
          </p>
<div className="flex items-center gap-3 pt-2">
<span className="px-3 py-1 rounded-full bg-white text-[#133020] border border-[#ded5c5] font-cad-dimension text-xs">PBR Realtime</span>
<span className="px-3 py-1 rounded-full bg-[#486458]/15 text-[#486458] font-cad-dimension text-xs">Ép Kim &amp; UV Định Vị</span>
</div>
</div>
</div>
{/*  Stage 04: CNC Export (Initially Hidden)  */}
<div className={`stage-panel transition-opacity duration-500 ${pipelineStep === 3 ? "contents" : "hidden"}`} id="stage-panel-3">
<div className="lg:col-span-7 bg-white/95 rounded-2xl border border-[#ded5c5] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
<span className="font-cad-dimension text-xs font-medium text-[#486458] ml-2">Export_Ready_Bundle_Pass.cnc</span>
</div>
<span className="font-cad-spec-micro bg-[#caead9] text-[#152e22] font-semibold px-2 py-0.5 rounded">Kiểm Định Dao Bế Xong</span>
</div>
{/*  Export Formats & Layers graphic  */}
<div className="py-5 grid grid-cols-3 gap-3">
<div className="rounded-xl border border-[#ded5c5] bg-[#faf6ee] p-3 text-center flex flex-col items-center">
<span className="material-symbols-outlined text-[#2563eb] text-2xl mb-1">architecture</span>
<span className="font-cad-dimension text-xs font-bold text-[#122e20]">DXF / DWG</span>
<span className="font-cad-spec-micro text-[#697d71] mt-1">Máy cắt CNC/Laser</span>
</div>
<div className="rounded-xl border border-[#ded5c5] bg-[#faf6ee] p-3 text-center flex flex-col items-center">
<span className="material-symbols-outlined text-[#ba1a1a] text-2xl mb-1">picture_as_pdf</span>
<span className="font-cad-dimension text-xs font-bold text-[#122e20]">PDF Layers</span>
<span className="font-cad-spec-micro text-[#697d71] mt-1">Tách lớp khuôn bế</span>
</div>
<div className="rounded-xl border border-[#ded5c5] bg-[#faf6ee] p-3 text-center flex flex-col items-center">
<span className="material-symbols-outlined text-[#486458] text-2xl mb-1">view_in_ar</span>
<span className="font-cad-dimension text-xs font-bold text-[#122e20]">GLTF / OBJ</span>
<span className="font-cad-spec-micro text-[#697d71] mt-1">Render 3D Thương mại</span>
</div>
</div>
<div className="flex items-center justify-between pt-3 border-t border-[#f0e8dc] font-cad-dimension text-xs text-[#697d71]">
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đồng bộ mã vạch &amp; bo góc an toàn</span>
<span className="text-[#133020] font-semibold">Sẵn Sàng Cho Xưởng In</span>
</div>
</div>
<div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5">
<div className="flex items-center gap-4">
<GoiMascot pose="delivery" size={64} />
<div>
<span className="font-cad-dimension text-xs font-semibold text-[#133020] uppercase tracking-wider">Bước 04 · Xuất Xưởng Tức Thì</span>
<h3 className="font-headline-sm text-2xl text-[#122e20] font-semibold">Xuất Chế Bản &amp; CNC</h3>
</div>
</div>
<p className="font-body-md text-sm text-[#485950] leading-relaxed">
            Chỉ với một cú click, toàn bộ file khuôn dao sắc bén được tự động định dạng chuẩn xác theo phân lớp màu chuẩn cho nhà xưởng bế dập và xưởng in offset.
          </p>
<div className="flex items-center gap-3 pt-2">
<span className="px-3 py-1 rounded-full bg-white text-[#133020] border border-[#ded5c5] font-cad-dimension text-xs">Vector 1:1</span>
<span className="px-3 py-1 rounded-full bg-[#133020] text-white font-cad-dimension text-xs">Tải Toàn Bộ Gói File</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  BOTTOM CALL-TO-ACTION (Apple Aesthetic Minimal Card with Mascot)  */}
<section className="w-full max-w-7xl mx-auto px-gutter pt-space-lg pb-space-xl relative"><div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden"><div className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[480px] h-[480px] rounded-full filter blur-[130px] opacity-40 mix-blend-multiply" style={{"background":"radial-gradient(circle, rgba(202, 234, 217, 0.6) 0%, rgba(72, 100, 88, 0.15) 55%, transparent 75%)"}}></div><div className="absolute top-1/2 left-[5%] -translate-y-1/2 w-[540px] h-[380px] rounded-full filter blur-[135px] opacity-35" style={{"background":"radial-gradient(circle, rgba(254, 240, 215, 0.6) 0%, rgba(245, 239, 228, 0) 70%)"}}></div></div>
<div className="relative w-full rounded-[38px] bg-[#f2ecdf]/50 p-space-xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-xl">
{/*  Left CTA Text  */}
<div className="flex flex-col items-start max-w-2xl z-10">
<span className="font-cad-spec-micro text-xs uppercase tracking-widest text-[#4d6657] font-semibold mb-3">
        Trực Tuyến · Không Cần Cài Đặt
      </span>
<h2 className="font-headline-lg text-headline-lg lg:text-[44px] lg:leading-[52px] text-[#122e20] font-['Playfair_Display'] font-medium">
        Bắt Đầu Dự Án Bao Bì Hoàn Hảo
      </h2>
<p className="font-body-lg text-[#485950] mt-space-sm max-w-lg leading-relaxed">
        Chuẩn hóa quy trình thiết kế khuôn bế cùng WrapFit ngay hôm nay.
      </p>
<div className="flex flex-wrap items-center gap-space-md mt-space-lg">
<a className="inline-flex items-center justify-center px-6 py-3 bg-[#133020] text-white text-sm font-medium rounded-full hover:bg-[#1c422d] transition-all active:scale-95 shadow-xs" data-path="3d-workspace" href="#pipeline">
<span className="">Mở Studio Miễn Phí</span>
<span className="material-symbols-outlined text-base ml-2">arrow_forward</span>
</a>
<a className="inline-flex items-center justify-center px-6 py-3 text-[#152e22] text-sm font-medium hover:text-black transition-all" data-path="bang-gia" href="#">
          Xem Bảng Giá
        </a>
</div>
</div>
{/*  Right Visual Mascot  */}
<div className="relative flex items-center justify-center z-10 shrink-0">
<GoiMascot pose="thumbs_up" size={160} />
</div>
</div>
</section>
</div>
</main>
<footer className="w-full bg-surface-container-low"><div className="max-w-7xl mx-auto px-gutter py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg"><div className="flex items-center gap-space-sm"><div className="w-7 h-7 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container"><span className="material-symbols-outlined text-base">inventory_2</span></div><span className="font-label-ui text-label-ui text-on-surface font-semibold">WrapFit Studio</span><span className="text-outline font-cad-spec-micro text-cad-spec-micro ml-space-xs">• Nền tảng thiết kế bao bì chuẩn CAD</span></div><div className="flex flex-wrap items-center justify-center gap-space-lg font-body-sm text-body-sm text-on-surface-variant"><a className="hover:text-on-surface transition-colors" data-path="thu-vien-mau" href="#">Quy chuẩn Dieline</a><a className="hover:text-on-surface transition-colors" data-path="vat-lieu" href="#">Thư viện Giấy &amp; Màng ép</a><a className="hover:text-on-surface transition-colors" data-path="bang-gia" href="#">Chính sách Doanh nghiệp</a><a className="hover:text-on-surface transition-colors" data-path="trang-chu" href="#">Bảo mật &amp; Bản quyền CAD</a></div><div className="font-cad-dimension text-cad-dimension text-on-surface-variant">© 2025 WrapFit Inc. All rights reserved.</div></div></footer>









    </>
  );
}
