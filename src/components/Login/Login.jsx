import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal'
import '../Login/Login.css'



function Login() {

  const [Formdata, setFormData] = useState({username: '', password: ''})

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openmodal = () => setIsModalOpen(true)
  const closemodal = () => setIsModalOpen(false)

    const navigate = useNavigate();


    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    };
  console.log(JSON.stringify(Formdata))



    const handlesubmit = () => {
        localStorage.setItem('authToken', '12345'); // Fake auth token

        navigate('/Pokemon')
    }

  return (
    <div>
        <div> 
            <h2>Login</h2>
         </div>  

         <button onClick={openmodal}>Open Modal</button>



         <h1>React Modal Example</h1>
<div>
  
      {/* Render the Modal */}
     <Modal isOpen={isModalOpen} onClose={closemodal}>
{/* <div className='login-modal'>
<div>
            <input type="email" name="Login"  />
        </div>
        <div>
            <button onClick={handlesubmit} type="submit">submit</button>
        </div>


</div> */}

<form>

  <div>
    <input type="text" name='Username' value={Formdata.username} onChange={handleInputChange}/>
  </div>
  <div>
    <input type="password" name='Password' value={Formdata.password}  onChange={handleInputChange}/>
  </div>

  <button type="submit" onChange={handlesubmit}>Login</button>


</form>
     </Modal>
     </div>







        {/* <div>
            <input type="email" name="Login"  />
        </div>
        <div>
            <button onClick={handlesubmit} type="submit">submit</button>
        </div> */}
    </div>
  )
}

export default Login
