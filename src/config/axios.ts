import axios from 'axios'

//creamos una instancia de axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

export default api