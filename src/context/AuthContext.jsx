import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const[session,setSession] = useState(null);
    const[user,setUser] = useState(null);
    const[loading,setLoading] = useState(true);

    useEffect(() => {
        // Load initial session
        supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
        });

        // Listen for auth changes (email verify here)
        const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

        }
        );

        return () => listener.subscription.unsubscribe();
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
        const {error} = await supabase.auth.signUp({
            email,
            password,
            options:{
                data:metadata,
                emailRedirectTo: 'http://localhost:8081', // or deep link
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