// src/data/stats.ts
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaHeadphones, 
  FaUserPlus, 
  FaWalking, 
  FaClock, 
  FaCheckCircle, 
  FaGraduationCap 
} from "react-icons/fa";

const stats = [
  { title: "Users (Total)", value: 1254, icon: FaUsers, iconBgColor: "bg-blue-500" },
  { title: "Follow Ups", value: 42, icon: FaCalendarCheck, iconBgColor: "bg-green-500" },
  { title: "Enquiries (Total)", value: 325, icon: FaHeadphones, iconBgColor: "bg-violet-500" },
  { title: "New Leads", value: 56, icon: FaUserPlus, iconBgColor: "bg-pink-500" },
  { title: "Visited/Walk-in", value: 28, icon: FaWalking, iconBgColor: "bg-indigo-500" },
  { title: "Pending Follow up", value: 15, icon: FaClock, iconBgColor: "bg-red-500" },
  { title: "Ready for Batch", value: 18, icon: FaCheckCircle, iconBgColor: "bg-teal-500" },
  { title: "Admission Done", value: 124, icon: FaGraduationCap, iconBgColor: "bg-green-600" },
];

export default stats;
