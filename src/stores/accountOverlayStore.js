import { create } from "zustand";

export const useAccountOverlayStore = create((set) => ({
    isOpened: false,

    setIsOpened: (mode) => {
        set({
            isOpened: mode
        })
    }
}));