import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Box, Heading, Text, Flex, Container, Button, useColorModeValue, Icon, HStack, VStack, Badge } from '@chakra-ui/react';
import { FaNetworkWired, FaUsers, FaLightbulb, FaHandshake, FaRocket } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

interface AnimatedNetworkingHeaderProps {
  title?: string;
  subtitle?: string;
  showCTA?: boolean;
}

const AnimatedNetworkingHeader: React.FC<AnimatedNetworkingHeaderProps> = ({
  title = "Нетворкинг и коллаборация",
  subtitle = "Найдите единомышленников, создавайте команды и работайте над интересными проектами вместе",
  showCTA = true
}) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Mouse parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position for parallax effect
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  
  const bgGradient = useColorModeValue(
    "linear(to-br, gray.50, white, gray.100)",
    "linear(to-br, gray.900, black, gray.800)"
  );
  
  const cardBg = useColorModeValue("white", "black");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const accentColor = useColorModeValue("black", "white");
  const badgeBg = useColorModeValue("gray.100", "gray.800");
  const badgeColor = useColorModeValue("gray.800", "gray.100");
  
  // Network nodes animation data
  const [nodes, setNodes] = useState<{ x: number; y: number; size: number; color: string }[]>([]);
  const [connections, setConnections] = useState<{ from: number; to: number }[]>([]);
  
  // Generate network nodes and connections
  useEffect(() => {
    const generateNetworkData = () => {
      const newNodes = Array.from({ length: 12 }, (_, i) => ({
        x: Math.random() * 90 + 5, // 5-95% of container width
        y: Math.random() * 90 + 5, // 5-95% of container height
        size: Math.random() * 10 + 5, // 5-15px
        color: useColorModeValue(
          [
            "rgba(0, 0, 0, 0.6)", // black
            "rgba(75, 85, 99, 0.6)", // gray-600
            "rgba(107, 114, 128, 0.6)", // gray-500
            "rgba(156, 163, 175, 0.6)", // gray-400
            "rgba(209, 213, 219, 0.6)", // gray-300
          ][Math.floor(Math.random() * 5)],
          [
            "rgba(255, 255, 255, 0.6)", // white
            "rgba(229, 231, 235, 0.6)", // gray-200
            "rgba(209, 213, 219, 0.6)", // gray-300
            "rgba(156, 163, 175, 0.6)", // gray-400
            "rgba(107, 114, 128, 0.6)", // gray-500
          ][Math.floor(Math.random() * 5)]
        )
      }));
      
      // Create connections between nodes (not all nodes will be connected)
      const newConnections = [];
      for (let i = 0; i < newNodes.length; i++) {
        // Each node connects to 1-3 other nodes
        const connectionsCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < connectionsCount; j++) {
          // Connect to a random node that isn't itself
          let toIndex;
          do {
            toIndex = Math.floor(Math.random() * newNodes.length);
          } while (toIndex === i);
          
          newConnections.push({ from: i, to: toIndex });
        }
      }
      
      setNodes(newNodes);
      setConnections(newConnections);
    };
    
    generateNetworkData();
  }, []);
  
  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });
  };
  
  // Reset mouse position when mouse leaves
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setMousePosition({ x: 0, y: 0 });
  };
  
  // Intersection observer to trigger animations when header is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          controls.start("visible");
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [controls]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };
  
  const iconFeatures = [
    { icon: FaUsers, text: "Найдите команду", color: "gray" },
    { icon: FaLightbulb, text: "Реализуйте идеи", color: "gray" },
    { icon: FaHandshake, text: "Сотрудничайте", color: "gray" },
    { icon: FaRocket, text: "Запускайте проекты", color: "gray" },
  ];
  
  return (
    <Box
      ref={containerRef}
      position="relative"
      overflow="hidden"
      bgGradient={bgGradient}
      py={{ base: 12, md: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Network visualization background */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        opacity="0.7"
        pointerEvents="none"
      >
        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
          {/* Connections between nodes */}
          {connections.map((connection, i) => {
            const fromNode = nodes[connection.from];
            const toNode = nodes[connection.to];
            
            return (
              <motion.line
                key={`connection-${i}`}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={useColorModeValue("rgba(0, 0, 0, 0.2)", "rgba(255, 255, 255, 0.2)")}
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 0.5,
                  x1: `${fromNode.x + (mousePosition.x * 0.01)}%`,
                  y1: `${fromNode.y + (mousePosition.y * 0.01)}%`,
                  x2: `${toNode.x + (mousePosition.x * 0.01)}%`,
                  y2: `${toNode.y + (mousePosition.y * 0.01)}%`,
                }}
                transition={{
                  pathLength: { duration: 2, delay: i * 0.1 },
                  opacity: { duration: 1, delay: i * 0.1 },
                  x1: { type: "spring", stiffness: 50, damping: 20 },
                  y1: { type: "spring", stiffness: 50, damping: 20 },
                  x2: { type: "spring", stiffness: 50, damping: 20 },
                  y2: { type: "spring", stiffness: 50, damping: 20 },
                }}
              />
            );
          })}
          
          {/* Network nodes */}
          {nodes.map((node, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill={node.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                cx: `${node.x + (mousePosition.x * 0.02)}%`,
                cy: `${node.y + (mousePosition.y * 0.02)}%`,
              }}
              transition={{
                scale: { duration: 0.5, delay: i * 0.1 },
                opacity: { duration: 0.5, delay: i * 0.1 },
                cx: { type: "spring", stiffness: 100, damping: 20 },
                cy: { type: "spring", stiffness: 100, damping: 20 },
              }}
            />
          ))}
        </svg>
      </Box>
      
      {/* Floating elements */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" pointerEvents="none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`float-${i}`}
            style={{
              position: 'absolute',
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
              width: '40px',
              height: '40px',
              background: useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)'),
              borderRadius: '50%',
              filter: 'blur(10px)',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </Box>
      
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={8}
          >
            {/* Left side - Main content */}
            <Box flex={1} textAlign={{ base: "center", lg: "left" }}>
              <motion.div variants={itemVariants}>
                <Heading
                  as="h1"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl", xl: "6xl" }}
                  fontWeight="light"
                  color={accentColor}
                  lineHeight="1.1"
                  mb={6}
                >
                  <Box as="span" fontWeight="thin">{title.split(' ')[0]}</Box>
                  {title.split(' ').length > 1 && (
                    <Box as="span" fontWeight="bold" ml={2}>
                      {title.split(' ').slice(1).join(' ')}
                    </Box>
                  )}
                </Heading>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Text
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  color={textColor}
                  mb={8}
                  maxW="600px"
                  mx={{ base: "auto", lg: "0" }}
                  fontWeight="light"
                >
                  {subtitle}
                </Text>
              </motion.div>
              
              {/* Feature badges */}
              <motion.div variants={itemVariants}>
                <HStack
                  spacing={4}
                  mb={8}
                  justify={{ base: "center", lg: "flex-start" }}
                  wrap="wrap"
                >
                  {iconFeatures.slice(0, 2).map((feature, i) => (
                    <Badge
                      key={i}
                      bg={badgeBg}
                      color={badgeColor}
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={feature.icon} />
                      {feature.text}
                    </Badge>
                  ))}
                </HStack>
              </motion.div>
              
              {/* CTA Button */}
              {showCTA && (
                <motion.div variants={itemVariants}>
                  <Button
                    as={RouterLink}
                    to="/networking/projects"
                    size="lg"
                    bg={accentColor}
                    color={useColorModeValue("white", "black")}
                    _hover={{
                      bg: useColorModeValue("gray.800", "gray.200"),
                      transform: "translateY(-2px)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                    }}
                    borderRadius="full"
                    px={8}
                    py={6}
                    fontSize="lg"
                    fontWeight="medium"
                    leftIcon={<FaRocket />}
                    boxShadow="lg"
                    transition="all 0.2s"
                  >
                    Начать нетворкинг
                  </Button>
                </motion.div>
              )}
            </Box>
            
            {/* Right side - Interactive card */}
            <Box flex={1} maxW={{ base: "100%", lg: "500px" }}>
              <motion.div
                variants={itemVariants}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
              >
                <Box
                  bg={cardBg}
                  p={8}
                  borderRadius="2xl"
                  boxShadow="2xl"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.200", "gray.700")}
                  _hover={{
                    borderColor: accentColor,
                    boxShadow: "3xl",
                  }}
                  transition="all 0.3s"
                  position="relative"
                  overflow="hidden"
                >
                  {/* Card background pattern */}
                  <Box
                    position="absolute"
                    top="0"
                    right="0"
                    w="100px"
                    h="100px"
                    bg={useColorModeValue("gray.50", "gray.800")}
                    borderRadius="full"
                    transform="translate(50%, -50%)"
                    opacity="0.5"
                  />
                  
                  <VStack spacing={6} align="stretch" position="relative">
                    <Heading
                      size="lg"
                      color={accentColor}
                      textAlign="center"
                      fontWeight="light"
                    >
                      <Box as="span" fontWeight="thin">Возможности</Box>
                      <Box as="span" fontWeight="bold" ml={2}>Платформы</Box>
                    </Heading>
                    
                    <VStack spacing={4}>
                      {iconFeatures.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          <HStack
                            spacing={4}
                            p={4}
                            bg={useColorModeValue("gray.50", "gray.800")}
                            borderRadius="xl"
                            w="full"
                            _hover={{
                              bg: useColorModeValue("gray.100", "gray.700"),
                              transform: "translateX(5px)",
                            }}
                            transition="all 0.2s"
                          >
                            <Box
                              w="12"
                              h="12"
                              bg={accentColor}
                              color={useColorModeValue("white", "black")}
                              borderRadius="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Icon as={feature.icon} boxSize={6} />
                            </Box>
                            <Text
                              fontWeight="medium"
                              color={textColor}
                              fontSize="lg"
                            >
                              {feature.text}
                            </Text>
                          </HStack>
                        </motion.div>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              </motion.div>
            </Box>
          </Flex>
        </motion.div>
      </Container>
      
      {/* Bottom wave decoration */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="100px"
        overflow="hidden"
        pointerEvents="none"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"
            fill={useColorModeValue("rgba(0, 0, 0, 0.03)", "rgba(255, 255, 255, 0.03)")}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </svg>
      </Box>
    </Box>
  );
};

export default AnimatedNetworkingHeader; 