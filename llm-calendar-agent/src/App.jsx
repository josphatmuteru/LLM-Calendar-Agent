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

  <div className="w-full flex flex-col md:flex-row items-stretch justify-between gap-5 border-b border-gray-300/40 pb-5">
            <fieldset 
              style={{ padding: '8px' }}
              className="flex-1 border-[1.5px] border-[#0b5c9e] rounded-lg relative bg-white"
            >
              <legend 
                style={{ background: 'linear-gradient(to bottom, #eeeded 50%, #ffffff 50%)' }}
                className="px-2 font-bold text-xs text-[#0b5c9e] tracking-tight ml-2"
              >
                Scenario
              </legend>
              <p className="text-sm text-[#222222] font-semibold leading-relaxed">
               
              </p>
            </fieldset>

            <div className="flex flex-col shrink-0 md:w-[240px]">
              <div className="flex flex-col justify-between h-full md:pt-[7.5px] gap-2 md:gap-1">
                <button
                  // onClick={handleGenerateScenario}
                  className="w-full h-[32px] px-3 bg-[#0b5c9e] hover:bg-[#063c68] text-white text-[11px] sm:text-xs font-bold rounded-lg transition-all border border-[#063c68] cursor-pointer flex items-center justify-center text-center whitespace-nowrap active:scale-98 shadow-xs"
                >
                  Generate Different Scenario
                </button>
                <button
                  // onClick={handleDemonstrateScenario}
                  className="w-full h-[32px] px-3 bg-[#0b5c9e] hover:bg-[#063c68] text-white text-[11px] sm:text-xs font-bold rounded-lg transition-all border border-[#063c68] cursor-pointer flex items-center justify-center text-center whitespace-nowrap active:scale-98 shadow-xs"
                >
                  Demonstrate Scenario
                </button>
              </div>
            </div>
          </div>
          
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
