"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('セッションIDが見つかりません')
      setLoading(false)
      return
    }

    // 注文詳細を取得
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/checkout/success?session_id=${sessionId}`)
        const data = await response.json()
        
        if (response.ok) {
          setOrderDetails(data)
        } else {
          setError(data.error || '注文情報の取得に失敗しました')
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
        setError('注文情報の取得中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">注文を処理中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 成功メッセージ */}
        <div className="text-center mb-8">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ご注文ありがとうございます！
          </h1>
          <p className="text-gray-600">
            決済が正常に完了しました。注文確認メールを送信いたします。
          </p>
        </div>

        {/* 注文詳細 */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">注文詳細</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">注文番号:</span>
                <span className="font-medium">{orderDetails.id || sessionId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">決済金額:</span>
                <span className="font-medium text-green-600">
                  ¥{orderDetails.amount ? orderDetails.amount.toLocaleString() : '---'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">決済方法:</span>
                <span className="font-medium">クレジットカード</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">注文日時:</span>
                <span className="font-medium">
                  {orderDetails.created_at 
                    ? new Date(orderDetails.created_at).toLocaleString('ja-JP')
                    : new Date().toLocaleString('ja-JP')
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard/customer')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            注文履歴を確認
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ショッピングを続ける
          </button>
        </div>

        {/* 追加情報 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">次のステップ</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 注文確認メールをご確認ください</li>
            <li>• 商品の発送準備が整い次第、発送通知をお送りします</li>
            <li>• ご質問がございましたら、お気軽にお問い合わせください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}