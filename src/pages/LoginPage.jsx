import { useState, useMemo, useEffect } from 'react'; // Adicionado useEffect
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Adicionado useNavigate
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Spinner
} from '@chakra-ui/react';
import Select from 'react-select'; 
import { parsePhoneNumber, AsYouType, getCountryCallingCode } from 'libphonenumber-js'; 
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { apiReservas, apiAuth } from '../api/apiClient'; 

const WHATSAPP_CONFIG_URL = 'http://localhost:3001'; 
const ADMIN_PASSWORD = "admin4mixmeet"; 
const initialCountry = { value: 'BR', label: '🇧🇷 Brasil (+55)' }; 

const countryOptions = [
    { value: 'US', label: '🇺🇸 USA (+1)' },
    { value: 'BR', label: '🇧🇷 Brasil (+55)' },
    { value: 'PT', label: '🇵🇹 Portugal (+351)' },
];

const LoginPage = () => {
  // Adicionado isAuthenticated para checagem de redirecionamento
  const { requestVerificationCode, verifyAndLogin, isAuthenticated } = useAuth(); 
  const toast = useToast();
  const navigate = useNavigate(); // Hook de navegação
  
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [waExistsStatus, setWaExistsStatus] = useState(null);
  
  const { isOpen: isQROpen, onOpen: onQROpen, onClose: onQRClose } = useDisclosure();
  const [qrValue, setQrValue] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting } 
  } = useForm({ defaultValues: { phoneNumber: '' } });

  const inputPhoneNumber = watch('phoneNumber'); 

  // --- NOVO: Efeito para Redirecionar após Login ---
  useEffect(() => {
    if (isAuthenticated) {
      // Tenta ir para a Home.
      // Se não tiver nickname, o App.jsx vai interceptar e mandar para /setup
      navigate('/'); 
    }
  }, [isAuthenticated, navigate]);
  // ------------------------------------------------

  const formattedNumber = useMemo(() => {
    if (!inputPhoneNumber) return '';
    try {
        const formatter = new AsYouType(selectedCountry.value);
        return formatter.input(inputPhoneNumber);
    } catch (e) {
        return inputPhoneNumber;
    }
  }, [inputPhoneNumber, selectedCountry]);

  const renderStatusIcon = () => {
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {waExistsStatus === 'checking' && <Spinner key="spin" size="sm" color="blue.500" />}
        {waExistsStatus === 'exists' && <Icon key="check" as={FaCheckCircle} color='green.500' />}
        {waExistsStatus === 'not_found' && <Icon key="fail" as={FaTimesCircle} color='red.500' />}
      </span>
    );
  };

  const validateAndFormat = async (value) => {
    if (!value) return false;
    clearErrors('phoneNumber');
    try {
        const parsed = parsePhoneNumber(value, selectedCountry.value);
        return (parsed && parsed.isValid()) ? parsed.number : false;
    } catch (e) {
        return false;
    }
  };

  const checkWaExistence = async (e164Number) => {
    setWaExistsStatus('checking');
    try {
      const response = await apiAuth.post('/check-wa-existence', { phone_number: e164Number });
      if (response.data.exists) {
        setWaExistsStatus('exists');
        return true;
      } else {
        setWaExistsStatus('not_found');
        setError('phoneNumber', { type: 'manual', message: 'Este número não possui WhatsApp.' });
        return false;
      }
    } catch (error) {
      setWaExistsStatus(null);
      return true; 
    }
  }

  const handleRequestCode = async (data) => {
    const e164Number = await validateAndFormat(data.phoneNumber);
    if (!e164Number) {
        setError('phoneNumber', { type: 'manual', message: 'Número inválido.' });
        return;
    }
    
    try {
        const exists = await checkWaExistence(e164Number);
        if (!exists) return; 

        await requestVerificationCode(e164Number); 
        setPhoneNumber(e164Number);
        setStep(2); 
        
        toast({
            title: 'Código Enviado!',
            description: `Verifique seu WhatsApp.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
    } catch (error) {
        const errorMsg = error.response?.data?.detail || error.message || "Falha desconhecida.";
        let userMsg = "Falha na solicitação.";
        let status = "error";

        if (error.response?.status === 503 || errorMsg.includes("Whatsapp indisponivel")) {
             userMsg = "WhatsApp indisponível no momento, contate o administrador do sistema.";
             status = "warning";
        } else if (error.response?.status === 500) {
             userMsg = "Erro interno no servidor.";
        }

        toast({ title: 'Atenção', description: userMsg, status: status, duration: 6000, isClosable: true });
    }
  };

  const handleVerifyCode = async (data) => {
    try {
      await verifyAndLogin(phoneNumber, data.code);
      toast({ title: 'Login bem-sucedido!', status: 'success', duration: 2000 });
      // O useEffect acima cuidará do redirecionamento agora
    } catch (error) {
      toast({ title: 'Código Inválido', status: 'error', duration: 4000, isClosable: true });
    }
  };

  const handleAdminQRCode = async () => {
    const adminPassword = prompt("Senha de Administrador:");
    if (adminPassword !== ADMIN_PASSWORD) {
        toast({ title: 'Acesso Negado', status: 'error' });
        return;
    }
    setIsAdminLoading(true);
    try {
        const response = await apiReservas.get(`${WHATSAPP_CONFIG_URL}/api/whatsapp/status`); 
        if (response.data.qr) {
            setQrValue(response.data.qr);
            onQROpen();
        } else if (response.data.ready) {
             toast({ title: 'Conectado!', description: 'WhatsApp online.', status: 'success' });
        } else {
             toast({ title: 'Aguarde...', description: 'Serviço iniciando.', status: 'warning' });
        }
    } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao conectar com serviço WhatsApp.', status: 'error' });
    } finally {
        setIsAdminLoading(false);
    }
  };

  const isPrimaryLoading = isSubmitting || waExistsStatus === 'checking';

  return (
    <Container centerContent p={8}>
      <Box p={8} maxWidth="450px" w="full" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
        <VStack spacing={4}>
          <Heading size="lg">MixMeet Acesso</Heading>
          <Text color="gray.500" fontSize="sm">
            {step === 1 ? 'Validação segura via WhatsApp' : `Digite o código enviado para ${phoneNumber}`}
          </Text>
        </VStack>

        {step === 1 && (
          <form onSubmit={handleSubmit(handleRequestCode)} style={{ width: '100%' }}>
            <VStack spacing={4} mt={6}>
              <FormControl>
                <FormLabel>País</FormLabel>
                <Select
                    options={countryOptions}
                    defaultValue={selectedCountry}
                    onChange={(option) => setSelectedCountry(option)}
                    styles={{ control: (base) => ({ ...base, minHeight: '40px' }) }}
                />
              </FormControl>

              <FormControl isInvalid={errors.phoneNumber || waExistsStatus === 'not_found'}>
                <FormLabel>WhatsApp</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents='none' width="4.5rem">
                        <Text color="gray.500" fontWeight="bold">
                           +{getCountryCallingCode(selectedCountry.value)}
                        </Text>
                    </InputLeftElement>
                    <Input
                      pl="4.5rem"
                      placeholder="DDD + Número"
                      value={formattedNumber}
                      {...register('phoneNumber', {
                        required: 'Obrigatório',
                        onChange: (e) => {
                            setValue('phoneNumber', e.target.value.replace(/\D/g, ''), { shouldValidate: true });
                            setWaExistsStatus(null); 
                        }
                      })}
                    />
                    <InputRightElement>
                        {renderStatusIcon()}
                    </InputRightElement>
                </InputGroup>
                <Text color="red.500" fontSize="xs" mt={1}>{errors.phoneNumber?.message}</Text>
              </FormControl>

              <Button 
                type="submit" 
                colorScheme="teal" 
                width="full"
                isDisabled={isPrimaryLoading} 
              >
                <span>{isPrimaryLoading ? <Spinner size="sm" /> : "Continuar"}</span>
              </Button>
            </VStack>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(handleVerifyCode)} style={{ width: '100%' }}>
            <VStack spacing={4} mt={6}>
              <FormControl isInvalid={errors.code}>
                <FormLabel textAlign="center">Código de 6 dígitos</FormLabel>
                <Input
                  textAlign="center"
                  letterSpacing="0.5em"
                  placeholder="000000"
                  maxLength={6}
                  fontSize="2xl"
                  {...register('code', { required: 'Obrigatório', minLength: { value: 6, message: '6 dígitos necessários' } })}
                />
              </FormControl>

              <Button 
                type="submit" 
                colorScheme="green" 
                width="full"
                isDisabled={isSubmitting}
              >
                 <span>{isSubmitting ? <Spinner size="sm" /> : "Verificar"}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setStep(1); setWaExistsStatus(null); }} 
                isDisabled={isSubmitting}
              >
                <span>Trocar número</span>
              </Button>
            </VStack>
          </form>
        )}
      </Box>

      <Box mt={8}>
          <Button variant="link" size="xs" color="gray.400" onClick={handleAdminQRCode} isDisabled={isAdminLoading}>
              <span>{isAdminLoading ? "Carregando..." : "Configuração do Sistema (Admin)"}</span>
          </Button>
      </Box>

      <Modal isOpen={isQROpen} onClose={onQRClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent>
              <ModalHeader>Conectar WhatsApp</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6} textAlign="center">
                  {qrValue ? (
                      <VStack spacing={4}>
                          <Text fontSize="sm">Escaneie no seu WhatsApp (Aparelhos conectados)</Text>
                          <Box p={4} borderWidth="1px" borderColor="gray.200" borderRadius="md">
                              <img src={qrValue} alt="QR Code" style={{ width: '256px', height: '256px' }} />
                          </Box>
                      </VStack>
                  ) : ( <Text>Carregando...</Text> )}
              </ModalBody>
          </ModalContent>
      </Modal>
    </Container>
  );
};

export default LoginPage;