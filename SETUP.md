# セットアップ手順

## 問題: ブラウザがリロード中で止まる

この問題は通常、`.env.local`ファイルが存在しない、または環境変数が正しく設定されていないことが原因です。

## 解決方法

### ステップ1: .env.localファイルの作成

プロジェクトルート（`lost-found-app`フォルダ）に `.env.local` ファイルを**手動で作成**してください。

1. エクスプローラーで `C:\Users\PC_User\Desktop\アプリ\lost-found-app` を開く
2. 新しいテキストファイルを作成
3. ファイル名を `.env.local` に変更（拡張子なし）
4. 以下の内容を記入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**重要**: 
- `your-project-id` と `your-anon-key-here` を実際のSupabaseの値に置き換えてください
- ファイル名は `.env.local` です（`.env.local.txt` ではありません）

### ステップ2: Supabaseの接続情報を取得

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクト「Portfolio-Master」を選択
3. 左メニューから **Settings** → **API** をクリック
4. 以下の情報をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` に設定
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定

### ステップ3: 開発サーバーの再起動

1. 現在実行中の開発サーバーを停止（Ctrl+C）
2. ターミナルで以下を実行：

```bash
npm run dev
```

3. エラーメッセージがないか確認
4. `http://localhost:3000` にアクセス

### ステップ4: エラーが続く場合

ターミナルに表示されるエラーメッセージを確認してください。よくあるエラー：

- **"Missing Supabase environment variables"**
  → `.env.local`ファイルが正しく作成されているか確認

- **"Port 3000 is already in use"**
  → 別のプロセスがポート3000を使用しています。以下で確認：
  ```bash
  netstat -ano | findstr :3000
  ```

- **"Cannot find module"**
  → 依存関係を再インストール：
  ```bash
  npm install
  ```

## 確認事項

- [ ] `.env.local`ファイルがプロジェクトルートに存在する
- [ ] 環境変数の値が正しく設定されている（URLとキーが実際の値になっている）
- [ ] 開発サーバーが正常に起動している（ターミナルにエラーがない）
- [ ] ブラウザのコンソール（F12）にエラーがない
