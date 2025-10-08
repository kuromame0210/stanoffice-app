# Stan Office Replacement - Next.js + Supabase

掲示板型ウェブサイト（ガールズチャンネル風）

## 技術スタック

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage)
- **Vercel** (デプロイ)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com/) にアクセスしてプロジェクト作成
2. SQL EditorでテーブルとRLSポリシーを作成（`../so_replace/docs/DATABASE_SUPABASE.md` 参照）

### 3. 環境変数設定

`.env.local` ファイルを編集:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Supabaseの Settings > API から取得できます。

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## プロジェクト構造

```
stanoffice-app/
├── app/
│   ├── actions/              # Server Actions（データベース操作）
│   │   ├── topics.ts
│   │   └── comments.ts
│   ├── components/
│   │   ├── elements/         # 基本UI部品
│   │   │   ├── StanNewButton/
│   │   │   └── StanTabButton/
│   │   └── layouts/          # レイアウトコンポーネント
│   │       ├── StanHeader/
│   │       ├── StanTopic/
│   │       ├── StanTopicCard/
│   │       └── StanPopularTopic/
│   ├── lib/
│   │   └── supabase/         # Supabaseクライアント
│   │       ├── client.ts     # クライアント用
│   │       └── server.ts     # サーバー用
│   ├── types/
│   │   └── database.types.ts # データベース型定義
│   ├── page.tsx              # トップページ
│   ├── layout.tsx            # ルートレイアウト
│   └── style.css             # グローバルスタイル
├── public/
├── .env.local                # 環境変数（要設定）
└── package.json
```

## 主要機能

### 実装済み
- ✅ Next.js 15 + TypeScript + Tailwind CSS環境
- ✅ Supabase連携設定
- ✅ Server Actions（topics, comments）
- ✅ UIコンポーネント（元のデザインを移植）
- ✅ 型安全なデータベース操作

### 今後の実装
- [ ] Supabaseテーブル作成・RLS設定
- [ ] トピック一覧の実データ表示
- [ ] トピック詳細画面（`/topics/[id]`）
- [ ] コメント機能
- [ ] トピック投稿画面
- [ ] 画像アップロード（Supabase Storage）
- [ ] 検索機能
- [ ] ページネーション

## データベース設計

詳細は `../so_replace/docs/DATABASE_SUPABASE.md` を参照

### テーブル

1. **topics** - トピック
   - id, title, body, image_url
   - author_name, is_anonymous, show_id
   - view_count, comment_count, status
   - created_at, updated_at

2. **comments** - コメント
   - id, topic_id, body
   - author_name, is_anonymous
   - created_at, updated_at

## デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

または、GitHubにpushすると自動デプロイされます。

### 環境変数設定（Vercel）

Vercel Dashboard > Settings > Environment Variables で設定:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 開発ガイド

### Server Actionsの使用

```typescript
// app/actions/topics.ts
'use server'

export async function getTopics() {
  const supabase = await createClient()
  const { data } = await supabase.from('topics').select('*')
  return data
}
```

### コンポーネントからの呼び出し

```typescript
// Client Component
'use client'
import { getTopics } from '@/app/actions/topics'

export function TopicList() {
  const [topics, setTopics] = useState([])

  useEffect(() => {
    getTopics().then(setTopics)
  }, [])

  return <div>{/* ... */}</div>
}
```

または

```typescript
// Server Component
import { getTopics } from '@/app/actions/topics'

export default async function Page() {
  const topics = await getTopics()
  return <div>{/* ... */}</div>
}
```

## トラブルシューティング

### Supabase接続エラー

1. `.env.local` の環境変数を確認
2. Supabaseプロジェクトが起動しているか確認
3. RLSポリシーが正しく設定されているか確認

### 型エラー

型定義を再生成:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/types/database.types.ts
```

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [元のプロジェクト](https://github.com/kuromame0210/so_replace)

## ライセンス

MIT
