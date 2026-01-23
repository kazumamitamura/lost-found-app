# 🚀 新しいアプリ追加のクイックスタート

このガイドは、Master-Portfolio-DBに新しいアプリを追加する最短手順です。

## 5分で完了する手順

### 1️⃣ 接頭辞を選択（1分）

`app-prefix-registry.md` を確認して、使用可能な接頭辞を選択。

**例:**
- TODOアプリ → `todo_`
- ブログアプリ → `blog_`
- 予約システム → `booking_`

### 2️⃣ SQLファイルを作成（2分）

```bash
# テンプレートをコピー
cp templates/new-app-template.sql my-app-tables.sql
```

エディタで `[prefix]` を実際の接頭辞に一括置換：
- `[prefix]` → `todo` （例）
- `[prefix]-` → `todo-` （Storage用）

### 3️⃣ Supabaseで実行（1分）

1. Supabaseダッシュボード → SQL Editor
2. 作成したSQLを貼り付け
3. Run をクリック

### 4️⃣ Next.jsアプリを作成（1分）

```bash
npx create-next-app@latest my-app --typescript --tailwind --app --yes
cd my-app
npm install @supabase/supabase-js
```

`.env.local` を作成（既存のSupabase接続情報を使用）：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5️⃣ コードで使用

```typescript
// 接頭辞付きテーブル名を使用
const { data } = await supabase
  .from("todo_tasks")  // ✅ 接頭辞付き
  .select("*");
```

## ✅ 完了！

詳細な手順は `ADD_NEW_APP_GUIDE.md` を参照してください。
