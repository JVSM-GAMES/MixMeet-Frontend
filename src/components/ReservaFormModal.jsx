import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  HStack,
  useToast,
  Box,
  Text,
  FormErrorMessage
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { apiReservas } from '../api/apiClient';
import { useEffect } from 'react';

const defaultReserva = {
    local: '',
    sala: '',
    dataHoraInicio: '',
    dataHoraFim: '',
    responsavel: '',
    temCafe: false,
    quantidadeCafe: 0,
    descricaoCafe: ''
};

const formatToLocalDatetime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const ReservaFormModal = ({ isOpen, onClose, reservaData = defaultReserva, onSaveSuccess }) => {
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: defaultReserva
    });
    const toast = useToast();
    
    const isEditing = !!reservaData?.id;
    const temCafe = watch('temCafe'); 

    useEffect(() => {
        if (isOpen) {
            if (isEditing && reservaData) {
                reset({
                    ...reservaData,
                    dataHoraInicio: formatToLocalDatetime(reservaData.dataHoraInicio),
                    dataHoraFim: formatToLocalDatetime(reservaData.dataHoraFim),
                });
            } else {
                reset(defaultReserva);
            }
        }
    }, [isOpen, isEditing, reservaData, reset]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            id: isEditing ? reservaData.id : undefined, 
            dataHoraInicio: new Date(data.dataHoraInicio).toISOString(),
            dataHoraFim: new Date(data.dataHoraFim).toISOString(),
            quantidadeCafe: data.quantidadeCafe ? parseInt(data.quantidadeCafe) : 0,
            descricaoCafe: data.temCafe ? data.descricaoCafe : "Sem café",
        };

        try {
            if (isEditing) {
                await apiReservas.put(`/reservas/${reservaData.id}`, payload);
                toast({ title: 'Reserva Atualizada!', status: 'success', duration: 3000 });
            } else {
                await apiReservas.post('/reservas', payload);
                toast({ title: 'Reserva Criada!', status: 'success', duration: 3000 });
            }
            
            onSaveSuccess(); 
            onClose();

        } catch (error) {
            console.error('Erro na submissão:', error);
            const errorMessage = error.response?.data?.mensagem || 'Erro ao salvar reserva. Verifique os dados.';
            const status = error.response?.status === 409 ? 'warning' : 'error';

            toast({
                title: isEditing ? 'Não foi possível atualizar' : 'Não foi possível criar',
                description: errorMessage,
                status: status,
                duration: 5000,
                isClosable: true
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{isEditing ? 'Editar Reserva' : 'Nova Reserva'}</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <VStack spacing={4}>
                            <HStack w="full" spacing={4}>
                                <FormControl isInvalid={errors.local}>
                                    <FormLabel>Local</FormLabel>
                                    <Input placeholder="Ex: Matriz" {...register('local', { required: 'Local é obrigatório' })} />
                                    <FormErrorMessage>{errors.local?.message}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={errors.sala}>
                                    <FormLabel>Sala</FormLabel>
                                    <Input placeholder="Ex: Sala de Reunião A" {...register('sala', { required: 'Sala é obrigatória' })} />
                                    <FormErrorMessage>{errors.sala?.message}</FormErrorMessage>
                                </FormControl>
                            </HStack>
                            <HStack w="full" spacing={4}>
                                <FormControl isInvalid={errors.dataHoraInicio}>
                                    <FormLabel>Início</FormLabel>
                                    <Input type="datetime-local" {...register('dataHoraInicio', { required: 'Obrigatório' })} />
                                    <FormErrorMessage>{errors.dataHoraInicio?.message}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={errors.dataHoraFim}>
                                    <FormLabel>Fim</FormLabel>
                                    <Input type="datetime-local" {...register('dataHoraFim', { required: 'Obrigatório' })} />
                                    <FormErrorMessage>{errors.dataHoraFim?.message}</FormErrorMessage>
                                </FormControl>
                            </HStack>
                            <HStack w="full" spacing={4}>
                                <FormControl isInvalid={errors.responsavel}>
                                    <FormLabel>Responsável</FormLabel>
                                    <Input placeholder="Nome do responsável" {...register('responsavel', { required: 'Obrigatório' })} />
                                    <FormErrorMessage>{errors.responsavel?.message}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={errors.quantidadeCafe}>
                                    <FormLabel>Participantes</FormLabel>
                                    <Input 
                                        type="number" 
                                        placeholder="Qtd. Pessoas"
                                        {...register('quantidadeCafe', { 
                                            required: 'Informe a quantidade',
                                            min: { value: 1, message: 'Mínimo 1' }
                                        })} 
                                    />
                                    <FormErrorMessage>{errors.quantidadeCafe?.message}</FormErrorMessage>
                                </FormControl>
                            </HStack>

                            {/* Área de Café (Apenas Switch e Descrição agora) */}
                            <Box w="full" p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                                <HStack justify="space-between" mb={2}>
                                    <Text fontWeight="semibold">Adicionar Coffee Break? ☕</Text>
                                    <Switch size="lg" colorScheme="green" {...register('temCafe')} />
                                </HStack>

                                {temCafe && (
                                    <VStack spacing={3} mt={2}>
                                        <FormControl isInvalid={errors.descricaoCafe}>
                                            <FormLabel fontSize="sm">Itens / Descrição do Café</FormLabel>
                                            <Textarea 
                                                bg="white"
                                                placeholder="Ex: Água, café, bolachas..." 
                                                {...register('descricaoCafe', { required: 'Descreva o pedido do café' })} 
                                            />
                                            <FormErrorMessage>{errors.descricaoCafe?.message}</FormErrorMessage>
                                        </FormControl>
                                    </VStack>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme="teal" 
                            type="submit" 
                            isDisabled={isSubmitting}
                        >
                            <span>{isSubmitting ? 'Salvando...' : 'Salvar'}</span>
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default ReservaFormModal;