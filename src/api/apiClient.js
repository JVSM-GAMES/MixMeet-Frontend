import axios from 'axios';

// Cliente para Auth (Python)
export const apiAuth = axios.create({
    baseURL: 'http://localhost:8081/api/auth',
    headers: { 'Content-Type': 'application/json' },
});

// Cliente Genérico C# (Aponta para a raiz da API)
// Isso permite chamar tanto /reservas quanto /users
export const apiReservas = axios.create({
    baseURL: 'http://localhost:8080/api', // Mudamos para /api
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor JWT
apiReservas.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('mixmeet_jwt'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Funções auxiliares ajustadas para a BaseURL
export const apiUsers = {
    getMe: () => apiReservas.get('/users/me'),       // Vai chamar http://localhost:8080/api/users/me
    setNickname: (nickname) => apiReservas.post('/users/nickname', { nickname })
};