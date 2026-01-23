// ============================================
// TODOアプリの使用例
// プロジェクト: Master-Portfolio-DB
// 接頭辞: todo_
// ============================================
//
// このファイルは、新しいアプリを追加する際のコード実装の実践例です。

import { supabase } from '@/lib/supabase';
import { TodoTask, TodoTaskInsert, TodoTaskUpdate } from '@/lib/types';

// ============================================
// データ取得の例
// ============================================

// すべてのタスクを取得（ユーザーIDでフィルタリング）
export async function getTasks(userId: string): Promise<TodoTask[]> {
  const { data, error } = await supabase
    .from("todo_tasks")  // ✅ 接頭辞付きテーブル名
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}

// 特定のステータスのタスクを取得
export async function getTasksByStatus(
  userId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<TodoTask[]> {
  const { data, error } = await supabase
    .from("todo_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks by status:", error);
    return [];
  }

  return data || [];
}

// ============================================
// データ作成の例
// ============================================

export async function createTask(task: TodoTaskInsert): Promise<TodoTask | null> {
  const { data, error } = await supabase
    .from("todo_tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }

  return data;
}

// ============================================
// データ更新の例
// ============================================

export async function updateTask(
  taskId: string,
  updates: TodoTaskUpdate
): Promise<TodoTask | null> {
  const { data, error } = await supabase
    .from("todo_tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    return null;
  }

  return data;
}

// ============================================
// データ削除の例
// ============================================

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from("todo_tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }

  return true;
}

// ============================================
// Storage使用の例
// ============================================

// ファイルをアップロード
export async function uploadAttachment(
  userId: string,
  file: File,
  taskId: string
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${taskId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("todo-attachments")  // ✅ 接頭辞付きバケット名
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading file:", error);
    return null;
  }

  return fileName;
}

// ファイルのURLを取得
export function getAttachmentUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/todo-attachments/${filePath}`;
}

// ============================================
// 使用例（Next.js Server Component）
// ============================================

// app/tasks/page.tsx の例
/*
import { getTasks } from '@/lib/todo-api';

export default async function TasksPage() {
  const userId = 'user-id-here'; // 実際には認証から取得
  const tasks = await getTasks(userId);

  return (
    <div>
      <h1>タスク一覧</h1>
      {tasks.map((task) => (
        <div key={task.id}>
          <h2>{task.title}</h2>
          <p>ステータス: {task.status}</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================
// 使用例（Next.js Client Component）
// ============================================

// app/tasks/client-page.tsx の例
/*
"use client";

import { useState } from 'react';
import { createTask } from '@/lib/todo-api';

export default function TasksClientPage() {
  const [title, setTitle] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newTask = await createTask({
      title,
      description: null,
      user_id: 'user-id-here',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      category_id: null,
    });
    
    if (newTask) {
      alert('タスクを作成しました！');
      setTitle('');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タスクを入力"
      />
      <button type="submit">作成</button>
    </form>
  );
}
*/
