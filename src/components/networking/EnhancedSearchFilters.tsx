import React, { useState, useEffect } from 'react';
import {
  Box, Input, InputGroup, InputLeftElement, InputRightElement,
  Button, HStack, VStack, Text, useColorModeValue, Icon,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverBody, PopoverArrow, PopoverCloseButton, Checkbox,
  CheckboxGroup, Slider, SliderTrack, SliderFilledTrack,
  SliderThumb, SliderMark, Select, Badge, Wrap, WrapItem,
  Divider, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, useDisclosure, Drawer,
  DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, List, ListItem, ListIcon, Alert,
  AlertIcon, AlertTitle, AlertDescription, Tooltip,
  IconButton, Menu, MenuButton, MenuList, MenuItem,
  MenuDivider, useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaFilter, FaSort, FaTimes, FaCheck, FaSlidersH,
  FaMapMarkerAlt, FaUsers, FaClock, FaStar, FaDollarSign,
  FaCode, FaPalette, FaBrain, FaShieldAlt, FaGlobe, FaRocket,
  FaMobile, FaServer, FaDatabase, FaCloud, FaLock, FaEye,
  FaEyeSlash, FaSave, FaUndo, FaCog, FaMagic, FaLightbulb,
  FaGamepad
} from 'react-icons/fa';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionButton = motion(Button);

interface FilterOptions {
  search?: string;
  categories?: string[];
  locations?: string[];
  teamSizes?: string[];
  durations?: string[];
  difficulties?: string[];
  minMatchScore?: number;
  maxBudget?: number;
  technologies?: string[];
  status?: string[];
  sortBy?: 'relevance' | 'date' | 'matchScore' | 'budget' | 'views';
  sortOrder?: 'asc' | 'desc';
  isRemote?: boolean;
  experienceLevel?: string[];
  projectType?: string[];
}

interface EnhancedSearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

const EnhancedSearchFilters: React.FC<EnhancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isMobile = false
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    search: filters?.search || '',
    categories: filters?.categories || [],
    locations: filters?.locations || [],
    teamSizes: filters?.teamSizes || [],
    durations: filters?.durations || [],
    difficulties: filters?.difficulties || [],
    minMatchScore: filters?.minMatchScore || 0,
    maxBudget: filters?.maxBudget || 1000000,
    technologies: filters?.technologies || [],
    status: filters?.status || [],
    sortBy: filters?.sortBy || 'relevance',
    sortOrder: filters?.sortOrder || 'desc',
    isRemote: filters?.isRemote,
    experienceLevel: filters?.experienceLevel || [],
    projectType: filters?.projectType || []
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Filter options
  const categories = [
    { value: 'ai', label: 'Жасанды интеллект', icon: FaBrain },
    { value: 'web', label: 'Веб-даму', icon: FaCode },
    { value: 'mobile', label: 'Мобильді қосымшалар', icon: FaMobile },
    { value: 'design', label: 'UI/UX дизайн', icon: FaPalette },
    { value: 'blockchain', label: 'Блокчейн', icon: FaGlobe },
    { value: 'security', label: 'Киберқауіпсіздік', icon: FaShieldAlt },
    { value: 'data', label: 'Деректерді талдау', icon: FaDatabase },
    { value: 'cloud', label: 'Бұлттық технологиялар', icon: FaCloud },
    { value: 'devops', label: 'DevOps', icon: FaServer },
    { value: 'iot', label: 'IoT', icon: FaRocket },
    { value: 'game', label: 'Ойын дамуы', icon: FaGamepad },
    { value: 'other', label: 'Басқа', icon: FaLightbulb }
  ];

  const locations = [
    { value: 'remote', label: 'Қашықтан' },
    { value: 'almaty', label: 'Алматы' },
    { value: 'astana', label: 'Астана' },
    { value: 'shymkent', label: 'Шымкент' },
    { value: 'aktobe', label: 'Ақтөбе' },
    { value: 'karaganda', label: 'Қарағанды' },
    { value: 'taraz', label: 'Тараз' },
    { value: 'pavlodar', label: 'Павлодар' },
    { value: 'semey', label: 'Семей' },
    { value: 'other', label: 'Басқа қалалар' }
  ];

  const teamSizes = [
    { value: '1-3', label: '1-3 адам' },
    { value: '4-6', label: '4-6 адам' },
    { value: '7-10', label: '7-10 адам' },
    { value: '10+', label: '10+ адам' }
  ];

  const durations = [
    { value: '1-3', label: '1-3 ай' },
    { value: '3-6', label: '3-6 ай' },
    { value: '6-12', label: '6-12 ай' },
    { value: '12+', label: '1+ жыл' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Бастаушы' },
    { value: 'intermediate', label: 'Орташа' },
    { value: 'advanced', label: 'Жоғары деңгей' }
  ];

  const technologies = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'Go',
    'TypeScript', 'JavaScript', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Solidity', 'Web3', 'Ethereum', 'Bitcoin', 'Blockchain'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Сәйкестік' },
    { value: 'matchScore', label: 'Сәйкесу' },
    { value: 'date', label: 'Құрылған күні' },
    { value: 'teamSize', label: 'Команда өлшемі' },
    { value: 'duration', label: 'Ұзақтығы' },
    { value: 'budget', label: 'Бюджет' }
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    if (isMobile) {
      onClose();
    }
    toast({
      title: 'Фильтры применены',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      search: '',
      categories: [],
      locations: [],
      teamSizes: [],
      durations: [],
      difficulties: [],
      minMatchScore: 0,
      maxBudget: 1000000,
      technologies: [],
      status: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    setLocalFilters(defaultFilters);
    onClearFilters();
    toast({
      title: 'Фильтры сброшены',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const getActiveFiltersCount = () => {
    if (!localFilters) return 0;
    
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.categories?.length > 0) count++;
    if (localFilters.locations?.length > 0) count++;
    if (localFilters.teamSizes?.length > 0) count++;
    if (localFilters.durations?.length > 0) count++;
    if (localFilters.difficulties?.length > 0) count++;
    if ((localFilters.minMatchScore || 0) > 0) count++;
    if ((localFilters.maxBudget || 1000000) < 1000000) count++;
    if (localFilters.technologies?.length > 0) count++;
    if (localFilters.status?.length > 0) count++;
    return count;
  };

  const FilterContent = () => (
    <VStack spacing={6} align="stretch">
      {/* Search */}
      <Box>
        <Text fontWeight="medium" mb={3}>Поиск</Text>
        <InputGroup>
          <InputLeftElement>
            <Icon as={FaSearch} color={mutedColor} />
          </InputLeftElement>
          <Input
            placeholder="Поиск проектов..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            borderRadius="lg"
          />
          {localFilters.search && (
            <InputRightElement>
              <IconButton
                aria-label="Очистить поиск"
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={() => handleFilterChange('search', '')}
              />
            </InputRightElement>
          )}
        </InputGroup>
      </Box>

      {/* Categories */}
      <Box>
        <Text fontWeight="medium" mb={3}>Категории</Text>
        <CheckboxGroup
          value={localFilters.categories || []}
          onChange={(values) => handleFilterChange('categories', values)}
        >
          <Wrap spacing={2}>
            {categories.map((category) => (
              <WrapItem key={category.value}>
                <Checkbox value={category.value} colorScheme="blue">
                  <HStack spacing={2}>
                    <Icon as={category.icon} boxSize={4} />
                    <Text fontSize="sm">{category.label}</Text>
                  </HStack>
                </Checkbox>
              </WrapItem>
            ))}
          </Wrap>
        </CheckboxGroup>
      </Box>

      {/* Locations */}
      <Box>
        <Text fontWeight="medium" mb={3}>Локация</Text>
        <CheckboxGroup
          value={localFilters.locations}
          onChange={(values) => handleFilterChange('locations', values)}
        >
          <VStack align="start" spacing={2}>
            {locations.map((location) => (
              <Checkbox key={location.value} value={location.value} colorScheme="blue">
                <HStack spacing={2}>
                  <Icon as={FaMapMarkerAlt} boxSize={4} />
                  <Text fontSize="sm">{location.label}</Text>
                </HStack>
              </Checkbox>
            ))}
          </VStack>
        </CheckboxGroup>
      </Box>

      {/* Team Size and Duration */}
      <HStack spacing={4}>
        <Box flex={1}>
          <Text fontWeight="medium" mb={3}>Размер команды</Text>
          <CheckboxGroup
            value={localFilters.teamSizes}
            onChange={(values) => handleFilterChange('teamSizes', values)}
          >
            <VStack align="start" spacing={2}>
              {teamSizes.map((size) => (
                <Checkbox key={size.value} value={size.value} colorScheme="blue">
                  <HStack spacing={2}>
                    <Icon as={FaUsers} boxSize={4} />
                    <Text fontSize="sm">{size.label}</Text>
                  </HStack>
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </Box>

        <Box flex={1}>
          <Text fontWeight="medium" mb={3}>Длительность</Text>
          <CheckboxGroup
            value={localFilters.durations}
            onChange={(values) => handleFilterChange('durations', values)}
          >
            <VStack align="start" spacing={2}>
              {durations.map((duration) => (
                <Checkbox key={duration.value} value={duration.value} colorScheme="blue">
                  <HStack spacing={2}>
                    <Icon as={FaClock} boxSize={4} />
                    <Text fontSize="sm">{duration.label}</Text>
                  </HStack>
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </Box>
      </HStack>

      {/* Difficulty */}
      <Box>
        <Text fontWeight="medium" mb={3}>Сложность</Text>
        <CheckboxGroup
          value={localFilters.difficulties}
          onChange={(values) => handleFilterChange('difficulties', values)}
        >
          <HStack spacing={4}>
            {difficulties.map((difficulty) => (
              <Checkbox key={difficulty.value} value={difficulty.value} colorScheme="blue">
                <HStack spacing={2}>
                  <Icon as={FaStar} boxSize={4} />
                  <Text fontSize="sm">{difficulty.label}</Text>
                </HStack>
              </Checkbox>
            ))}
          </HStack>
        </CheckboxGroup>
      </Box>

      {/* Match Score */}
      <Box>
        <Text fontWeight="medium" mb={3}>
          Минимальное совпадение: {localFilters.minMatchScore}%
        </Text>
        <Slider
          value={localFilters.minMatchScore}
          onChange={(value) => handleFilterChange('minMatchScore', value)}
          min={0}
          max={100}
          step={10}
          colorScheme="blue"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
          <SliderMark value={0} mt={2} fontSize="xs">0%</SliderMark>
          <SliderMark value={50} mt={2} fontSize="xs">50%</SliderMark>
          <SliderMark value={100} mt={2} fontSize="xs">100%</SliderMark>
        </Slider>
      </Box>

      {/* Budget */}
      <Box>
        <Text fontWeight="medium" mb={3}>
          Максимальный бюджет: {localFilters.maxBudget.toLocaleString()} ₽
        </Text>
        <Slider
          value={localFilters.maxBudget}
          onChange={(value) => handleFilterChange('maxBudget', value)}
          min={0}
          max={1000000}
          step={50000}
          colorScheme="green"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
          <SliderMark value={0} mt={2} fontSize="xs">0₽</SliderMark>
          <SliderMark value={500000} mt={2} fontSize="xs">500k₽</SliderMark>
          <SliderMark value={1000000} mt={2} fontSize="xs">1M₽</SliderMark>
        </Slider>
      </Box>

      {/* Technologies */}
      <Box>
        <Text fontWeight="medium" mb={3}>Технологии</Text>
        <Input
          placeholder="Поиск технологий..."
          mb={3}
          borderRadius="lg"
        />
        <Box maxH="200px" overflowY="auto">
          <CheckboxGroup
            value={localFilters.technologies}
            onChange={(values) => handleFilterChange('technologies', values)}
          >
            <Wrap spacing={2}>
              {technologies.map((tech) => (
                <WrapItem key={tech}>
                  <Checkbox value={tech} colorScheme="blue">
                    <Text fontSize="sm">{tech}</Text>
                  </Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </CheckboxGroup>
        </Box>
      </Box>

      {/* Sort Options */}
      <Box>
        <Text fontWeight="medium" mb={3}>Сортировка</Text>
        <HStack spacing={4}>
          <Select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            borderRadius="lg"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <IconButton
            aria-label="Порядок сортировки"
            icon={<Icon as={localFilters.sortOrder === 'asc' ? FaSort : FaSort} />}
            onClick={() => handleFilterChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="outline"
            borderRadius="lg"
          />
        </HStack>
      </Box>

      {/* Action Buttons */}
      <HStack spacing={4}>
        <MotionButton
          colorScheme="blue"
          onClick={applyFilters}
          flex={1}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Применить фильтры
        </MotionButton>
        <MotionButton
          variant="outline"
          onClick={clearFilters}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Сбросить
        </MotionButton>
      </HStack>
    </VStack>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Search Bar */}
        <VStack spacing={4} align="stretch">
          <InputGroup>
            <InputLeftElement>
              <Icon as={FaSearch} color={mutedColor} />
            </InputLeftElement>
            <Input
              placeholder="Поиск проектов..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              borderRadius="full"
              size="lg"
            />
            <InputRightElement>
              <IconButton
                aria-label="Фильтры"
                icon={<FaFilter />}
                onClick={onOpen}
                variant="ghost"
                borderRadius="full"
              />
            </InputRightElement>
          </InputGroup>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <HStack spacing={2} overflowX="auto" pb={2}>
              <Badge colorScheme="blue" borderRadius="full">
                {getActiveFiltersCount()} фильтр(ов)
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                leftIcon={<FaTimes />}
              >
                Очистить
              </Button>
            </HStack>
          )}
        </VStack>

        {/* Mobile Filter Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack spacing={3}>
                <Icon as={FaFilter} color={accentColor} />
                <Text>Фильтры</Text>
                {getActiveFiltersCount() > 0 && (
                  <Badge colorScheme="blue" borderRadius="full">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              <FilterContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Desktop Search and Filter Bar */}
      <HStack spacing={4}>
        <InputGroup flex={1}>
          <InputLeftElement>
            <Icon as={FaSearch} color={mutedColor} />
          </InputLeftElement>
          <Input
            placeholder="Поиск проектов..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            borderRadius="lg"
            size="lg"
          />
          {localFilters.search && (
            <InputRightElement>
              <IconButton
                aria-label="Очистить поиск"
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={() => handleFilterChange('search', '')}
              />
            </InputRightElement>
          )}
        </InputGroup>

        <Popover placement="bottom-end" trigger="click">
          <PopoverTrigger>
            <MotionButton
              variant="outline"
              leftIcon={<FaFilter />}
              rightIcon={getActiveFiltersCount() > 0 ? (
                <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                  {getActiveFiltersCount()}
                </Badge>
              ) : undefined}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Фильтры
            </MotionButton>
          </PopoverTrigger>
          <PopoverContent p={4} w="400px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="semibold">
              <HStack spacing={2}>
                <Icon as={FaSlidersH} />
                <Text>Фильтры поиска</Text>
              </HStack>
            </PopoverHeader>
            <PopoverBody maxH="600px" overflowY="auto">
              <FilterContent />
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Menu>
          <MenuButton as={Button} variant="outline" rightIcon={<FaSort />}>
            Сортировка
          </MenuButton>
          <MenuList>
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleFilterChange('sortBy', option.value)}
                icon={localFilters.sortBy === option.value ? <FaCheck /> : undefined}
              >
                {option.label}
              </MenuItem>
            ))}
            <MenuDivider />
            <MenuItem
              onClick={() => handleFilterChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
              icon={<Icon as={localFilters.sortOrder === 'asc' ? FaSort : FaSort} />}
            >
              {localFilters.sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box flex={1}>
            <AlertTitle>Активные фильтры:</AlertTitle>
            <AlertDescription>
              <Wrap spacing={2} mt={2}>
                {localFilters.categories.length > 0 && (
                  <Badge colorScheme="blue">
                    Категории: {localFilters.categories.length}
                  </Badge>
                )}
                {localFilters.locations.length > 0 && (
                  <Badge colorScheme="green">
                    Локации: {localFilters.locations.length}
                  </Badge>
                )}
                {localFilters.minMatchScore > 0 && (
                  <Badge colorScheme="purple">
                    Совпадение: {localFilters.minMatchScore}%+
                  </Badge>
                )}
                {localFilters.maxBudget < 1000000 && (
                  <Badge colorScheme="orange">
                    Бюджет: до {localFilters.maxBudget.toLocaleString()}₽
                  </Badge>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={clearFilters}
                  leftIcon={<FaTimes />}
                >
                  Очистить все
                </Button>
              </Wrap>
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  );
};

export default EnhancedSearchFilters; 