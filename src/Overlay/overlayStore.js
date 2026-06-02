import { create } from "zustand";

export const useOverlayStore = create((set) => ({
    data: null,

    setData: (data) => {
        set({
            data
        })
    }
}))