import { create } from "zustand";

export const useSettingsStore = create(set =>({
    profileData: null,
    meDetailedData: null,
    accountSettings: null,

    setProfileData: (data) => {
        set({
            profileData: data
        })
    },
    setMeDetailedData: (data) => {
        set({
            meDetailedData: data
        })
    },
    setAccountSettings: (data) => {
        set({
            accountSettings: data
        })
    },
}));