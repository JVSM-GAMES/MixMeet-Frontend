import { createContext, useContext, useState, useEffect } from 'react';
import { apiAuth, apiUsers } from '../api/apiClient'; // Importe apiUsers

const AuthContext = createContext();

const getStoredToken = () => localStorage.getItem('mixmeet_jwt'); // Corrigido nome da chave

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null); // Guarda o Nickname
    const [loading, setLoading] = useState(true);

    // Função para carregar o perfil do usuário do C#
    const loadUserProfile = async () => {
        try {
            const response = await apiUsers.getMe();
            setUserProfile(response.data); // Salva { phoneNumber, nickname }
        } catch (error) {
            // Se der 404, significa que tem token mas não tem nickname.
            // Deixamos userProfile como null, a aplicação vai redirecionar para setup.
            console.log("Usuário sem perfil ainda.");
            setUserProfile(null); 
        }
    };

    useEffect(() => {
        const token = getStoredToken();
        if (token) {
            setIsAuthenticated(true);
            loadUserProfile(); // Carrega dados se tiver token
        }
        setLoading(false);
    }, []);

    const requestVerificationCode = async (phoneNumber) => {
        const response = await apiAuth.post('/request-code', { phone_number: phoneNumber });
        return response.data;
    };

    const verifyAndLogin = async (phoneNumber, code) => {
        const response = await apiAuth.post('/verify-code', { 
            phone_number: phoneNumber, 
            code: code 
        });
        
        const token = response.data.access_token;
        localStorage.setItem('mixmeet_jwt', token); // Use o mesmo nome de chave do apiClient
        setIsAuthenticated(true);
        
        // Após login, tenta carregar o perfil
        await loadUserProfile();
        return true;
    };

    const logout = () => {
        localStorage.removeItem('mixmeet_jwt');
        setIsAuthenticated(false);
        setUserProfile(null);
    };

    // Função exposta para atualizar o perfil após o cadastro do nickname
    const updateProfile = (profile) => {
        setUserProfile(profile);
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            userProfile, // Novo estado
            loading, 
            requestVerificationCode, 
            verifyAndLogin, 
            logout,
            updateProfile // Nova função
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);