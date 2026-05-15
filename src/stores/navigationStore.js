import { create } from "zustand";

export const useNavigationStore = create(set=>({
    isSidebarOpened: false,

    openSidebar: () => {
        set({
            isSidebarOpened: true
        })
    },
    closeSidebar: () => {
        set({
            isSidebarOpened: false
        })
    },
    setIsSidebarOpened: (mode) => {
        set({
            isSidebarOpened: mode
        })
    }
}));