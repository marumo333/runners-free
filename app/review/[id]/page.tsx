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
    const [showReviewForm, setShowReviewForm] = useState(false)
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
        //すでに同じユーザがレビューしているのかチェック
        const {data:existingReview} = await supabase
        .from('reviews')
        .select('id')
        .eq('shoppost_id', shopId)
        .eq('user_id', user.id)
        .maybeSingle()
        if(existingReview){
            alert('この商品はレビュー済みです。')
            return;
        }
        const reviewData = {
            shoppost_id:shopId,
            user_id:user.id,
            user_name:user.user_metadata?.name||user.email||'Anonymous',
            rating:newReview.rating,
            comment:newReview.comment
        }
        const {data,error} = await supabase
        .from('reviews')
        .insert({reviewData})
        .select()

        if(error){
            console.error('レビュー投稿エラー',error)
            alert('レビューの投稿に失敗しました。')
            return;
        }
        //投稿成功時の処理
        if(data&&data.length>0){
            setReviews([data[0],...reveiwes])
            setNewReview({rating:5,comment:''})
            setShowReviewForm(false)
            alert('レビューが投稿されました！')
        }

        }catch(error){
            console.error('レビュー投稿エラー:', error);
            alert('レビューの投稿に失敗しました。')
        }finally{
            setSubmitting(false);
        }
    }
    //平均評価を計算
    const averageRating = reveiwes.length > 0
        ? (reveiwes.reduce((sum, review) => sum + review.rating, 0) / reveiwes.length).toFixed(1)
        : '0.0';

    //日付をフォーマット化
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ja-JP');
    }
    
    return(<>
        <div>
            <h1>レビュー</h1>
            <p>平均評価: {averageRating}</p>
        </div>
    </>)
}