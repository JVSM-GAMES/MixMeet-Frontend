// src/pages/HomePage.jsx (BLINDADO)

import { Box, Button, Container, Heading, Text, VStack, HStack, Avatar } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';

const HomePage = () => {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <HStack justify="space-between" bg="white" p={6} borderRadius="lg" boxShadow="sm" borderWidth={1}>
                    <HStack>
                        <Avatar name={userProfile?.nickname} bg="teal.500" />
                        <Box>
                            <Text fontSize="sm" color="gray.500">Bem-vindo,</Text>
                            <Heading size="md">{userProfile?.nickname || 'Usuário'}</Heading>
                        </Box>
                    </HStack>
                    <Button leftIcon={<FaSignOutAlt />} size="sm" colorScheme="red" variant="ghost" onClick={logout}>
                        <span>Sair</span>
                    </Button>
                </HStack>

                {/* Main Content */}
                <Box textAlign="center" py={10}>
                    <Heading size="xl" mb={4}>MixMeet</Heading>
                    <Text fontSize="lg" color="gray.600" mb={8}>
                        O sistema inteligente para gerenciar suas salas de reunião.
                    </Text>
                    
                    <Button 
                        size="lg" 
                        colorScheme="teal" 
                        leftIcon={<FaCalendarAlt />}
                        onClick={() => navigate('/dashboard')}
                    >
                        <span>Acessar Reservas</span>
                    </Button>
                </Box>
            </VStack>
        </Container>
    );
};

export default HomePage;