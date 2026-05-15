import { create } from "zustand";

export const useSettingsOverlayStore = create((set)=> ({
    isOpened: false,
    openedModal: '',

    setIsOpened: (mode) => {
        set({
            isOpened: mode
        })
    },

    setOpenedModal: (modal) => {
        set({
            openedModal: modal
        })
    }
}))