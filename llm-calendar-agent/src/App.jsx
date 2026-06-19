import CalendarApp from './Components/CalendarApp.tsx';
import EmailClientApp from './Components/emailClientApp.tsx';
import LLMChatApp from './Components/LLMChatApp.tsx';


import { useState } from "react";

export default function App() {
  
  const [isShowingCalendarApp, setIsShowingCalendarApp] = useState(true);

    const handleSetIsShowingCalendarApp = (state) => {
    setIsShowingCalendarApp(state);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto font-sans">
      <div className="flex flex-col gap-4 w-full max-w-[1350px]">
        
        {/* Main Side-by-Side Outer Container mimicking mockups */}
        <div className="bg-[#eeeded] border-[1.5px] border-[#222222] rounded-lg p-5 lg:p-7 flex flex-col gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">


          {/* Connected Apps Row */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 lg:gap-7 w-full">
            <div className="w-full lg:w-auto flex-none flex items-center justify-center lg:justify-start">
              <LLMChatApp     setIsShowingCalendarApp={handleSetIsShowingCalendarApp}
                isShowingCalendarApp={isShowingCalendarApp} />
            </div>
            <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-start min-w-0">
              {isShowingCalendarApp ? (
                <CalendarApp />
              ) : (
                <EmailClientApp />
              )}

            </div>
          </div>
        </div>

                {/* Outer Navigation row */}
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={() => handleSetIsShowingCalendarApp(true)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-xs border whitespace-nowrap ${
              isShowingCalendarApp
                ? "bg-[#0b5c9e] text-white border-[#063c68]"
                : "bg-white text-[#0b5c9e] border-[#0b5c9e]/20 hover:bg-slate-50"
            }`}
          >
            Calendar App
          </button>
          <button
            onClick={() => handleSetIsShowingCalendarApp(false)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-xs border whitespace-nowrap ${
              !isShowingCalendarApp
                ? "bg-[#0b5c9e] text-white border-[#063c68]"
                : "bg-white text-[#0b5c9e] border-[#0b5c9e]/20 hover:bg-slate-50"
            }`}
          >
            Email App
          </button>
        </div>
        </div>

    
    </div>
  );
}
