import React from 'react'
import './Pokemoncard.css'
// import Card from 'react-bootstrap/Card';


export const Pokemoncard =({pokemon}) => {
  return (


        <>

            <div className='card'>
                <img src={pokemon?.sprites?.other?.home?.front_default} alt={pokemon.name} />
                <h2>{pokemon.name}</h2>

            </div>




        {/* <Card style={{ width: '18rem' }}>

<Card.Img variant="top" src={pokemon?.sprites?.other?.home?.front_default} alt={pokemon.name}/>

            
<Card.Text>
         {pokemon.name}
        </Card.Text>
            
            
            </Card> */}
            
      
      </>


    
    
  )
}
