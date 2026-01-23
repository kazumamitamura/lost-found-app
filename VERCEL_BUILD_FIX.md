# Vercelビルドエラー解決方法

## 問題

Vercelのビルドで以下のエラーが発生：
```
Type error: Type 'string | null' is not assignable to type 'string | number | readonly string[] | undefined'.
```

## 原因

`Input`コンポーネントの`value`プロパティに`null`が渡されているため。

## 解決方法

### 1. コードの修正

`app/admin/dashboard/page.tsx`の230行目を修正：

**修正前:**
```typescript
value={editForm.registrant_name !== undefined ? editForm.registrant_name : (item.registrant_name || "")}
```

**修正後:**
```typescript
value={(editForm.registrant_name ?? item.registrant_name) ?? ""}
```

### 2. Vercelでの確認

1. Vercelダッシュボードで最新のデプロイを確認
2. ビルドログでエラーが解消されているか確認
3. まだエラーが出る場合は、Vercelの設定を確認：
   - Settings → General → Build & Development Settings
   - "Clear Build Cache"を実行
   - 手動で再デプロイをトリガー

### 3. 手動で再デプロイ

Vercelダッシュボードで：
1. Deployments タブを開く
2. 最新のデプロイを選択
3. "Redeploy" をクリック
4. "Use existing Build Cache" のチェックを**外す**
5. "Redeploy" をクリック

## 確認事項

- [ ] ローカルで `npm run build` が成功する
- [ ] GitHubの最新コミットに修正が含まれている
- [ ] Vercelのビルドログでエラーが解消されている
