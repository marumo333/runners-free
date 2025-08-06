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

    const [reviews,setReviews] = useState<Review[]>([])
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
            setReviews([data[0],...reviews])
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
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    //日付をフォーマット化
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ja-JP');
    }

    //星の評価を表示する関数
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
                    ★
                </span>
            );
        }
        return stars;
    }
    
    return(<>
     <div className="max-w-4xl mx-auto p-6">
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        ← 戻る
      </button>

      {/* レビュー統計 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">レビュー</h1>
        <div className="flex items-center">
          {renderStars(Math.round(parseFloat(averageRating)))}
          <span className="ml-3 text-xl font-semibold">{averageRating}</span>
          <span className="ml-2 text-gray-600">({reviews.length}件のレビュー)</span>
        </div>
      </div>

      {/* レビュー投稿ボタン */}
      <div className="mb-8">
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          {showReviewForm ? 'フォームを閉じる' : 'レビューを書く'}
        </button>
      </div>
{/* レビュー投稿フォーム */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">レビューを投稿</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`text-2xl ${
                      star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                コメント
              </label>
              <textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="商品についてのご感想をお聞かせください..."
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '投稿中...' : '投稿する'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* レビュー一覧 */}
      <div>
        <h3 className="text-2xl font-semibold mb-6">レビュー一覧</h3>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">レビューを読み込み中...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">まだレビューがありません。</p>
            <button
            onClick={() => setShowReviewForm(true)}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              最初のレビューを書く
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{review.user_name}</h4>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.commment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>)
}