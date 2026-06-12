import { useState } from 'react'
import { sendMessage } from '../services/agentApi'

function ChatWindow() {

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])


    async  function handleSend() {
        const data = await sendMessage(message)
    

    setMessages(prev => [
        ...prev, {role: "user", content: message}, {
            role: "assistant",
            content: data.reply
        }
    ])

    setMessage("");
    }

    return (
<div>
{messages.map((msg, index) => (
<div key={index}>
<b>{msg.role}</b>
<b>{msg.content}</b>
</div>

))}

<input 
    value={message}
    onChange={(e) => setMessage(e.target.value)}
/>
<button onClick={handleSend}>Send</button>
</div>

    )
}

export default ChatWindow;