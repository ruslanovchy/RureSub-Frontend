import { useAuthOverlayStore, useAuthStore } from "../stores/authStore"

export const useCheckAuthorize = () => {
    const isAuthorized = useAuthStore(store => store.isAuthorized);
    const setIsOpened = useAuthOverlayStore(store => store.setIsOpened);
    const setOpenedModal = useAuthOverlayStore(store => store.setOpenedModal);

    const check = () => {
        if (isAuthorized) return isAuthorized;

        setIsOpened(true);
        setOpenedModal('login');

        return false;
    }
    return check
}