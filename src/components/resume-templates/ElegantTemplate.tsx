import React from 'react';
import { Box, Text, Heading, VStack, HStack, Grid, GridItem, Badge, UnorderedList, ListItem, Divider } from '@chakra-ui/react';

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

interface ElegantTemplateProps {
  data: ResumeData;
}

const ElegantTemplate: React.FC<ElegantTemplateProps> = ({ data }) => {
  return (
    <Box 
      maxW="8.5in" 
      minH="11in" 
      mx="auto" 
      bg="white" 
      color="black"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="11px"
      lineHeight="1.6"
      position="relative"
    >
      {/* Elegant border */}
      <Box
        position="absolute"
        top="20px"
        left="20px"
        right="20px"
        bottom="20px"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="2px"
        _before={{
          content: '""',
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          bottom: '10px',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: '1px'
        }}
      />

      <Box p={12} position="relative" zIndex={1}>
        {/* Header */}
        <VStack spacing={6} align="center" mb={12}>
          <Heading 
            as="h1" 
            fontSize="36px" 
            fontWeight="400" 
            textAlign="center"
            letterSpacing="4px"
            color="black"
            fontFamily="'Playfair Display', Georgia, serif"
          >
            {data.personalInfo.fullName}
          </Heading>
          
          <Divider borderColor="gray.400" maxW="200px" />
          
          <HStack spacing={8} fontSize="12px" wrap="wrap" justify="center" color="gray.600">
            <Text>{data.personalInfo.email}</Text>
            <Text>•</Text>
            <Text>{data.personalInfo.phone}</Text>
            <Text>•</Text>
            <Text>{data.personalInfo.location}</Text>
            {data.personalInfo.linkedIn && (
              <>
                <Text>•</Text>
                <Text>{data.personalInfo.linkedIn}</Text>
              </>
            )}
          </HStack>
        </VStack>

        {/* Professional Summary */}
        {data.summary && (
          <Box mb={10}>
            <Heading 
              as="h2" 
              fontSize="18px" 
              fontWeight="400" 
              mb={4} 
              textAlign="center"
              letterSpacing="2px"
              color="black"
              fontFamily="'Playfair Display', Georgia, serif"
            >
              PROFESSIONAL SUMMARY
            </Heading>
            <Divider borderColor="gray.400" maxW="150px" mx="auto" mb={6} />
            <Text fontSize="12px" textAlign="center" color="gray.700" fontStyle="italic" maxW="600px" mx="auto">
              {data.summary}
            </Text>
          </Box>
        )}

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={12}>
          {/* Left Column */}
          <GridItem>
            {/* Experience */}
            {data.experience.length > 0 && (
              <Box mb={10}>
                <Heading 
                  as="h2" 
                  fontSize="18px" 
                  fontWeight="400" 
                  mb={4} 
                  letterSpacing="2px"
                  color="black"
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  EXPERIENCE
                </Heading>
                <Divider borderColor="gray.400" maxW="100px" mb={6} />
                <VStack spacing={8} align="stretch">
                  {data.experience.map((exp) => (
                    <Box key={exp.id}>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full" align="start">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" fontSize="14px" color="black">
                              {exp.title}
                            </Text>
                            <Text fontSize="12px" color="gray.600" fontStyle="italic">
                              {exp.company} • {exp.location}
                            </Text>
                          </VStack>
                          <Text fontSize="11px" color="gray.500" fontWeight="500">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </Text>
                        </HStack>
                        <Text fontSize="11px" color="gray.700" textAlign="justify" mt={3}>
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
                      <Divider borderColor="gray.200" mt={6} />
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <Box mb={10}>
                <Heading 
                  as="h2" 
                  fontSize="18px" 
                  fontWeight="400" 
                  mb={4} 
                  letterSpacing="2px"
                  color="black"
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  PROJECTS
                </Heading>
                <Divider borderColor="gray.400" maxW="100px" mb={6} />
                <VStack spacing={6} align="stretch">
                  {data.projects.map((project) => (
                    <Box key={project.id}>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="600" fontSize="14px" color="black">
                            {project.name}
                          </Text>
                          {project.url && (
                            <Text fontSize="10px" color="gray.500" fontStyle="italic">
                              {project.url}
                            </Text>
                          )}
                        </HStack>
                        <Text fontSize="11px" color="gray.700" textAlign="justify">
                          {project.description}
                        </Text>
                        <Text fontSize="10px" color="gray.500" fontStyle="italic">
                          Technologies: {project.technologies.join(' • ')}
                        </Text>
                      </VStack>
                      <Divider borderColor="gray.200" mt={4} />
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
              <Box mb={10}>
                <Heading 
                  as="h2" 
                  fontSize="18px" 
                  fontWeight="400" 
                  mb={4} 
                  letterSpacing="2px"
                  color="black"
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  EDUCATION
                </Heading>
                <Divider borderColor="gray.400" maxW="100px" mb={6} />
                <VStack spacing={6} align="stretch">
                  {data.education.map((edu) => (
                    <Box key={edu.id}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="600" fontSize="14px" color="black">
                          {edu.degree}
                        </Text>
                        <Text fontSize="12px" color="gray.600" fontStyle="italic">
                          {edu.institution}
                        </Text>
                        <Text fontSize="11px" color="gray.500">
                          {edu.location} • {edu.startDate} - {edu.endDate}
                        </Text>
                        {edu.gpa && (
                          <Text fontSize="11px" color="gray.600">
                            GPA: {edu.gpa}
                          </Text>
                        )}
                        {edu.honors && (
                          <Text fontSize="11px" color="gray.600" fontStyle="italic">
                            {edu.honors}
                          </Text>
                        )}
                      </VStack>
                      <Divider borderColor="gray.200" mt={4} />
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
              <Box mb={10}>
                <Heading 
                  as="h2" 
                  fontSize="18px" 
                  fontWeight="400" 
                  mb={4} 
                  letterSpacing="2px"
                  color="black"
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  SKILLS
                </Heading>
                <Divider borderColor="gray.400" maxW="100px" mb={6} />
                <VStack spacing={6} align="stretch">
                  {data.skills.map((skillCategory, index) => (
                    <Box key={index}>
                      <Text fontWeight="600" fontSize="13px" color="black" mb={3}>
                        {skillCategory.category}
                      </Text>
                      <Text fontSize="11px" color="gray.700" lineHeight="1.8">
                        {skillCategory.items.join(' • ')}
                      </Text>
                      <Divider borderColor="gray.200" mt={4} />
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <Box mb={10}>
                <Heading 
                  as="h2" 
                  fontSize="18px" 
                  fontWeight="400" 
                  mb={4} 
                  letterSpacing="2px"
                  color="black"
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  CERTIFICATIONS
                </Heading>
                <Divider borderColor="gray.400" maxW="100px" mb={6} />
                <VStack spacing={4} align="stretch">
                  {data.certifications.map((cert) => (
                    <Box key={cert.id}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" fontSize="12px" color="black">
                          {cert.name}
                        </Text>
                        <Text fontSize="11px" color="gray.600" fontStyle="italic">
                          {cert.issuer}
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          {cert.date}
                        </Text>
                        {cert.credentialId && (
                          <Text fontSize="10px" color="gray.500">
                            ID: {cert.credentialId}
                          </Text>
                        )}
                      </VStack>
                      <Divider borderColor="gray.200" mt={3} />
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <Box mb={10}>
                <Heading 
                  as="h2" 
                  fontSize="18px" 
                  fontWeight="400" 
                  mb={4} 
                  letterSpacing="2px"
                  color="black"
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  LANGUAGES
                </Heading>
                <Divider borderColor="gray.400" maxW="100px" mb={6} />
                <VStack spacing={3} align="stretch">
                  {data.languages.map((lang, index) => (
                    <HStack key={index} justify="space-between">
                      <Text fontSize="12px" color="black" fontWeight="500">
                        {lang.name}
                      </Text>
                      <Text fontSize="11px" color="gray.600" fontStyle="italic">
                        {lang.proficiency}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </GridItem>
        </Grid>

        {/* Footer */}
        <Box mt={12} textAlign="center">
          <Divider borderColor="gray.400" maxW="200px" mx="auto" mb={4} />
          <Text fontSize="10px" color="gray.500" fontStyle="italic">
            References available upon request
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ElegantTemplate; 