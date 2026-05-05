import { useState, useEffect } from 'react';

export function useGlobalScheduleLogic() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [profSearch, setProfSearch] = useState('');
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
  const [dayFilter, setDayFilter] = useState('');
  const [timeStartFilter, setTimeStartFilter] = useState(''); 
  const [timeEndFilter, setTimeEndFilter] = useState(''); 
  
  const [sortConfig, setSortConfig] = useState({ key: 'subject_Code', direction: 'asc' });

  // 1. ISOLATED MOUNT EFFECT
  useEffect(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/schedules')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) setSchedules(data); 
      })
      .catch(err => console.error("Failed to fetch global schedules:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
    return () => { isMounted = false; };
  }, []);

  // 2. EXTRACT UNIQUE VALUES FOR DROPDOWNS
  const uniqueRoomsMap = new Map();
  const uniqueProfsMap = new Map();

  schedules.forEach(s => {
    if (s.room_ID && !uniqueRoomsMap.has(s.room_ID)) {
      uniqueRoomsMap.set(s.room_ID, { id: s.room_ID, building: s.building });
    }
    if (s.professor_ID && !uniqueProfsMap.has(s.professor_ID)) {
      uniqueProfsMap.set(s.professor_ID, { id: s.professor_ID, name: s.professor_Name, face: s.professor_Face_Reference_Path });
    }
  });

  const uniqueRooms = Array.from(uniqueRoomsMap.values()).sort((a, b) => a.id.localeCompare(b.id));
  const uniqueProfs = Array.from(uniqueProfsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // 3. TIME CONVERSION HELPERS
  const timeToMinutes12h = (time12) => {
    if (!time12 || time12 === 'TBA') return null;
    let [time, period] = time12.split(' ');
    if (!time || !period) return null;
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const timeToMinutes24h = (time24) => {
    if (!time24) return null;
    let [h, m] = time24.split(':').map(Number);
    return h * 60 + m;
  };

  // 4. FILTERING LOGIC
  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = (s.subject_Code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.section_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.subject_Title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoom = roomSearch ? (s.room_ID || '').toLowerCase().includes(roomSearch.toLowerCase()) || (s.building || '').toLowerCase().includes(roomSearch.toLowerCase()) : true;
    const matchesProf = profSearch ? (s.professor_Name || '').toLowerCase().includes(profSearch.toLowerCase()) || (s.professor_ID || '').toLowerCase().includes(profSearch.toLowerCase()) : true;
    const matchesDay = dayFilter ? (s.class_Days || '').toLowerCase().includes(dayFilter.toLowerCase()) : true;
    
    let matchesTime = true;
    if (timeStartFilter || timeEndFilter) {
       const schedStart = timeToMinutes12h(s.time_Start);
       const schedEnd = timeToMinutes12h(s.time_End);
       const filterStart = timeStartFilter ? timeToMinutes24h(timeStartFilter) : 0;
       const filterEnd = timeEndFilter ? timeToMinutes24h(timeEndFilter) : 1440; 

       if (schedStart !== null && schedEnd !== null) {
          matchesTime = (schedStart < filterEnd) && (schedEnd > filterStart);
       }
    }

    return matchesSearch && matchesRoom && matchesProf && matchesDay && matchesTime;
  });

  // 5. SORTING LOGIC
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return {
    isLoading,
    schedules,
    sortedSchedules,
    uniqueRooms,
    uniqueProfs,
    zoomedImage,
    setZoomedImage,
    searchQuery,
    setSearchQuery,
    roomSearch,
    setRoomSearch,
    profSearch,
    setProfSearch,
    isRoomDropdownOpen,
    setIsRoomDropdownOpen,
    isProfDropdownOpen,
    setIsProfDropdownOpen,
    dayFilter,
    setDayFilter,
    timeStartFilter,
    setTimeStartFilter,
    timeEndFilter,
    setTimeEndFilter,
    sortConfig,
    handleSort
  };
}