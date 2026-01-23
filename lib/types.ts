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

export const LOCATIONS = [
  '体育館',
  '図書館',
  '1階廊下',
  '2階廊下',
  '3階廊下',
  '職員室',
  '保健室',
  '音楽室',
  '美術室',
  '理科室',
  '家庭科室',
  '技術室',
  'コンピュータ室',
  '多目的室',
  '食堂',
  '玄関',
  '校庭',
  'グラウンド',
  'プール',
  'その他',
] as const;

export type Location = typeof LOCATIONS[number];
