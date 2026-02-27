import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";

const AuthContext = createContext(null);

function parseHashParams(url) {
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) return {};

    return url
        .slice(hashIndex + 1)
        .split("&")
        .reduce((acc, pair) => {
            const [rawKey, rawValue = ""] = pair.split("=");
            if (!rawKey) return acc;
            acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
            return acc;
        }, {});
}

function getAuthTokensFromUrl(url) {
    if (!url) return null;

    const parsed = Linking.parse(url);
    const query = parsed?.queryParams ?? {};
    const hash = parseHashParams(url);

    const access_token = query.access_token || hash.access_token;
    const refresh_token = query.refresh_token || hash.refresh_token;
    const type = query.type || hash.type;

    if (!access_token || !refresh_token) return null;
    return { access_token, refresh_token, type };
}

export function AuthProvider({children}){
    const[session,setSession] = useState(null);
    const[user,setUser] = useState(null);
    const[loading,setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const applySessionFromUrl = async (url) => {
            const tokens = getAuthTokensFromUrl(url);
            if (!tokens) return;

            const { error } = await supabase.auth.setSession({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
            });

            if (error) {
                console.warn("Magic link session set failed:", error.message);
            }
        };

        const bootstrap = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    await applySessionFromUrl(initialUrl);
                }

                const { data } = await supabase.auth.getSession();
                if (!mounted) return;
                setSession(data.session);
                setUser(data.session?.user ?? null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        bootstrap();

        const urlSubscription = Linking.addEventListener("url", ({ url }) => {
            applySessionFromUrl(url);
        });

        // Listen for auth changes (email verify here)
        const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

        }
        );

        return () => {
            mounted = false;
            urlSubscription.remove();
            listener.subscription.unsubscribe();
        };
    }, []);


    //login
    const login = async(email,password)=>{
        const{error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        
    };

    //sign up (email verification)
    const signUp = async (email, password, metadata = {}) =>{
        const emailRedirectTo =
            process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || Linking.createURL("auth/callback");
        const {error} = await supabase.auth.signUp({
            email,
            password,
            options:{
                data:metadata,
                emailRedirectTo,
            },
        });
        if (error) throw error;
    };

    const logout = async() =>{
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{session,user,loading,login, signUp, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
