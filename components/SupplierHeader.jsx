"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Menu, Plus, Settings, User, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function SupplierHeader() {
 const router = useRouter()
 const [isOpen, setIsOpen] = useState(false)
 const [supplier, setSupplier] = useState(null)
 const [isLoading, setIsLoading] = useState(true)
 const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
 const profileMenuRef = useRef(null)
 
 const closeMenu = () => setIsOpen(false)
 
 useEffect(() => {
   const checkAuth = async () => {
     try {
       const response = await fetch('/api/supplier/auth/user')
       if (response.ok) {
         const data = await response.json()
         console.log('Supplier data in header:', data.supplier) // Debug log
         setSupplier(data.supplier)
       }
     } catch (error) {
       console.error('Auth check failed:', error)
     } finally {
       setIsLoading(false)
     }
   }
   
   checkAuth()
 }, [])
 
 useEffect(() => {
   const handleClickOutside = (event) => {
     if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
       setIsProfileMenuOpen(false)
     }
   }
   
   document.addEventListener('mousedown', handleClickOutside)
   return () => {
     document.removeEventListener('mousedown', handleClickOutside)
   }
 }, [])
 
 const handleLogout = async () => {
   try {
     await fetch('/api/supplier/auth/logout', {
       method: 'POST',
     })
     setSupplier(null)
     setIsProfileMenuOpen(false)
     router.push('/')
   } catch (error) {
     console.error('Logout failed:', error)
   }
 }
 
 return (
   <motion.header
     className="bg-white shadow-lg sticky top-0 z-50"
     style={{ borderBottom: '2px solid #347433' }}
     initial={{ y: -100 }}
     animate={{ y: 0 }}
     transition={{ type: 'spring', stiffness: 300, damping: 30 }}
   >
     <div className="container mx-auto px-4 py-4 flex items-center justify-between">
       <Link href="/supplier/dashboard" className="text-xl font-bold flex items-center group" style={{color: '#347433'}}>
         <svg className="w-6 h-6 mr-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
         <span className="font-poppins tracking-tight">SupplyMind</span>
       </Link>
       
       {/* Main navigation */}
       <nav className="hidden md:flex items-center space-x-8 mx-auto">
         <Link href="/supplier/dashboard" className="text-gray-700 hover:text-green-700 transition-colors py-2 relative group">
           Dashboard
           <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-700 transition-all duration-300 group-hover:w-full"></span>
         </Link>
         <Link href="/supplier/add-raw-material" className="text-gray-700 hover:text-green-700 transition-colors py-2 relative group flex items-center">
           <Plus size={16} className="mr-1" />
           Add Raw Material
           <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-700 transition-all duration-300 group-hover:w-full"></span>
         </Link>
       </nav>
       
       {/* Right side profile */}
       <div className="hidden md:flex items-center space-x-4">
         {isLoading ? (
           <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
         ) : supplier ? (
           <div className="relative" ref={profileMenuRef}>
             <button 
               onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
               className="flex items-center space-x-2 text-gray-700 hover:text-green-700 focus:outline-none"
             >
               <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center" style={{border: '2px solid #347433'}}>
                 {supplier.profilePicture ? (
                   <img 
                     src={supplier.profilePicture} 
                     alt={supplier.supplierName} 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <User size={20} className="text-gray-500" />
                 )}
               </div>
               <span className="font-medium">{supplier.supplierName?.split(' ')[0]}</span>
               <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
             </button>
             
             {isProfileMenuOpen && (
               <motion.div 
                 className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-100"
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 <div className="px-4 py-2 border-b border-gray-100">
                   <p className="text-sm font-medium text-gray-900 truncate">{supplier.supplierName}</p>
                   <p className="text-xs text-gray-500 truncate">{supplier.email}</p>
                   {supplier.businessType && (
                     <p className="text-xs text-gray-400 truncate">{supplier.businessType}</p>
                   )}
                 </div>
                 
                 <Link href="/supplier/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
                   <User size={16} className="mr-2" />
                   <span>Profile</span>
                 </Link>
                 
                 <Link href="/supplier/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
                   <Settings size={16} className="mr-2" />
                   <span>Settings</span>
                 </Link>
                 
                 <button 
                   onClick={handleLogout}
                   className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                 >
                   <LogOut size={16} className="mr-2" />
                   <span>Logout</span>
                 </button>
               </motion.div>
             )}
           </div>
         ) : (
           /* Show Login button when not authenticated */
           <Link href="/supplier/login" className="text-white px-4 py-2 rounded-md transition-colors font-medium shadow-md hover:bg-green-800" style={{backgroundColor: '#347433'}}>
             Login
           </Link>
         )}
       </div>
       
       <button 
         className="md:hidden" 
         onClick={() => setIsOpen(!isOpen)}
         aria-label={isOpen ? "Close menu" : "Open menu"}
       >
         {isOpen ? <X style={{color: '#347433'}} /> : <Menu style={{color: '#347433'}} />}
       </button>
     </div>

     <AnimatePresence>
       {isOpen && (
         <motion.div
           className="md:hidden bg-white"
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: 'auto' }}
           exit={{ opacity: 0, height: 0 }}
           transition={{ duration: 0.3 }}
         >
           <nav className="flex flex-col items-center py-4 space-y-4">
             <Link href="/supplier/dashboard" className="text-gray-700 hover:text-green-700 transition-colors" onClick={closeMenu}>
               Dashboard
             </Link>
             <Link href="/supplier/add-raw-material" className="text-gray-700 hover:text-green-700 transition-colors flex items-center" onClick={closeMenu}>
               <Plus size={16} className="mr-1" />
               Add Raw Material
             </Link>
             
             {isLoading ? (
               <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
             ) : supplier ? (
               <div className="w-full flex flex-col items-center space-y-3 border-t border-gray-100 pt-4">
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center" style={{border: '2px solid #347433'}}>
                     {supplier.profilePicture ? (
                       <img 
                         src={supplier.profilePicture} 
                         alt={supplier.supplierName} 
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <User size={20} className="text-gray-500" />
                     )}
                   </div>
                   <div>
                     <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                     <p className="text-xs text-gray-500">{supplier.email}</p>
                     {supplier.businessType && (
                       <p className="text-xs text-gray-400">{supplier.businessType}</p>
                     )}
                   </div>
                 </div>
                 
                 <Link href="/supplier/profile" 
                   className="w-full max-w-xs text-white px-4 py-2 rounded-full text-center transition-all duration-300 font-medium shadow-md flex items-center justify-center hover:bg-green-800"
                   style={{backgroundColor: '#347433'}}
                   onClick={closeMenu}
                 >
                   <User size={16} className="mr-2" />
                   Profile
                 </Link>
                 
                 <Link href="/supplier/settings" 
                   className="w-full max-w-xs text-white px-4 py-2 rounded-full text-center transition-all duration-300 font-medium shadow-md flex items-center justify-center hover:bg-green-800"
                   style={{backgroundColor: '#347433'}}
                   onClick={closeMenu}
                 >
                   <Settings size={16} className="mr-2" />
                   Settings
                 </Link>
                 
                 <button 
                   onClick={() => {
                     closeMenu();
                     handleLogout();
                   }}
                   className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-center transition-all duration-300 font-medium shadow-md flex items-center justify-center"
                 >
                   <LogOut size={16} className="mr-2" />
                   Logout
                 </button>
               </div>
             ) : (
               /* Show Login button in mobile when not authenticated */
               <div className="w-full flex flex-col items-center space-y-3 border-t border-gray-100 pt-4">
                 <Link href="/supplier/login" 
                   className="w-full max-w-xs text-white px-4 py-2 rounded-full text-center transition-all duration-300 font-medium shadow-md hover:bg-green-800"
                   style={{backgroundColor: '#347433'}}
                   onClick={closeMenu}
                 >
                   Login
                 </Link>
               </div>
             )}
           </nav>
         </motion.div>
       )}
     </AnimatePresence>
   </motion.header>
 );
}
