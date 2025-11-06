"use client";
import { motion } from "framer-motion";
import { IconHome, IconChartBar, IconFileMusic, IconBrain } from "@tabler/icons-react";

export const FloatingNav = () => {
  const navItems = [
    { name: "Home", icon: <IconHome className="h-4 w-4" />, link: "#" },
    { name: "Analysis", icon: <IconChartBar className="h-4 w-4" />, link: "#analysis" },
    { name: "Audio", icon: <IconFileMusic className="h-4 w-4" />, link: "#upload" },
    { name: "AI", icon: <IconBrain className="h-4 w-4" />, link: "#ai" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100]"
    >
      <div 
        style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(0, 0, 0, 0.8), rgba(16, 185, 129, 0.1))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '50px',
          padding: '8px 20px'
        }}
        className="flex items-center space-x-6"
      >
        {navItems.map((item, idx) => (
          <motion.a
            key={item.name}
            href={item.link}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200"
            style={{
              color: '#10B981',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.icon}
            <span className="text-sm font-medium hidden sm:block">{item.name}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};