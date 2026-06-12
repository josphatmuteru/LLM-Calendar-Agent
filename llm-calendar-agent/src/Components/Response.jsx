import { useState } from 'react'


function Response({response}) {
  const [count, setCount] = useState(0)

  return (
    <>
      
        <div className="response">
         
<div>
    {response}
</div>

        </div>
  

      
    </>
  )
}

export default Response
