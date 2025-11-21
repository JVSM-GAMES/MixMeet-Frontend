// src/hooks/useReservas.jsx (COMPLETO E ATUALIZADO)

import { useState, useEffect, useCallback } from 'react';
import { apiReservas } from '../api/apiClient';
import { useToast } from '@chakra-ui/react';

const useReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // -----------------------------------------------------------
    // Função: Busca (R - Read)
    // -----------------------------------------------------------
    const fetchReservas = useCallback(async () => {
        setIsLoading(true);
        try {
            // ATENÇÃO: Adicionado '/reservas' porque a baseURL agora é apenas '/api'
            const response = await apiReservas.get('/reservas'); 
            setReservas(response.data);
        } catch (error) {
            console.error("Erro ao buscar reservas:", error);
            
            // Evita spam de erro se for apenas token expirado (401)
            if (error.response?.status !== 401) {
                toast({
                    title: 'Erro ao carregar reservas',
                    description: error.response?.data?.mensagem || "Não foi possível conectar ao servidor.",
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Carrega os dados assim que o componente monta
    useEffect(() => {
        fetchReservas();
    }, [fetchReservas]);

    // -----------------------------------------------------------
    // Função: Exclusão (D - Delete)
    // -----------------------------------------------------------
    const deleteReserva = async (id) => {
        try {
            // ATENÇÃO: Adicionado '/reservas/' no caminho
            await apiReservas.delete(`/reservas/${id}`); 
            
            // Atualização otimista da UI (remove da lista sem esperar refetch)
            setReservas(prev => prev.filter(r => r.id !== id));
            
            toast({
                title: 'Reserva Excluída',
                description: 'A reserva foi removida com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Erro ao excluir',
                description: error.response?.data?.mensagem || "Falha na exclusão.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };
    
    // Função para recarregar manualmente (útil após criar/editar no modal)
    const refetch = () => fetchReservas();

    return {
        reservas,
        isLoading,
        deleteReserva,
        refetch
    };
};

export default useReservas;