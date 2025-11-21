// src/pages/NicknamePage.jsx (CORRIGIDO / BLINDADO)

import { useState } from 'react';
import { 
    Box, 
    Button, 
    FormControl, 
    FormLabel, 
    Input, 
    VStack, 
    Heading, 
    Text, 
    useToast, 
    Container, 
    Spinner // Importar Spinner
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { apiUsers } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NicknamePage = () => {
    const { updateProfile, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            // Salva no C#
            const response = await apiUsers.setNickname(data.nickname);
            
            // Atualiza o contexto com o novo perfil
            updateProfile(response.data);
            
            toast({ title: 'Bem-vindo, ' + data.nickname + '!', status: 'success', duration: 3000 });
            navigate('/'); // Vai para a Home
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao salvar', description: 'Tente novamente.', status: 'error' });
        }
    };

    return (
        <Container centerContent h="100vh" justifyContent="center">
            <Box p={8} w="100%" maxW="400px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
                <VStack spacing={4}>
                    <Heading size="md">Quase lá!</Heading>
                    <Text color="gray.600">Como você gostaria de ser chamado?</Text>
                    
                    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Seu Apelido (NickName)</FormLabel>
                                <Input 
                                    placeholder="Ex: João do TI" 
                                    {...register('nickname', { required: true, minLength: 3 })} 
                                />
                            </FormControl>
                            
                            {/* BOTÃO BLINDADO: Sem isLoading nativo para evitar crash com extensões */}
                            <Button 
                                type="submit" 
                                colorScheme="teal" 
                                w="full" 
                                isDisabled={isSubmitting}
                            >
                                <span>{isSubmitting ? <Spinner size="sm" /> : "Salvar e Entrar"}</span>
                            </Button>
                            
                            <Button variant="ghost" size="xs" onClick={logout}>
                                <span>Sair / Cancelar</span>
                            </Button>
                        </VStack>
                    </form>
                </VStack>
            </Box>
        </Container>
    );
};

export default NicknamePage;