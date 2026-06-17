import { useState } from 'react'


import ChatInput from './Components/ChatInput'
import Message from './Components/Message'
import Response from './Components/Response'
import ChatWindow from './Components/ChatWindow'
import Appp from './Components/Appp'
import AgentDashboard from './Components/AgentDashboard'
import CalendarApp from './Components/CalendarApp'
import LLMChatApp from './Components/LLMChatApp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
{/* <AgentDashboard/> */}
<LLMChatApp/>


        </div>
      </section>

      
    </>
  )
}

export default App
