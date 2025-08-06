"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React,{useEffect,useState} from "react";

interface Review {
    id:string,
    shoppost_id:string,
    user_id:string,
    user_name:string,
    rating:number,
    commment:string,
    created_at:string
}
export default function Review({ params }: { params: { id: string } }){
    const router = useRouter()
    const supabase = createClientComponentClient()
    const shopId = params.id

    const [reveiwes,setReviews] = useState<Review[]>([])
    const [showReviewFrom,setReviewForm] = useState(false);
    const [loading,setLoading] = useState(true);
    const [submitting,setSubmitting] = useState(false);
    const [newReview,setNewReview] = useState({
        rating:5,
        comment:''
    })
    
    return(<>
    </>)
}