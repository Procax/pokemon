import { Route,   BrowserRouter as Router  , Routes } from 'react-router-dom';
import './App.css';
import Pokemonapi from './components/Pokemonapi/Pokemonapi';
import Login from './components/Login/Login';
import withAuthorization from './components/Auth/withAuthorization';

const ProtectedPokemonapi = withAuthorization(Pokemonapi)


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path='Pokemon' element={<ProtectedPokemonapi/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
