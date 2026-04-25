import React from 'react';
import { Box, Text, Heading, VStack, HStack, Grid, GridItem, Badge, UnorderedList, ListItem, Progress } from '@chakra-ui/react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
}

interface TechTemplateProps {
  data: ResumeData;
}

const TechTemplate: React.FC<TechTemplateProps> = ({ data }) => {
  const getSkillLevel = (skill: string) => {
    // Mock skill levels - in a real app, this would come from user input
    const skillLevels: { [key: string]: number } = {
      'JavaScript': 90,
      'React': 85,
      'Node.js': 80,
      'TypeScript': 75,
      'Python': 70,
      'Docker': 65,
      'AWS': 60,
      'MongoDB': 75,
      'PostgreSQL': 70,
      'Git': 95,
      'Linux': 80,
      'GraphQL': 60,
      'Next.js': 80,
      'Vue.js': 60,
      'Angular': 55,
      'Express.js': 85,
      'Redis': 65,
      'Kubernetes': 50,
      'CI/CD': 70,
      'Jest': 75,
      'Cypress': 65,
      'Webpack': 60,
      'Sass': 80,
      'Tailwind CSS': 85,
      'Firebase': 70,
      'Stripe': 60,
      'RESTful APIs': 90,
      'Microservices': 65,
      'Agile': 80,
      'Scrum': 75
    };
    return skillLevels[skill] || 70;
  };

  return (
    <Box 
      maxW="8.5in" 
      minH="11in" 
      mx="auto" 
      bg="white" 
      color="black"
      fontFamily="'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
      fontSize="10px"
      lineHeight="1.5"
    >
      {/* Header */}
      <Box bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" color="white" p={8}>
        <VStack spacing={4} align="center">
          <Heading 
            as="h1" 
            fontSize="28px" 
            fontWeight="700" 
            textAlign="center"
            letterSpacing="1px"
            fontFamily="'JetBrains Mono', monospace"
          >
            &lt;{data.personalInfo.fullName}/&gt;
          </Heading>
          
          <Text fontSize="14px" color="cyan.300" fontWeight="500">
            // Full-Stack Developer
          </Text>
          
          <HStack spacing={6} fontSize="11px" wrap="wrap" justify="center" color="gray.300">
            <Text>📧 {data.personalInfo.email}</Text>
            <Text>📱 {data.personalInfo.phone}</Text>
            <Text>📍 {data.personalInfo.location}</Text>
            {data.personalInfo.github && (
              <Text>🔗 {data.personalInfo.github}</Text>
            )}
            {data.personalInfo.portfolio && (
              <Text>🌐 {data.personalInfo.portfolio}</Text>
            )}
          </HStack>
        </VStack>
      </Box>

      <Box p={8}>
        {/* Summary */}
        {data.summary && (
          <Box mb={8} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
            <Heading 
              as="h2" 
              fontSize="16px" 
              fontWeight="700" 
              mb={3} 
              color="black"
              fontFamily="'JetBrains Mono', monospace"
            >
              // About Me
            </Heading>
            <Text fontSize="11px" color="gray.700" lineHeight="1.6">
              {data.summary}
            </Text>
          </Box>
        )}

        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
          {/* Left Column */}
          <GridItem>
            {/* Experience */}
            {data.experience.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  fontSize="16px" 
                  fontWeight="700" 
                  mb={4} 
                  color="black"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  // Experience
                </Heading>
                <VStack spacing={6} align="stretch">
                  {data.experience.map((exp) => (
                    <Box key={exp.id} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full" align="start">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="700" fontSize="13px" color="black" fontFamily="'JetBrains Mono', monospace">
                              {exp.title}
                            </Text>
                            <Text fontSize="12px" color="blue.600" fontWeight="600">
                              {exp.company}
                            </Text>
                            <Text fontSize="10px" color="gray.600">
                              {exp.location}
                            </Text>
                          </VStack>
                          <Badge 
                            bg="blue.100" 
                            color="blue.800" 
                            fontSize="9px" 
                            px={2} 
                            py={1}
                            borderRadius="md"
                            fontFamily="'JetBrains Mono', monospace"
                          >
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </Badge>
                        </HStack>
                        <Text fontSize="10px" color="gray.700" textAlign="justify" mt={2}>
                          {exp.description}
                        </Text>
                        {exp.achievements.length > 0 && (
                          <Box mt={2}>
                            <Text fontSize="10px" color="gray.600" fontWeight="600" mb={1}>
                              Key Achievements:
                            </Text>
                            <UnorderedList ml={4} fontSize="10px" color="gray.700">
                              {exp.achievements.map((achievement, index) => (
                                <ListItem key={index} mb={1}>
                                  {achievement}
                                </ListItem>
                              ))}
                            </UnorderedList>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  fontSize="16px" 
                  fontWeight="700" 
                  mb={4} 
                  color="black"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  // Projects
                </Heading>
                <VStack spacing={4} align="stretch">
                  {data.projects.map((project) => (
                    <Box key={project.id} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full" align="start">
                          <Text fontWeight="700" fontSize="13px" color="black" fontFamily="'JetBrains Mono', monospace">
                            {project.name}
                          </Text>
                          <HStack spacing={2}>
                            {project.url && (
                              <Badge bg="green.100" color="green.800" fontSize="8px" px={2} py={1} borderRadius="md">
                                🔗 Live
                              </Badge>
                            )}
                            {project.github && (
                              <Badge bg="gray.100" color="gray.800" fontSize="8px" px={2} py={1} borderRadius="md">
                                📂 Code
                              </Badge>
                            )}
                          </HStack>
                        </HStack>
                        <Text fontSize="10px" color="gray.700" textAlign="justify">
                          {project.description}
                        </Text>
                        <Box>
                          <Text fontSize="9px" color="gray.600" fontWeight="600" mb={1}>
                            Tech Stack:
                          </Text>
                          <HStack spacing={1} wrap="wrap">
                            {project.technologies.map((tech, index) => (
                              <Badge 
                                key={index}
                                bg="blue.600" 
                                color="white" 
                                fontSize="8px" 
                                px={2} 
                                py={1}
                                borderRadius="md"
                                fontFamily="'JetBrains Mono', monospace"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </GridItem>

          {/* Right Column */}
          <GridItem>
            {/* Skills */}
            {data.skills.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  fontSize="16px" 
                  fontWeight="700" 
                  mb={4} 
                  color="black"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  // Skills
                </Heading>
                <VStack spacing={4} align="stretch">
                  {data.skills.map((skillCategory, index) => (
                    <Box key={index} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <Text fontWeight="700" fontSize="11px" color="black" mb={3} fontFamily="'JetBrains Mono', monospace">
                        {skillCategory.category}
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {skillCategory.items.map((skill, skillIndex) => (
                          <Box key={skillIndex}>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="9px" color="gray.700" fontFamily="'JetBrains Mono', monospace">
                                {skill}
                              </Text>
                              <Text fontSize="8px" color="gray.500">
                                {getSkillLevel(skill)}%
                              </Text>
                            </HStack>
                            <Progress 
                              value={getSkillLevel(skill)} 
                              size="sm" 
                              colorScheme="blue"
                              borderRadius="full"
                              bg="gray.200"
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  fontSize="16px" 
                  fontWeight="700" 
                  mb={4} 
                  color="black"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  // Education
                </Heading>
                <VStack spacing={4} align="stretch">
                  {data.education.map((edu) => (
                    <Box key={edu.id} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="700" fontSize="11px" color="black" fontFamily="'JetBrains Mono', monospace">
                          {edu.degree}
                        </Text>
                        <Text fontSize="10px" color="blue.600" fontWeight="600">
                          {edu.institution}
                        </Text>
                        <Text fontSize="9px" color="gray.600">
                          {edu.location}
                        </Text>
                        <Badge 
                          bg="gray.100" 
                          color="gray.700" 
                          fontSize="8px" 
                          px={2} 
                          py={1}
                          borderRadius="md"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {edu.startDate} - {edu.endDate}
                        </Badge>
                        {edu.gpa && (
                          <Text fontSize="9px" color="gray.700" fontWeight="600">
                            GPA: {edu.gpa}
                          </Text>
                        )}
                        {edu.honors && (
                          <Text fontSize="9px" color="gray.700" fontStyle="italic">
                            {edu.honors}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  fontSize="16px" 
                  fontWeight="700" 
                  mb={4} 
                  color="black"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  // Certifications
                </Heading>
                <VStack spacing={3} align="stretch">
                  {data.certifications.map((cert) => (
                    <Box key={cert.id} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="700" fontSize="10px" color="black" fontFamily="'JetBrains Mono', monospace">
                          {cert.name}
                        </Text>
                        <Text fontSize="9px" color="blue.600" fontWeight="600">
                          {cert.issuer}
                        </Text>
                        <Badge 
                          bg="green.100" 
                          color="green.800" 
                          fontSize="8px" 
                          px={2} 
                          py={1}
                          borderRadius="md"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {cert.date}
                        </Badge>
                        {cert.credentialId && (
                          <Text fontSize="8px" color="gray.600" fontFamily="'JetBrains Mono', monospace">
                            ID: {cert.credentialId}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  fontSize="16px" 
                  fontWeight="700" 
                  mb={4} 
                  color="black"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  // Languages
                </Heading>
                <VStack spacing={3} align="stretch">
                  {data.languages.map((lang, index) => (
                    <Box key={index} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <HStack justify="space-between">
                        <Text fontSize="10px" color="black" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
                          {lang.name}
                        </Text>
                        <Badge 
                          bg="purple.100" 
                          color="purple.800" 
                          fontSize="8px" 
                          px={2} 
                          py={1}
                          borderRadius="md"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {lang.proficiency}
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </GridItem>
        </Grid>

        {/* Footer */}
        <Box mt={8} p={4} bg="gray.900" color="white" borderRadius="md" textAlign="center">
          <Text fontSize="10px" fontFamily="'JetBrains Mono', monospace">
            console.log("Thanks for reviewing my resume! 🚀");
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default TechTemplate; 