// src/pages/DashboardPage.jsx

import {
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box 
} from '@chakra-ui/react';
import { FaPlus, FaSignOutAlt, FaTrash, FaEdit } from 'react-icons/fa';
import { useRef, useState } from 'react';
import useReservas from '../hooks/useReservas';
import { useAuth } from '../context/AuthContext';
import ReservaFormModal from '../components/ReservaFormModal'; 

// Função utilitária para formatação de data
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(isoString).toLocaleDateString('pt-BR', options);
};

const DashboardPage = () => {
  const { logout } = useAuth();
  const { reservas, isLoading, deleteReserva, refetch } = useReservas();

  // -----------------------------------------------------------
  // Gerenciamento do Modal de Formulário (Criação/Edição)
  // -----------------------------------------------------------
  const { 
    isOpen: isFormOpen, 
    onOpen: onFormOpen, 
    onClose: onFormClose 
  } = useDisclosure();
  
  const [currentReserva, setCurrentReserva] = useState(null);

  const handleCreateClick = () => {
    setCurrentReserva(null); // Limpa para modo de criação
    onFormOpen();
  };
  
  const handleEditClick = (reserva) => {
    setCurrentReserva(reserva); // Define a reserva para modo de edição
    onFormOpen();
  };
  
  const handleFormClose = () => {
    setCurrentReserva(null);
    onFormClose();
  };

  // -----------------------------------------------------------
  // Gerenciamento do Modal de Exclusão (Requisito da Prova)
  // -----------------------------------------------------------
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const [reservaToDelete, setReservaToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setReservaToDelete(id);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (reservaToDelete) {
      await deleteReserva(reservaToDelete);
      setReservaToDelete(null);
      onDeleteClose();
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Heading size="md" ml={4}>Carregando Reservas...</Heading>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        
        {/* Cabeçalho e Ações */}
        <HStack>
          <Heading size="xl">📅 Reservas MixMeet</Heading>
          <Spacer />
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="teal"
            onClick={handleCreateClick} 
          >
            Nova Reserva
          </Button>
          <Button 
            leftIcon={<FaSignOutAlt />} 
            variant="ghost"
            onClick={logout}
          >
            Sair
          </Button>
        </HStack>
        
        {/* Tabela de Listagem */}
        <Box overflowX="auto" borderWidth={1} borderRadius="lg">
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Sala / Local</Th>
                <Th>Início</Th>
                <Th>Fim</Th>
                <Th>Responsável</Th>
                <Th>Café?</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reservas.length === 0 ? (
                <Tr><Td colSpan={6} textAlign="center">Nenhuma reserva encontrada. Crie uma!</Td></Tr>
              ) : (
                reservas.map((reserva) => (
                  <Tr key={reserva.id}>
                    <Td>{reserva.sala} ({reserva.local})</Td>
                    <Td>{formatDateTime(reserva.dataHoraInicio)}</Td>
                    <Td>{formatDateTime(reserva.dataHoraFim)}</Td>
                    <Td>{reserva.responsavel}</Td>
                    <Td>{reserva.temCafe ? 'Sim' : 'Não'}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" leftIcon={<FaEdit />} colorScheme="blue" variant="outline" 
                          onClick={() => handleEditClick(reserva)} 
                        >
                          Editar
                        </Button>
                        <Button size="sm" leftIcon={<FaTrash />} colorScheme="red" 
                          onClick={() => handleDeleteClick(reserva.id)}
                        >
                          Excluir
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Modal de Formulário (Criação/Edição) */}
      <ReservaFormModal 
        isOpen={isFormOpen}
        onClose={handleFormClose}
        reservaData={currentReserva}
        onSaveSuccess={refetch} 
      />

      {/* Modal de Confirmação para Exclusão (Requisito da Prova) */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmação de Exclusão
            </AlertDialogHeader>

            <AlertDialogBody>
              Você tem certeza? A exclusão da reserva **não pode ser desfeita**.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default DashboardPage;