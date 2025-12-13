'use client'

import { useState } from 'react'
import { createSubscription, createToken } from '@/app/actions/subscription'

interface SubscriptionFormProps {
  scriptLoaded: boolean
}

export default function SubscriptionForm({ scriptLoaded }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const expYear = formData.get('expYear') as string
    const cardData = {
      number: formData.get('cardNumber') as string,
      exp_month: formData.get('expMonth') as string,
      exp_year: expYear.length === 2 ? `20${expYear}` : expYear, // 2桁の場合は4桁に変換
      cvc: formData.get('cvc') as string,
    }
    const email = formData.get('email') as string

    try {
      console.log('サーバーサイドでトークン作成中...')

      // サーバーサイドでトークン作成
      const tokenResult = await createToken(cardData)

      if (!tokenResult.success) {
        throw new Error(tokenResult.error || 'トークン作成に失敗しました')
      }

      console.log('✅ トークン作成成功:', tokenResult.token)

      // 成功メッセージを表示
      setResult({
        tokenId: tokenResult.token,
        message: 'トークン作成に成功しました！',
      })
      console.log('✅ トークン作成テスト成功！')

      // NOTE: サブスクリプション作成を実行する場合は、
      // pay.jpの管理画面でプランを作成してから以下のコメントを外してください
      /*
      const result = await createSubscription(
        tokenResult.token,
        email,
        'basic_plan'
      )

      if (result.success) {
        setResult(result.data)
        console.log('✅ サブスクリプション登録成功！', result.data)
      } else {
        setError(result.error)
      }
      */
    } catch (err: any) {
      console.error('エラー:', err)
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        サブスクリプション登録テスト
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">✅ {result.message || '登録成功！'}</p>
          {result.tokenId && (
            <p className="text-sm mt-2">トークンID: {result.tokenId}</p>
          )}
          {result.customerId && (
            <>
              <p className="text-sm mt-2">顧客ID: {result.customerId}</p>
              <p className="text-sm">サブスクID: {result.subscriptionId}</p>
              <p className="text-sm">ステータス: {result.status}</p>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="test@example.com"
            defaultValue="test@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カード番号
            <span className="text-xs text-gray-500 ml-2">
              (テスト: 4242424242424242)
            </span>
          </label>
          <input
            type="text"
            name="cardNumber"
            required
            maxLength={16}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="4242424242424242"
            defaultValue="4242424242424242"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月
            </label>
            <input
              type="text"
              name="expMonth"
              required
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="12"
              defaultValue="12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年
            </label>
            <input
              type="text"
              name="expYear"
              required
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="2030"
              defaultValue="2030"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              name="cvc"
              required
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="123"
              defaultValue="123"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
        >
          {loading ? '処理中...' : 'トークン作成テスト'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
        <p className="font-semibold mb-2">💡 テストカード情報</p>
        <p>カード番号: 4242424242424242</p>
        <p>有効期限: 12/2030</p>
        <p>CVC: 123</p>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    Payjp: any
  }
}
