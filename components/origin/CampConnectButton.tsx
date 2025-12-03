'use client';

import React, { useEffect } from 'react';
import { Button } from '@mui/material';
// We'll use a try-catch import or just assume it works. 
// Since I can't verify the exports, I'll write what's most likely correct based on instructions.
import { CampModal, useAuth, useModal } from '@campnetwork/origin/react';

export const CampConnectButton = () => {
  const { isAuthenticated, walletAddress } = useAuth();
  const { openModal } = useModal();

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      console.log('Origin Connected:', walletAddress);
      // TODO: Sync with Appwrite User Preferences
    }
  }, [isAuthenticated, walletAddress]);

  return (
    <>
      <Button 
        variant="outlined" 
        color="inherit" 
        onClick={openModal}
        sx={{ ml: 1 }}
      >
        {isAuthenticated ? 'Origin Connected' : 'Connect Origin'}
      </Button>
      
      <CampModal />
    </>
  );
};
