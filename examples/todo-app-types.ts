// ============================================
// TODOアプリの型定義例
// プロジェクト: Master-Portfolio-DB
// 接頭辞: todo_
// ============================================
//
// このファイルは、新しいアプリを追加する際の型定義の実践例です。

// タスクの型定義
export type TodoTask = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  user_id: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category_id: string | null;
};

// カテゴリの型定義
export type TodoCategory = {
  id: string;
  created_at: string;
  name: string;
  color: string | null;
  user_id: string | null;
};

// 挿入用の型（id、created_at、updated_atを除外）
export type TodoTaskInsert = Omit<TodoTask, 'id' | 'created_at' | 'updated_at'>;

// 更新用の型（部分的な更新を許可）
export type TodoTaskUpdate = Partial<Pick<TodoTask, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'category_id'>>;

// カテゴリの挿入・更新用の型
export type TodoCategoryInsert = Omit<TodoCategory, 'id' | 'created_at'>;
export type TodoCategoryUpdate = Partial<Pick<TodoCategory, 'name' | 'color'>>;

// ステータスの定数
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// 優先度の定数
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
