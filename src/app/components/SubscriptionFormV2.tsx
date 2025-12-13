'use client'

import { useState, useEffect, useRef } from 'react'
import { createSubscription } from '@/app/actions/subscription'

interface SubscriptionFormProps {
  scriptLoaded: boolean
}

export default function SubscriptionFormV2({ scriptLoaded }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [payjpReady, setPayjpReady] = useState(false)
  const cardElementRef = useRef<any>(null)
  const payjpRef = useRef<any>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!scriptLoaded || typeof window === 'undefined' || !window.Payjp) return

    try {
      const publicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY!
      console.log('pay.jp初期化中...', publicKey.slice(0, 10) + '...')

      // pay.jp v2の初期化
      const payjp = window.Payjp(publicKey)
      payjpRef.current = payjp

      const elements = payjp.elements()

      // 統合カード要素を使用（推奨）
      const cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': {
              color: '#9ca3af',
            },
          },
        },
      })

      cardElement.mount('#card-element')
      cardElementRef.current = cardElement

      console.log('✅ pay.jp Elements マウント完了')
      setPayjpReady(true)
    } catch (err) {
      console.error('pay.jp初期化エラー:', err)
      setError('pay.jpの初期化に失敗しました')
    }
  }, [scriptLoaded])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const email = emailRef.current?.value || ''

    try {
      if (!payjpRef.current || !cardElementRef.current) {
        throw new Error('pay.jpが初期化されていません')
      }

      console.log('トークン作成中...')

      // v2 APIでトークン作成
      const tokenResult = await payjpRef.current.createToken(cardElementRef.current)

      console.log('トークン作成結果:', tokenResult)

      if (tokenResult.error) {
        console.error('トークン作成エラー詳細:', {
          type: tokenResult.error.type,
          code: tokenResult.error.code,
          message: tokenResult.error.message,
          param: tokenResult.error.param,
        })
        throw new Error(tokenResult.error.message || 'トークン作成に失敗しました')
      }

      console.log('✅ トークン作成成功:', tokenResult.id)

      // サブスクリプション作成
      const result = await createSubscription(
        tokenResult.id,
        email,
        'basic_plan'
      )

      if (result.success) {
        setResult(result.data)
        console.log('✅ サブスクリプション登録成功！', result.data)
      } else {
        setError(result.error)
      }
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
        サブスクリプション登録
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">✅ サブスクリプション登録成功！</p>
          <p className="text-sm mt-2">顧客ID: {result.customerId}</p>
          <p className="text-sm">サブスクID: {result.subscriptionId}</p>
          <p className="text-sm">ステータス: {result.status}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            ref={emailRef}
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="test@example.com"
            defaultValue="test@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カード情報
          </label>
          <div
            id="card-element"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500"
            style={{ minHeight: '40px' }}
          ></div>
        </div>

        <button
          type="submit"
          disabled={loading || !payjpReady}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
        >
          {!payjpReady
            ? 'pay.jp読み込み中...'
            : loading
            ? '処理中...'
            : '登録する（¥1,000/月 - 7日間無料）'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
        <p className="font-semibold mb-2">💡 テストカード情報</p>
        <p>カード番号: 4242 4242 4242 4242</p>
        <p>有効期限: 12/30 (任意の未来の日付)</p>
        <p>CVC: 123 (任意の3桁)</p>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    Payjp: any
  }
}
