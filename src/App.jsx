import React, { useState, useEffect } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite'
import { grid } from 'ldrs'
grid.register()


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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])

  useDebounce(()=>
    setDebouncedSearchTerm(searchTerm)
  , 1000, [searchTerm]
  )

  const fetchMovies = async (query = '')=>{

    setIsLoading(true);
    setErrorMessage('');

    try {

      const endpoint =  query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
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
      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0])
      }

    } catch (error) {

      console.error(`Error while fetching movies: ${error}`)
      setErrorMessage('Error while fetching movies.')

    }finally{
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async ()=>{
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies || [])
    } catch (error) {
      console.error(`Error while fetching trending movies: ${error}`)
    }
  }

  useEffect(()=>{
    fetchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])

  useEffect(()=>{
    loadTrendingMovies()
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

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index)=>(
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                  
                </li>
              ))}
            </ul>

          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <l-grid size="60" speed="1.5" color="white"></l-grid>
            
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie)=>(
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>


      </div>
    </main>
  )
}

export default App