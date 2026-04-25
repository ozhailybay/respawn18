import React from 'react';
import { Box, Text, Heading, VStack, HStack, Grid, GridItem, Badge, UnorderedList, ListItem, Circle } from '@chakra-ui/react';

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

interface ModernTemplateProps {
  data: ResumeData;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  return (
    <Box 
      maxW="8.5in" 
      minH="11in" 
      mx="auto" 
      bg="white" 
      color="black"
      fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      fontSize="11px"
      lineHeight="1.5"
    >
      {/* Header Section */}
      <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" p={8}>
        <VStack spacing={4} align="center">
          <Heading 
            as="h1" 
            size="2xl" 
            fontWeight="300" 
            textAlign="center"
            letterSpacing="2px"
          >
            {data.personalInfo.fullName}
          </Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="full" maxW="600px">
            <GridItem>
              <Text fontSize="12px" textAlign="center">
                📧 {data.personalInfo.email}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="12px" textAlign="center">
                📱 {data.personalInfo.phone}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="12px" textAlign="center">
                📍 {data.personalInfo.location}
              </Text>
            </GridItem>
            {data.personalInfo.linkedIn && (
              <GridItem>
                <Text fontSize="12px" textAlign="center">
                  🔗 {data.personalInfo.linkedIn}
                </Text>
              </GridItem>
            )}
          </Grid>
        </VStack>
      </Box>

      <Box p={8}>
        {/* Professional Summary */}
        {data.summary && (
          <Box mb={8}>
            <Heading 
              as="h2" 
              size="lg" 
              fontWeight="600" 
              mb={4} 
              color="#667eea"
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '60px',
                height: '3px',
                bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }}
            >
              About Me
            </Heading>
            <Text fontSize="12px" textAlign="justify" color="gray.700" mt={6}>
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
                  size="lg" 
                  fontWeight="600" 
                  mb={4} 
                  color="#667eea"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '60px',
                    height: '3px',
                    bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '2px'
                  }}
                >
                  Experience
                </Heading>
                <VStack spacing={6} align="stretch" mt={6}>
                  {data.experience.map((exp) => (
                    <Box key={exp.id} position="relative" pl={6}>
                      <Circle 
                        size="12px" 
                        bg="#667eea" 
                        position="absolute" 
                        left="0" 
                        top="2px"
                      />
                      <VStack align="start" spacing={1}>
                        <HStack justify="space-between" w="full" align="start">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600" fontSize="13px" color="black">
                              {exp.title}
                            </Text>
                            <Text fontWeight="500" fontSize="12px" color="#667eea">
                              {exp.company}
                            </Text>
                            <Text fontSize="11px" color="gray.600">
                              {exp.location}
                            </Text>
                          </VStack>
                          <Badge 
                            bg="gray.100" 
                            color="gray.700" 
                            fontSize="10px" 
                            px={2} 
                            py={1}
                            borderRadius="full"
                          >
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </Badge>
                        </HStack>
                        <Text fontSize="11px" color="gray.700" textAlign="justify" mt={2}>
                          {exp.description}
                        </Text>
                        {exp.achievements.length > 0 && (
                          <UnorderedList ml={4} fontSize="11px" color="gray.700" mt={2}>
                            {exp.achievements.map((achievement, index) => (
                              <ListItem key={index} mb={1}>
                                {achievement}
                              </ListItem>
                            ))}
                          </UnorderedList>
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
                  size="lg" 
                  fontWeight="600" 
                  mb={4} 
                  color="#667eea"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '60px',
                    height: '3px',
                    bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '2px'
                  }}
                >
                  Projects
                </Heading>
                <VStack spacing={4} align="stretch" mt={6}>
                  {data.projects.map((project) => (
                    <Box key={project.id} p={4} borderRadius="lg" bg="gray.50" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="600" fontSize="13px" color="black">
                            {project.name}
                          </Text>
                          {project.url && (
                            <Text fontSize="10px" color="#667eea" fontWeight="500">
                              🔗 Live Demo
                            </Text>
                          )}
                        </HStack>
                        <Text fontSize="11px" color="gray.700" textAlign="justify">
                          {project.description}
                        </Text>
                        <HStack spacing={2} wrap="wrap">
                          {project.technologies.map((tech, index) => (
                            <Badge 
                              key={index}
                              bg="#667eea" 
                              color="white" 
                              fontSize="9px" 
                              px={2} 
                              py={1}
                              borderRadius="full"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </GridItem>

          {/* Right Column */}
          <GridItem>
            {/* Education */}
            {data.education.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  size="md" 
                  fontWeight="600" 
                  mb={4} 
                  color="#667eea"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '40px',
                    height: '3px',
                    bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '2px'
                  }}
                >
                  Education
                </Heading>
                <VStack spacing={4} align="stretch" mt={6}>
                  {data.education.map((edu) => (
                    <Box key={edu.id} p={4} borderRadius="lg" bg="gray.50" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" fontSize="12px" color="black">
                          {edu.degree}
                        </Text>
                        <Text fontSize="11px" color="#667eea" fontWeight="500">
                          {edu.institution}
                        </Text>
                        <Text fontSize="10px" color="gray.600">
                          {edu.location}
                        </Text>
                        <Badge 
                          bg="gray.100" 
                          color="gray.700" 
                          fontSize="9px" 
                          px={2} 
                          py={1}
                          borderRadius="full"
                        >
                          {edu.startDate} - {edu.endDate}
                        </Badge>
                        {edu.gpa && (
                          <Text fontSize="10px" color="gray.700" fontWeight="500">
                            GPA: {edu.gpa}
                          </Text>
                        )}
                        {edu.honors && (
                          <Text fontSize="10px" color="gray.700" fontStyle="italic">
                            {edu.honors}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
              <Box mb={8}>
                <Heading 
                  as="h2" 
                  size="md" 
                  fontWeight="600" 
                  mb={4} 
                  color="#667eea"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '40px',
                    height: '3px',
                    bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '2px'
                  }}
                >
                  Skills
                </Heading>
                <VStack spacing={4} align="stretch" mt={6}>
                  {data.skills.map((skillCategory, index) => (
                    <Box key={index}>
                      <Text fontWeight="600" fontSize="12px" color="black" mb={2}>
                        {skillCategory.category}
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {skillCategory.items.map((skill, skillIndex) => (
                          <HStack key={skillIndex} justify="space-between">
                            <Text fontSize="11px" color="gray.700">
                              {skill}
                            </Text>
                            <Box w="60px" h="6px" bg="gray.200" borderRadius="full">
                              <Box 
                                w="80%" 
                                h="100%" 
                                bg="linear-gradient(90deg, #667eea, #764ba2)" 
                                borderRadius="full"
                              />
                            </Box>
                          </HStack>
                        ))}
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
                  size="md" 
                  fontWeight="600" 
                  mb={4} 
                  color="#667eea"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '40px',
                    height: '3px',
                    bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '2px'
                  }}
                >
                  Certifications
                </Heading>
                <VStack spacing={3} align="stretch" mt={6}>
                  {data.certifications.map((cert) => (
                    <Box key={cert.id} p={3} borderRadius="lg" bg="gray.50" border="1px solid" borderColor="gray.200">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" fontSize="11px" color="black">
                          {cert.name}
                        </Text>
                        <Text fontSize="10px" color="#667eea" fontWeight="500">
                          {cert.issuer}
                        </Text>
                        <Badge 
                          bg="gray.100" 
                          color="gray.700" 
                          fontSize="9px" 
                          px={2} 
                          py={1}
                          borderRadius="full"
                        >
                          {cert.date}
                        </Badge>
                        {cert.credentialId && (
                          <Text fontSize="9px" color="gray.600">
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
                  size="md" 
                  fontWeight="600" 
                  mb={4} 
                  color="#667eea"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '40px',
                    height: '3px',
                    bg: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '2px'
                  }}
                >
                  Languages
                </Heading>
                <VStack spacing={3} align="stretch" mt={6}>
                  {data.languages.map((lang, index) => (
                    <HStack key={index} justify="space-between">
                      <Text fontSize="11px" color="black" fontWeight="500">
                        {lang.name}
                      </Text>
                      <Badge 
                        bg="linear-gradient(90deg, #667eea, #764ba2)" 
                        color="white" 
                        fontSize="9px" 
                        px={2} 
                        py={1}
                        borderRadius="full"
                      >
                        {lang.proficiency}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default ModernTemplate; 