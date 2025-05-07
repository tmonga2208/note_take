"use client"
import React from 'react'
import LoginModal from './login-popover'
import { useUser } from '../context/usercontext'
import ProfileDropdown from './profile-dropdown';
import Image from 'next/image';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';

export default function Navbar2() {
  const { user } = useUser();
  return (
    <div>
        <nav className="flex justify-between items-center p-4">
        <div className='flex items-center justify-center gap-2'>
          <Image src="/logo.png" width={40} height={40} alt='logo' />
            <h1 className="text-2xl font-bold">NOTI</h1>
            </div>
            <div>
          {!user ? (
            <div>
            <Button variant="ghost" className='text-center mx-4'><Edit/>Edit</Button> 
              <LoginModal/>
            </div>
          ) : (
            <div className='flex'>                
                <ProfileDropdown 
                  photoURL={user?.photoURL || ''} 
                  displayName={user?.displayName || ''} 
                  email={user?.email || ''} 
                />
            </div>
            )}
            </div>
        </nav>
    </div>
  )
}

