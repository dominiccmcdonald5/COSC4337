"use client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IconHome, IconFileMusic, IconUsers } from "@tabler/icons-react";

export const FloatingNav = () => {
  const navItems = [
    { name: "Home", icon: <IconHome className="h-5 w-5" />, link: "/" },
    { name: "About Bioacoustics", icon: <IconFileMusic className="h-5 w-5" />, link: "/about-bioacoustics" },
    { name: "About Us", icon: <IconUsers className="h-5 w-5" />, link: "/about-us" },
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
          padding: '16px 32px'
        }}
        className="flex items-center space-x-8"
      >
        {navItems.map((item) => (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={item.link}
              className="flex items-center space-x-3 rounded-full transition-all duration-200"
              style={{
                color: '#10B981',
                textDecoration: 'none',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-base font-medium">{item.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};