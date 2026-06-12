import { useState } from 'react'


import './App.css'
import ChatInput from './Components/ChatInput'
import Message from './Components/Message'
import Response from './Components/Response'
import ChatWindow from './Components/ChatWindow'
import Appp from './Components/Appp'
import AgentDashboard from './Components/AgentDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
<AgentDashboard/>


        </div>
      </section>

      
    </>
  )
}

export default App
