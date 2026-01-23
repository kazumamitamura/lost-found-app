# 開発サーバーが表示されない問題の解決方法

## 問題
`localhost:3000/admin/register`にアクセスしても、Googleのページが表示される

## 原因
開発サーバーが正常に起動していない、または古いプロセスが残っている

## 解決方法

### ステップ1: 既存のプロセスを停止

```powershell
# ポート3000を使用しているプロセスを確認
netstat -ano | findstr :3000

# プロセスを強制終了（PIDは上記のコマンドで確認した番号）
taskkill /F /PID [PID番号]
```

### ステップ2: 開発サーバーを起動

```bash
npm run dev
```

### ステップ3: ブラウザでアクセス

1. ブラウザで `http://localhost:3000` にアクセス
2. トップページが表示されることを確認
3. `http://localhost:3000/admin/register` にアクセス

### ステップ4: まだ表示されない場合

1. **ブラウザのキャッシュをクリア**
   - Ctrl + Shift + Delete
   - キャッシュをクリア

2. **シークレットモードで試す**
   - Ctrl + Shift + N（Chrome）
   - `http://localhost:3000/admin/register` にアクセス

3. **別のポートで起動**
   ```bash
   # ポート3001で起動
   npx next dev -p 3001
   ```
   - `http://localhost:3001/admin/register` にアクセス

4. **開発サーバーのログを確認**
   - ターミナルにエラーメッセージが表示されていないか確認

## よくあるエラー

### "Port 3000 is already in use"
- 既存のプロセスを停止してください（上記のステップ1）

### "Cannot find module"
- 依存関係を再インストール：
  ```bash
  npm install
  ```

### ページが真っ白
- ブラウザのコンソール（F12）でエラーを確認
- 開発サーバーのターミナルでエラーを確認

## 確認事項

- [ ] 開発サーバーが起動している（ターミナルに "Ready" と表示される）
- [ ] ポート3000が使用されている（`netstat -ano | findstr :3000`）
- [ ] ブラウザで `http://localhost:3000` にアクセスできる
- [ ] ブラウザのコンソールにエラーがない
