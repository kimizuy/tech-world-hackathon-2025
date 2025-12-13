'use client'

import { useState } from 'react'
import Script from 'next/script'
import SubscriptionFormV2 from '@/app/components/SubscriptionFormV2'

export default function SubscribePage() {
  const [payjpLoaded, setPayjpLoaded] = useState(false)

  return (
    <>
      <Script
        src="https://js.pay.jp/v2/pay.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('pay.jp v2スクリプト読み込み完了')
          setPayjpLoaded(true)
        }}
      />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            プランを選択してご登録ください
          </h1>
          <SubscriptionFormV2 scriptLoaded={payjpLoaded} />
        </div>
      </main>
    </>
  )
}
