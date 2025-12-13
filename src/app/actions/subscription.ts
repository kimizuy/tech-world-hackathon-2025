'use server'

import payjp from 'payjp'

const client = payjp(process.env.PAYJP_SECRET_KEY!)

export async function createToken(cardData: {
  number: string
  exp_month: string
  exp_year: string
  cvc: string
}) {
  try {
    console.log('トークン作成開始...')
    console.log('シークレットキー:', process.env.PAYJP_SECRET_KEY?.slice(0, 10) + '...')
    console.log('カードデータ:', {
      number: cardData.number.slice(0, 4) + '****',
      exp_month: cardData.exp_month,
      exp_year: cardData.exp_year
    })

    const token = await client.tokens.create({
      card: {
        number: cardData.number,
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        cvc: cardData.cvc,
      }
    })

    console.log('トークン作成成功:', token.id)

    return {
      success: true,
      token: token.id,
    }
  } catch (error: any) {
    console.error('トークン作成エラー詳細:')
    console.error('- メッセージ:', error.message)
    console.error('- ステータス:', error.status)
    console.error('- レスポンス:', error.response)
    console.error('- 完全なエラー:', JSON.stringify(error, null, 2))

    return {
      success: false,
      error: `${error.message} (ステータス: ${error.status})`,
    }
  }
}

export async function createSubscription(
  token: string,
  email: string,
  planId: string = 'basic_plan'
) {
  try {
    console.log('顧客作成開始...')

    const customer = await client.customers.create({
      card: token,
      email: email,
    })

    console.log('顧客作成成功:', customer.id)

    const subscription = await client.subscriptions.create({
      customer: customer.id,
      plan: planId,
    })

    console.log('サブスクリプション作成成功:', subscription.id)

    return {
      success: true,
      data: {
        customerId: customer.id,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      },
    }
  } catch (error: any) {
    console.error('エラー詳細:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await client.subscriptions.retrieve(subscriptionId)
    return { success: true, subscription }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await client.subscriptions.cancel(subscriptionId)
    return { success: true, subscription }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
