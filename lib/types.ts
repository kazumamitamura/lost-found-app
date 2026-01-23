export type LostItem = {
  id: string;
  created_at: string;
  location: string;
  category: string;
  image_url: string | null;
  is_returned: boolean;
  returned_at: string | null;
  description: string | null;
  qr_code_uuid: string;
  registrant_name: string | null;
  found_date: string | null;
};

export type LostItemInsert = Omit<LostItem, 'id' | 'created_at' | 'qr_code_uuid'> & {
  qr_code_uuid?: string;
};

export type LostItemUpdate = Partial<Pick<LostItem, 'location' | 'category' | 'description' | 'is_returned' | 'returned_at'>>;

export const CATEGORIES = [
  'スマホ・周辺機器',
  '財布・ポーチ',
  '運動着',
  '制服',
  '靴・ベルト',
  '弁当箱',
  'バッグ',
  'その他',
] as const;

export type Category = typeof CATEGORIES[number];
