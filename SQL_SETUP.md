# 実行すべき SQL（Supabase）

Supabase の **SQL Editor** で、以下の順に実行してください。

## 新規セットアップ（初めてプロジェクトを作る場合）

| 順番 | ファイル | 内容 |
|------|----------|------|
| 1 | **tables.sql** | 忘れ物テーブル `lost_items` と Storage バケット `lf-images` の作成・RLS |
| 2 | **tables_registrants.sql** | 登録者テーブル `lost_registrants` の作成・RLS |
| 3 | **fix_rls_policies.sql** | 認証なしでも挿入・更新・削除できるようにポリシーを緩和（必要に応じて） |
| 4 | **fix_storage_policy.sql** | Storage `lf-images` を誰でもアップロードできるようにポリシー修正（必要に応じて） |

## 既に `lf_items` / `lf_registrants` を使っている場合（テーブル名を `lost_` に変えたい場合）

| 順番 | ファイル | 内容 |
|------|----------|------|
| 1 | **migration_lf_to_lost.sql** | `lf_items` → `lost_items`、`lf_registrants` → `lost_registrants` にリネーム |

※ アプリは現在 `lost_items` / `lost_registrants` を参照しています。既存DBが `lf_` のままなら、このマイグレーションを実行するか、アプリ側のテーブル名を `lf_` に戻す必要があります。

## 既に「lf-images」バケットがある場合（アプリと連携するだけ）

| ファイル | 内容 |
|----------|------|
| **setup_lf_images_bucket.sql** | 既存の `lf-images` バケット用に RLS ポリシーを設定。バケットが無い場合のみ作成。**画像のアップロード・表示を有効にしたいときはこれを実行してください。** |

## 既存テーブルにカラムを足すだけの場合

| ファイル | 内容 |
|----------|------|
| **migration_add_columns.sql** | `lost_items` に `registrant_name`・`found_date` を追加 |

## 実行しなくてもよいファイル

- **examples/todo-app-example.sql** … 別アプリ用のサンプル
- **templates/new-app-template.sql** … 新規アプリ用テンプレート

---

**まとめ（いちばんシンプルな手順）**

1. Supabase Dashboard → **SQL Editor** を開く  
2. `tables.sql` を貼り付けて **Run**  
3. `tables_registrants.sql` を貼り付けて **Run**  
4. **既に lf-images バケットがある場合**は、`setup_lf_images_bucket.sql` を実行するとアプリと連携できます。  
5. 画像アップロードや登録が「権限エラー」になる場合は、`fix_rls_policies.sql` と `setup_lf_images_bucket.sql`（または `fix_storage_policy.sql`）を実行
