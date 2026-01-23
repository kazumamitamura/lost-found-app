# 登録画面が表示されない場合のトラブルシューティング

## 確認事項

### 1. 開発サーバーが起動しているか確認

```bash
npm run dev
```

ブラウザで `http://localhost:3000/admin/register` にアクセスしてください。

### 2. ブラウザのコンソールエラーを確認

1. ブラウザの開発者ツールを開く（F12キー）
2. 「Console」タブを開く
3. エラーメッセージを確認

### 3. よくあるエラーと解決方法

#### エラー: "Cannot read property 'origin' of undefined"
- **原因**: `window`オブジェクトが存在しない
- **解決**: コードを修正済み（`typeof window !== 'undefined'`でチェック）

#### エラー: "Module not found"
- **原因**: パッケージがインストールされていない
- **解決**: 
  ```bash
  npm install
  ```

#### エラー: "LOCATIONS is not defined"
- **原因**: `lib/types.ts`から`LOCATIONS`がエクスポートされていない
- **解決**: `lib/types.ts`を確認し、`LOCATIONS`が正しくエクスポートされているか確認

### 4. ページが真っ白になる場合

1. **ブラウザのキャッシュをクリア**
   - Ctrl + Shift + Delete（Windows）
   - キャッシュをクリアして再読み込み

2. **開発サーバーを再起動**
   ```bash
   # Ctrl + C で停止
   npm run dev
   ```

3. **ビルドエラーを確認**
   ```bash
   npm run build
   ```

### 5. ネットワークタブで確認

1. 開発者ツールの「Network」タブを開く
2. ページを再読み込み
3. エラー（赤色）のリクエストがないか確認

### 6. 環境変数の確認

`.env.local`ファイルが正しく設定されているか確認：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 7. コンポーネントの確認

登録画面のコンポーネントが正しくインポートされているか確認：

- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/card.tsx`
- `components/ui/toast.tsx`

すべてのファイルが存在するか確認してください。

## デバッグ手順

1. **シンプルなテストページを作成**
   ```tsx
   // app/admin/register/test/page.tsx
   export default function TestPage() {
     return <div>テストページが表示されます</div>;
   }
   ```
   `http://localhost:3000/admin/register/test` にアクセスして、表示されるか確認

2. **段階的にコンポーネントを追加**
   - まず基本のHTMLのみ
   - 次にUIコンポーネントを追加
   - 最後にロジックを追加

## まだ解決しない場合

以下の情報を提供してください：

1. ブラウザのコンソールに表示されるエラーメッセージ（全文）
2. 開発サーバーのターミナルに表示されるエラーメッセージ
3. 使用しているブラウザとバージョン
4. `npm run build`の実行結果
