import React, { useState, useEffect, useActionState } from 'react'
import { grid } from 'ldrs'

grid.register()
import Search from './components/Search'


const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  }
}


const App = () => {


  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMovies = async ()=>{

    setIsLoading(true);
    setErrorMessage('');

    try {

      const endpoint = `${API_BASE_URL}/movie/top_rated?language=en-US&page=1`;
      
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("Failed to fetch movies")
      }
      
      const data = await response.json();
      
      if(data.response == "False"){
        setErrorMessage(data.error || "Error while fetching movies.")
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

    } catch (error) {

      console.error(`Error while fetching movies: ${error}`)
      setErrorMessage('Error while fetching movies.')

    }finally{
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    fetchMovies()
  },[])

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>

        <header>
          <img src="./hero.png" alt="Banner" />
          <h1>Find <span className='text-gradient'>movies</span> without the Hassle
          </h1>
        <Search searchTerm={searchTerm}setSearchTerm={setSearchTerm}/>
        </header>

        <section className='all-movies'>
          <h2 className='mt-10'>All Movies</h2>
          {isLoading ? (
            <l-grid size="60" speed="1.5" color="white"></l-grid>
            
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie)=>(
                <li key={movie.id} className='text-white'>{movie.title}</li>
              ))}
            </ul>
          )}
        </section>


      </div>
    </main>
  )
}

export default App