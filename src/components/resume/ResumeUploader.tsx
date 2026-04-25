import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Input,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Progress,
  Button,
  Flex,
  Badge,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  keyframes,
} from '@chakra-ui/react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import {
  FaFileUpload,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { BiTrash } from 'react-icons/bi';
import { BsCloudUpload, BsFileEarmarkPdf, BsFileEarmarkWord, BsFileEarmarkText } from 'react-icons/bs';
import { RiFileWarningLine } from 'react-icons/ri';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionFlex = motion(Flex);
// @ts-ignore - motion() works with Chakra UI components
const MotionText = motion(Text);

// Define keyframes for the pulse animation
const pulseRing = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0.1;
  }
`;

interface ResumeUploaderProps {
  onUploadComplete: (url: string, fileName: string, file: File) => void;
  isAnalyzing?: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUploadComplete, isAnalyzing = false }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const circleAnimation = useAnimation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBorderColor = useColorModeValue('black', 'white');
  const inactiveBorderColor = useColorModeValue('gray.300', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('black', 'white');
  const pulseColor = useColorModeValue('gray.200', 'gray.700');
  
  const auth = getAuth();
  const storage = getStorage();
  
  // File types
  const acceptedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  
  const fileTypeIcons: Record<string, any> = {
    'application/pdf': BsFileEarmarkPdf,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': BsFileEarmarkWord,
    'text/plain': BsFileEarmarkText,
  };
  
  const fileTypeColors: Record<string, string> = {
    'application/pdf': 'red',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'blue',
    'text/plain': 'gray',
  };
  
  // Animate circle when dragging
  useEffect(() => {
    if (dragActive) {
      circleAnimation.start({
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
        transition: { 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }
      });
    } else {
      circleAnimation.stop();
    }
  }, [dragActive, circleAnimation]);
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };
  
  const handleFiles = (file: File) => {
    setUploadError(null);
    
    // Check file type
    if (!acceptedFileTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload PDF, DOCX, or TXT files only.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size is 5MB.');
      return;
    }
    
    setSelectedFile(file);
    setUploadProgress(0);
    setIsUploading(true);
    uploadFileToStorage(file);
  };
  
  const uploadFileToStorage = async (file: File) => {
    if (!auth.currentUser) {
      setUploadError('You must be logged in to upload files');
      setIsUploading(false);
      return;
    }
    
    try {
      const fileRef = ref(storage, `resumes/${auth.currentUser.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadError('Failed to upload file. Please try again.');
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onUploadComplete(downloadURL, file.name, file);
            setIsUploading(false);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadError('Failed to process uploaded file.');
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError('An error occurred during file upload.');
      setIsUploading(false);
    }
  };
  
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsUploading(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const getFileTypeLabel = (file: File): string => {
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    if (file.type === 'text/plain') return 'TXT';
    return 'Unknown';
  };
  
  return (
    <VStack spacing={4} align="stretch">
      <AnimatePresence>
        {!selectedFile && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            position="relative"
            overflow="hidden"
            borderRadius="xl"
          >
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              borderWidth={2}
              borderStyle="dashed"
              borderColor={dragActive ? activeBorderColor : borderColor}
              borderRadius="xl"
              p={6}
              bg={useColorModeValue('gray.50', 'gray.800')}
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ borderColor: activeBorderColor, transform: 'translateY(-2px)' }}
              onClick={handleButtonClick}
              position="relative"
              zIndex={2}
              boxShadow={dragActive ? "md" : "none"}
            >
              <Input
                ref={inputRef}
                type="file"
                height="100%"
                width="100%"
                position="absolute"
                top="0"
                left="0"
                opacity="0"
                aria-hidden="true"
                accept=".pdf,.docx,.txt"
                onChange={handleChange}
                disabled={isAnalyzing}
              />
              
              <VStack spacing={4} py={8}>
                <MotionBox
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  position="relative"
                >
                  {/* Pulsing circle behind icon */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    width="60px"
                    height="60px"
                    borderRadius="full"
                    bg={pulseColor}
                    opacity="0.3"
                    animation={`${pulseRing} 2s infinite`}
                  />
                  
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    bg={useColorModeValue('gray.50', 'gray.800')}
                    borderRadius="full"
                    boxSize="70px"
                    boxShadow="md"
                  >
                    <Icon as={BsCloudUpload} boxSize={8} color={iconColor} />
                  </Flex>
                </MotionBox>
                
                <MotionText
                  fontWeight="bold"
                  color={textColor}
                  fontSize="lg"
                  animate={{ scale: dragActive ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {dragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </MotionText>
                
                <Text fontSize="sm" color={textColor}>
                  or click to browse files from your computer
                </Text>
                
                <HStack spacing={3} mt={2}>
                  <Tooltip label="PDF files" placement="top">
                    <Flex direction="column" align="center">
                      <Icon as={BsFileEarmarkPdf} color={useColorModeValue('black', 'white')} boxSize={5} mb={1} />
                      <Badge colorScheme="red" variant="subtle" px={2} borderRadius="full">PDF</Badge>
                    </Flex>
                  </Tooltip>
                  
                  <Tooltip label="Word documents" placement="top">
                    <Flex direction="column" align="center">
                      <Icon as={BsFileEarmarkWord} color={useColorModeValue('black', 'white')} boxSize={5} mb={1} />
                      <Badge colorScheme="gray" variant="subtle" px={2} borderRadius="full">DOCX</Badge>
                    </Flex>
                  </Tooltip>
                  
                  <Tooltip label="Text files" placement="top">
                    <Flex direction="column" align="center">
                      <Icon as={BsFileEarmarkText} color="gray.500" boxSize={5} mb={1} />
                      <Badge colorScheme="gray" variant="subtle" px={2} borderRadius="full">TXT</Badge>
                    </Flex>
                  </Tooltip>
                </HStack>
              </VStack>
            </Box>
            
            {/* Animated background circle */}
            <MotionBox
              position="absolute"
              top="50%"
              left="50%"
              width="180px"
              height="180px"
              borderRadius="full"
              bg={useColorModeValue('gray.50', 'gray.800')}
              zIndex={1}
              initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 0.2 }}
              animate={circleAnimation}
            />
          </MotionBox>
        )}
        
        {selectedFile && (
          <MotionFlex
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            direction="column"
            borderWidth={1}
            borderRadius="xl"
            borderColor={borderColor}
            p={5}
            bg={bgColor}
            boxShadow="sm"
          >
            <HStack spacing={4} mb={4}>
              <Flex
                bg={`${fileTypeColors[selectedFile.type]}.50`}
                color={`${fileTypeColors[selectedFile.type]}.500`}
                p={3}
                borderRadius="lg"
                boxSize="50px"
                align="center"
                justify="center"
              >
                <Icon 
                  as={fileTypeIcons[selectedFile.type] || FaFileAlt} 
                  boxSize={6}
                />
              </Flex>
              
              <VStack align="flex-start" spacing={1} flex={1}>
                <Text fontWeight="medium" noOfLines={1}>
                  {selectedFile.name}
                </Text>
                <HStack spacing={2}>
                  <Badge 
                    colorScheme={fileTypeColors[selectedFile.type] || 'gray'} 
                    variant="subtle" 
                    borderRadius="full"
                  >
                    {getFileTypeLabel(selectedFile)}
                  </Badge>
                  <Text fontSize="xs" color={textColor}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </HStack>
              </VStack>
              
              {!isAnalyzing && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={clearFile}
                  leftIcon={<BiTrash />}
                  _hover={{ bg: 'red.50' }}
                >
                  Remove
                </Button>
              )}
            </HStack>
            
            {isUploading ? (
              <Box>
                <HStack spacing={4} align="center" mb={2}>
                  <CircularProgress 
                    value={uploadProgress} 
                    color={useColorModeValue('black', 'white')} 
                    size="40px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontSize="xs" fontWeight="bold">
                      {Math.round(uploadProgress)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Uploading resume...
                    </Text>
                    <Progress 
                      value={uploadProgress} 
                      size="xs" 
                      colorScheme="gray" 
                      borderRadius="full" 
                    />
                  </Box>
                </HStack>
              </Box>
            ) : !isAnalyzing ? (
              <HStack color="green.500" spacing={2}>
                <Icon as={FaCheck} />
                <Text fontSize="sm">Resume uploaded successfully</Text>
              </HStack>
            ) : null}
          </MotionFlex>
        )}
      </AnimatePresence>
      
      {uploadError && (
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          bg={useColorModeValue('red.50', 'red.900')}
          color={useColorModeValue('red.500', 'red.200')}
          p={4}
          borderRadius="md"
          mt={2}
          boxShadow="sm"
        >
          <HStack spacing={3}>
            <Icon as={RiFileWarningLine} boxSize={5} />
            <Text fontSize="sm" fontWeight="medium">{uploadError}</Text>
          </HStack>
        </MotionBox>
      )}
    </VStack>
  );
};

export default ResumeUploader; 