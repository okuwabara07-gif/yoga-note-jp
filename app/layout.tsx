import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'ヨガノート',
  description: 'ヨガ・瞑想情報メディア',
  keywords: 'ヨガノート,ヨガ・瞑想情報メディア',
  openGraph: {
    title: 'ヨガノート',
    description: 'ヨガ・瞑想情報メディア',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'ヨガノート',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ヨガノート',
    description: 'ヨガ・瞑想情報メディア',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-SVQXY5C3PW"></script>
      <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SVQXY5C3PW');`}} />
      <body>{children}</body>
    </html>
  )
}
