import { create } from "zustand";

export const useProfileStore = create(set => ({
    data: null,

    setData: (data) => {
        set({
            data
        })
    }
}))