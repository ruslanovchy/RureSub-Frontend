import { useQuery } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { api } from "../api";

export const ProfileContext = createContext();

const fetchUser = async (userName) => {
    const res = await api.get(`profile?userName=${userName}`);
    return res.data;
}

function User() {
    const params = useParams();
    const queryKey = ['user', params.userName];

    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: () => fetchUser(params.userName)
    });

    const user = useAuthStore(store => store.user);

    if (isLoading) {
        return;
    }

    if (error) {
        return;
    }
    
    const isProfileOwner = user ? data.userId == user.id : false;

    const contextData = {
        profileData: data,
        isProfileOwner,
        queryKey
    }

    return (
        <ProfileContext.Provider value={contextData}>
            <Outlet/>
        </ProfileContext.Provider>
    )
}

export default User;