// src/data/stats.ts
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaHeadphones,
  FaTachometerAlt, 
  FaPlusCircle,
  FaSearch,
  FaClock, 
  FaCheckCircle, 
  // FaUserPlus, 
  // FaWalking, 
  // FaGraduationCap 
} from "react-icons/fa";

const stats = [
  { title: "Total Enquiries", value: 1254, icon: FaUsers, iconBgColor: "bg-blue-500" },
  { title: "Conferm Enquiries", value: 42, icon: FaCalendarCheck, iconBgColor: "bg-green-500" },
  { title: "Pending Enquiries", value: 325, icon: FaHeadphones, iconBgColor: "bg-violet-500" },
  { title: "Process Enquiries", value: 56, icon: FaTachometerAlt, iconBgColor: "bg-pink-500" },
  { title: "Today's Follow Ups", value: 28, icon: FaCalendarCheck , iconBgColor: "bg-indigo-500" },
  { title: "All Follow Ups", value: 18, icon: FaCheckCircle, iconBgColor: "bg-teal-500" },
  { title: "Pending Follow up", value: 15, icon: FaClock, iconBgColor: "bg-red-500" },
  { title: "Add Enquiries", value: 124, icon: FaPlusCircle, iconBgColor: "bg-blue-500" },
  { title: "Search Enquiries", value: 124, icon: FaSearch, iconBgColor: "bg-indigo-500" },

];

export default stats;
