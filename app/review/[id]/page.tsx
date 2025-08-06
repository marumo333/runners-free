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
    //レビュデータをsupabaseから取得
    useEffect(()=>{
        const fetchReview = async()=>{
            try{
                setLoading(true);
                const { data,error} = await supabase
                .from('reviews')
                .select('*')
                .eq('shoppost_id',shopId)
                .order('creadted_at',{ascending:false})

                if(error){
                    console.error('レビューデータ取得エラー:',error)
                }
                setReviews(data||[])
            }catch(error){
                console.error('レビューデータ取得エラー:',error)
            }finally{
                setLoading(false);
            }
        }
        if(shopId){
        fetchReview();
        }
    },[shopId,supabase])

    //レビュー投稿
    const handleSubmitReview = async(e:React.FormEvent)=>{
        e.preventDefault();
        try{
            setSubmitting(true);

            //現在のユーザーを取得
            const {data: {user}} = await supabase.auth.getUser() 
            
            if(!user){
                console.error('ユーザーがログインしていません');
                return;
            }
        }catch(error){
            console.error('レビュー投稿エラー:', error);
        }finally{
            setSubmitting(false);
        }
    }
    return(<>
    </>)
}