import React from 'react';
import { Box, Text, Heading, VStack, HStack, Divider, Badge, UnorderedList, ListItem } from '@chakra-ui/react';

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

interface ClassicTemplateProps {
  data: ResumeData;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
  return (
    <Box 
      maxW="8.5in" 
      minH="11in" 
      mx="auto" 
      p={8} 
      bg="white" 
      color="black"
      fontFamily="Times New Roman, serif"
      fontSize="12px"
      lineHeight="1.4"
    >
      {/* Header */}
      <VStack spacing={2} align="center" mb={6}>
        <Heading 
          as="h1" 
          size="xl" 
          fontWeight="bold" 
          textAlign="center"
          letterSpacing="wide"
          textTransform="uppercase"
          color="black"
        >
          {data.personalInfo.fullName}
        </Heading>
        <HStack spacing={6} fontSize="11px" wrap="wrap" justify="center">
          <Text>{data.personalInfo.email}</Text>
          <Text>{data.personalInfo.phone}</Text>
          <Text>{data.personalInfo.location}</Text>
          {data.personalInfo.linkedIn && (
            <Text>{data.personalInfo.linkedIn}</Text>
          )}
        </HStack>
      </VStack>

      {/* Professional Summary */}
      {data.summary && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={2} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Professional Summary
          </Heading>
          <Text textAlign="justify" fontSize="12px">
            {data.summary}
          </Text>
        </Box>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={3} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Professional Experience
          </Heading>
          <VStack spacing={4} align="stretch">
            {data.experience.map((exp) => (
              <Box key={exp.id}>
                <HStack justify="space-between" align="start" mb={1}>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="13px">
                      {exp.title}
                    </Text>
                    <Text fontStyle="italic" fontSize="12px">
                      {exp.company}, {exp.location}
                    </Text>
                  </VStack>
                  <Text fontSize="11px" fontWeight="bold">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </HStack>
                <Text fontSize="11px" mb={2} textAlign="justify">
                  {exp.description}
                </Text>
                {exp.achievements.length > 0 && (
                  <UnorderedList ml={4} fontSize="11px">
                    {exp.achievements.map((achievement, index) => (
                      <ListItem key={index} mb={1}>
                        {achievement}
                      </ListItem>
                    ))}
                  </UnorderedList>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={3} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Education
          </Heading>
          <VStack spacing={3} align="stretch">
            {data.education.map((edu) => (
              <Box key={edu.id}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="13px">
                      {edu.degree}
                    </Text>
                    <Text fontStyle="italic" fontSize="12px">
                      {edu.institution}, {edu.location}
                    </Text>
                    {edu.gpa && (
                      <Text fontSize="11px">
                        GPA: {edu.gpa}
                      </Text>
                    )}
                    {edu.honors && (
                      <Text fontSize="11px" fontStyle="italic">
                        {edu.honors}
                      </Text>
                    )}
                  </VStack>
                  <Text fontSize="11px" fontWeight="bold">
                    {edu.startDate} - {edu.endDate}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={3} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Technical Skills
          </Heading>
          <VStack spacing={2} align="stretch">
            {data.skills.map((skillCategory, index) => (
              <HStack key={index} align="start" spacing={4}>
                <Text fontWeight="bold" fontSize="12px" minW="120px">
                  {skillCategory.category}:
                </Text>
                <Text fontSize="12px" flex={1}>
                  {skillCategory.items.join(', ')}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={3} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Projects
          </Heading>
          <VStack spacing={3} align="stretch">
            {data.projects.map((project) => (
              <Box key={project.id}>
                <HStack justify="space-between" align="start" mb={1}>
                  <Text fontWeight="bold" fontSize="13px">
                    {project.name}
                  </Text>
                  {project.url && (
                    <Text fontSize="11px" fontStyle="italic">
                      {project.url}
                    </Text>
                  )}
                </HStack>
                <Text fontSize="11px" mb={1} textAlign="justify">
                  {project.description}
                </Text>
                <Text fontSize="11px" fontWeight="bold">
                  Technologies: {project.technologies.join(', ')}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={3} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Certifications
          </Heading>
          <VStack spacing={2} align="stretch">
            {data.certifications.map((cert) => (
              <HStack key={cert.id} justify="space-between" align="start">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="12px">
                    {cert.name}
                  </Text>
                  <Text fontSize="11px" fontStyle="italic">
                    {cert.issuer}
                  </Text>
                  {cert.credentialId && (
                    <Text fontSize="10px">
                      ID: {cert.credentialId}
                    </Text>
                  )}
                </VStack>
                <Text fontSize="11px" fontWeight="bold">
                  {cert.date}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <Box mb={6}>
          <Heading 
            as="h2" 
            size="md" 
            fontWeight="bold" 
            mb={3} 
            textTransform="uppercase"
            borderBottom="2px solid black"
            pb={1}
          >
            Languages
          </Heading>
          <HStack spacing={4} wrap="wrap">
            {data.languages.map((lang, index) => (
              <Text key={index} fontSize="12px">
                <Text as="span" fontWeight="bold">{lang.name}</Text>
                {' '}({lang.proficiency})
              </Text>
            ))}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default ClassicTemplate; 