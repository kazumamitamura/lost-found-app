# Vercelリージョンエラー解決方法

## エラー

```
Invalid region selector: "nrt1"
```

## 原因

Vercelのプロジェクト設定で無効なリージョンコード `nrt1` が指定されている可能性があります。

## 解決方法

### 方法1: Vercelダッシュボードでリージョン設定を確認

1. **Vercelダッシュボード**でプロジェクトを開く
2. **Settings** → **General** を開く
3. **「Region」**セクションを確認
4. リージョンが設定されている場合：
   - **「Default」** または **「Auto」** を選択
   - または、有効なリージョンを選択（例: `iad1`, `sfo1`）

### 方法2: vercel.jsonを確認

`vercel.json` に `regions` が含まれていないか確認：

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**重要**: `regions` フィールドは含めないでください（Vercelが自動的に最適なリージョンを選択します）。

### 方法3: プロジェクトを再作成（最終手段）

上記の方法で解決しない場合：

1. 新しいプロジェクトを作成
2. 同じGitHubリポジトリを接続
3. 環境変数を再設定
4. デプロイ

## 有効なVercelリージョンコード

Vercelで使用可能なリージョンコード（参考）：

- `iad1` - Washington, D.C., USA (East)
- `sfo1` - San Francisco, USA (West)
- `hnd1` - Tokyo, Japan
- `syd1` - Sydney, Australia
- `fra1` - Frankfurt, Germany
- `dub1` - Dublin, Ireland

**注意**: `nrt1` は無効なリージョンコードです。使用しないでください。

## 推奨設定

### vercel.json（現在の設定 - 正しい）

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

リージョンは指定せず、Vercelに自動選択させます。

### Vercelダッシュボードでの設定

1. **Settings** → **General**
2. **Region** セクションで：
   - **「Default」** を選択
   - または、**「Auto」** を選択

## 手順

### ステップ1: Vercelダッシュボードで確認

1. プロジェクトを開く
2. **Settings** → **General** を開く
3. **Region** セクションを確認
4. `nrt1` が設定されている場合、**「Default」** に変更

### ステップ2: デプロイを再試行

1. **Deployments** タブを開く
2. 三点メニュー（...）→ **「Create Deployment」**
3. 入力フィールドに `main` と入力
4. **「Create Deployment」** をクリック

## 確認事項

- [ ] `vercel.json` に `regions` フィールドが含まれていない
- [ ] Vercelダッシュボードの Settings → General でリージョンが「Default」に設定されている
- [ ] エラーが解消されている
