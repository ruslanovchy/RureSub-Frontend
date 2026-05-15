import { create } from 'zustand'

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthorized: null,

    loginWithUser: (user) => {
        set({
            token: localStorage.getItem('accessToken'),
            user,
            isAuthorized: true
        })
    },

    login: (token, user) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({
            token,
            user,
            isAuthorized: true
        })
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({
            token: null,
            user: null,
            isAuthorized: false
        })
    }
}));

export const useAuthOverlayStore = create((set) => ({
    openedModal: null,
    isOpened: false,

    setOpenedModal: (mode) => {
        set({
            openedModal: mode
        })
    },

    closeModal: () => {
        set({
            openedModal: null
        })
    },

    setIsOpened: (mode) => {
        set({
            isOpened: mode
        })
    }
}));