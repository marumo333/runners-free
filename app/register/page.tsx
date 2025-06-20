'use client'
import {useState} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabase"

export default function Register (){
    const [email,setEmail] = useState("")
    const [password,setPassWord] = useState("")
    const [role,setRole] = useState<"admin"|"customer">("customer")
    const router = useRouter();

    
    return(
        <>
        </>
    )
}
