'use client';
import React from 'react';
import FundraisingDebt from './AdminDashboard'; // Adjust the import path as needed

const Admin = ({ userType }) => {
  return (
    <div className='flex'>
      <main className='flex-1'>
        <FundraisingDebt userType={userType} />
      </main>
    </div>
  );
};

export default Admin;
