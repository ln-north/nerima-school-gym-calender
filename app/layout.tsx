import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '練馬区 学校体育館個人開放カレンダー',
  description: '練馬区の学校体育館個人開放日程をカレンダー形式で表示',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
