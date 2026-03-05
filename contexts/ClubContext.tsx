
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_CLUB_KEY = "playlink_selected_club";

interface Club {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  role: string;
}

interface ClubContextType {
  selectedClub: Club | null;
  setSelectedClub: (club: Club | null) => Promise<void>;
  clearSelectedClub: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

async function saveClubToStorage(club: Club | null): Promise<void> {
  try {
    const clubData = club ? JSON.stringify(club) : null;
    if (Platform.OS === "web") {
      if (clubData) {
        localStorage.setItem(SELECTED_CLUB_KEY, clubData);
      } else {
        localStorage.removeItem(SELECTED_CLUB_KEY);
      }
    } else {
      if (clubData) {
        await SecureStore.setItemAsync(SELECTED_CLUB_KEY, clubData);
      } else {
        await SecureStore.deleteItemAsync(SELECTED_CLUB_KEY);
      }
    }
  } catch (error) {
    console.error("Error saving club to storage:", error);
  }
}

async function loadClubFromStorage(): Promise<Club | null> {
  try {
    let clubData: string | null = null;
    if (Platform.OS === "web") {
      clubData = localStorage.getItem(SELECTED_CLUB_KEY);
    } else {
      clubData = await SecureStore.getItemAsync(SELECTED_CLUB_KEY);
    }
    return clubData ? JSON.parse(clubData) : null;
  } catch (error) {
    console.error("Error loading club from storage:", error);
    return null;
  }
}

export function ClubProvider({ children }: { children: ReactNode }) {
  const [selectedClub, setSelectedClubState] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubFromStorage().then((club) => {
      setSelectedClubState(club);
      setLoading(false);
    });
  }, []);

  const setSelectedClub = async (club: Club | null) => {
    console.log("Setting selected club:", club?.name || "none");
    setSelectedClubState(club);
    await saveClubToStorage(club);
  };

  const clearSelectedClub = async () => {
    console.log("Clearing selected club");
    setSelectedClubState(null);
    await saveClubToStorage(null);
  };

  if (loading) {
    return null;
  }

  return (
    <ClubContext.Provider
      value={{
        selectedClub,
        setSelectedClub,
        clearSelectedClub,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error("useClub must be used within ClubProvider");
  }
  return context;
}
