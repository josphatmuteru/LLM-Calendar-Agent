import CalendarApp from './Components/CalendarApp.tsx';
import LLMChatApp from './Components/LLMChatApp.tsx';


import { useState } from "react";

export default function App() {



  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto font-sans">
      <div className="flex flex-col gap-4 w-full max-w-[1350px]">
        
        {/* Main Side-by-Side Outer Container mimicking mockups */}
        <div className="bg-[#eeeded] border-[1.5px] border-[#222222] rounded-lg p-5 lg:p-7 flex flex-col gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">


          {/* Connected Apps Row */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 lg:gap-7 w-full">
            <div className="w-full lg:w-auto flex-none flex items-center justify-center lg:justify-start">
              <LLMChatApp/>
            </div>
            <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-start min-w-0">
         
                <CalendarApp />

            </div>
          </div>
        </div>

        
        </div>

    
    </div>
  );
}
