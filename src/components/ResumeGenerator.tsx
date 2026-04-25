import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Select,
  Input,
  FormControl,
  FormLabel,
  HStack,
  useColorModeValue,
  SimpleGrid,
  useToast,
  Textarea,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { generateGroqText } from '../api/groq';
import { useAuth } from '../context/AuthContext';

// @ts-ignore
const MotionBox = motion(Box);

type ShadowResult = {
  portfolio_text?: string;
  strengths?: string[];
};

const ResumeGenerator: React.FC = () => {
  const toast = useToast();
  const { user, userData } = useAuth();
  const [fullName, setFullName] = useState(user?.displayName || userData?.displayName || '');
  const [emailInput, setEmailInput] = useState(user?.email || (userData as any)?.email || '');
  const [targetPosition, setTargetPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [resumeStyle, setResumeStyle] = useState('modern');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const shadowResult = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('shadowResult') || 'null') as ShadowResult | null;
    } catch {
      return null;
    }
  }, []);

  const bgColor = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('black', 'white');
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  const buttonHoverBg = useColorModeValue('gray.800', 'gray.200');
  const fieldBg = useColorModeValue('white', 'gray.900');
  const fieldText = useColorModeValue('black', 'white');
  const previewBg = useColorModeValue('gray.50', 'gray.900');

  const handleGenerateResume = async () => {
    if (!fullName.trim() || !emailInput.trim() || !targetPosition || !industry) {
      toast({
        title: 'Заполните поля',
        description: 'Укажи имя, email, целевую должность и отрасль.',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const name = fullName.trim();
      const email = emailInput.trim();
      const city = (userData as any)?.city || '';
      const phone = (userData as any)?.phone || '';
      const about = shadowResult?.portfolio_text || '';
      const strengths = shadowResult?.strengths?.join(', ') || '';
      const candidateDataLines = [
        name ? `Name: ${name}` : '',
        email ? `Email: ${email}` : '',
        phone ? `Phone: ${phone}` : '',
        city ? `City: ${city}` : '',
        `Target position: ${targetPosition}`,
        `Industry: ${industry}`,
        `Style preference: ${resumeStyle}`,
        about ? `About: ${about}` : '',
        strengths ? `Strengths: ${strengths}` : '',
        skills ? `Skills: ${skills}` : '',
        experience ? `Experience/projects: ${experience}` : '',
        education ? `Education: ${education}` : '',
      ].filter(Boolean);

      const prompt = `
Create a polished one-page CV for a school/early-career candidate.
Do not invent fake facts. Keep concise and recruiter-ready.
Language: Russian.

Required structure:
FULL NAME
CONTACT
EDUCATION
EXPERIENCE
LEADERSHIP & PROJECTS
ACHIEVEMENTS
SKILLS
PROFILE SUMMARY

Candidate data:
${candidateDataLines.join('\n')}

Strict rule:
- Never output placeholder values like "Candidate Name", "email@example.com", "N/A", "—".
- If some contact data is missing, just omit it cleanly.
      `.trim();

      const text = await generateGroqText(prompt, {
        systemPrompt:
          'You are an elite resume writer for students in Kazakhstan. Output clean plain text CV sections.',
        temperature: 0.4,
        maxTokens: 1800,
      });

      setGeneratedResume(text.trim());
      toast({
        title: 'Резюме готово',
        description: 'AI сгенерировал CV в профессиональном формате.',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка генерации',
        description: 'Не удалось получить ответ от Groq API.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'respawn-cv.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!generatedResume.trim()) return;
    setIsDownloadingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const html = `
        <div style="font-family: Arial, sans-serif; color:#111; line-height:1.45; padding:24px; white-space:pre-wrap;">
          ${generatedResume
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')}
        </div>
      `;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      await html2pdf()
        .from(wrapper)
        .set({
          margin: 10,
          filename: 'respawn-cv.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .save();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={12} px={4}>
      <Container maxW="container.xl">
        <VStack spacing={10}>
          <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} textAlign="center" w="full">
            <Heading as="h1" fontSize="3xl" fontWeight="light" mb={4} color={headingColor}>
              <Box as="span" fontWeight="thin">AI-генератор</Box>
              <Box as="span" fontWeight="bold" ml={2}>резюме</Box>
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="3xl" mx="auto">
              Компонент взят из твоего архива и подключен к Groq API для реальной генерации CV.
            </Text>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            w="full"
            maxW="3xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color={textColor}>Имя и фамилия</FormLabel>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Например: Olzhas Zhailybay"
                  bg={fieldBg}
                  color={fieldText}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Например: you@mail.com"
                  bg={fieldBg}
                  color={fieldText}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Целевая должность</FormLabel>
                <Input
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="Например: Product Manager Intern"
                  bg={fieldBg}
                  color={fieldText}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Отрасль</FormLabel>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Например: EdTech"
                  bg={fieldBg}
                  color={fieldText}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Стиль</FormLabel>
                <Select value={resumeStyle} onChange={(e) => setResumeStyle(e.target.value)} bg={fieldBg} color={fieldText}>
                  <option value="modern">Современный</option>
                  <option value="classic">Классический</option>
                  <option value="creative">Креативный</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                <Textarea value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Образование" rows={4} bg={fieldBg} color={fieldText} />
                <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Опыт / проекты" rows={4} bg={fieldBg} color={fieldText} />
              </SimpleGrid>

              <Textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Навыки (через запятую)" rows={3} bg={fieldBg} color={fieldText} />

              <Button
                onClick={handleGenerateResume}
                isLoading={isGenerating}
                loadingText="Генерация..."
                bg={buttonBg}
                color={buttonColor}
                _hover={{ bg: buttonHoverBg }}
                w="full"
              >
                Создать резюме через Groq
              </Button>
            </VStack>
          </MotionBox>

          {generatedResume && (
            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              bg={cardBg}
              p={8}
              borderRadius="xl"
              boxShadow="xl"
              w="full"
              maxW="5xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md" color={headingColor}>Готовое CV</Heading>
                  <HStack>
                    <Button onClick={handleDownload} variant="outline" borderColor={borderColor}>
                      Скачать TXT
                    </Button>
                    <Button
                      onClick={() => void handleDownloadPdf()}
                      isLoading={isDownloadingPdf}
                      loadingText="PDF..."
                      variant="outline"
                      borderColor={borderColor}
                    >
                      Скачать PDF
                    </Button>
                  </HStack>
                </HStack>
                <Box whiteSpace="pre-wrap" fontSize="sm" color={fieldText} bg={previewBg} p={4} borderRadius="md">
                  {generatedResume}
                </Box>
              </VStack>
            </MotionBox>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ResumeGenerator;

