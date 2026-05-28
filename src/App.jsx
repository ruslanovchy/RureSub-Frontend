import { useEffect, useRef, useState } from 'react'
import './App.scss'
import './Auth/Auth.scss'
import { Routes, Route, useNavigate } from 'react-router-dom'
import AuthOverlay from './Auth/Auth'
import { api } from "./api.js"
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore.js'
import { notifyPromise } from './notification.js'
import Header from './Header/Header.jsx'
import Navigation from './Navigation/Navigation.jsx'
import Profile from './Profile/Profile.jsx'
import { useAccountOverlayStore } from './stores/accountOverlayStore.js'
import AccountOverlay from './Header/AccountOverlay.jsx'
import LoadingBar from './LoadingBar/LoadingBar.jsx'
import Settings from './Settings/Settings.jsx'
import ProfileSettings from './Settings/Pages/ProfileSettings.jsx'
import AccountSettings from './Settings/Pages/AccountSettings.jsx'
import { useProfileStore } from './stores/profileStore.js'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import SecuritySettings from './Settings/Pages/SecuritySettings.jsx'
import Create from './Create/Create.jsx'
import Home from './Home/Home.jsx'
import Post from './Post/Post.jsx'

export let globalNavigate = null;

export const queryClient = new QueryClient();

export function resetQuery(key) {
  queryClient.removeQueries({ queryKey: key});
} 

function App() {
	const navigate = useNavigate();
	globalNavigate = navigate;

	
	const accountOverlayRef = useRef(null);


	return (
      <QueryClientProvider client={queryClient}>
		<div className='app-container'>
			<Toaster
				toastOptions={{
					className: 'toast',
				}}/>

			<LoadingBar/>

			<Header overlayRef={accountOverlayRef}/>

			<AuthOverlay/>

			<div className='main-container'>

				<Navigation />

				<Routes>
					<Route path='/' element={<Home/>}/>
					<Route path='/user/:userName' element={<Profile/>}></Route>
					<Route path='/settings' element={<Settings/>}>
						<Route path='account' element={<AccountSettings/>}/>
						<Route path='profile' element={<ProfileSettings/>}/>
						<Route path='security' element={<SecuritySettings/>}/>
					</Route>
					<Route path='/post/:id' element={<Post/>}/>
					<Route path='/create' element={<Create/>}/>
				</Routes>

			</div>
			
            <AccountOverlay ref={accountOverlayRef}/>
			
		</div>
      </QueryClientProvider>
	)
}

export default App;
