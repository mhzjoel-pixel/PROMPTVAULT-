export interface User {
  address: string;
  username: string;
  bio?: string;
  is_human: boolean;
  world_id_nullifier?: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  creator_address: string;
  title: string;
  description: string;
  content: string;
  price: number;
  category: string;
  tags?: string;
  model_compatibility?: string;
  prompt_type?: string;
  license_type?: string;
  rating?: number;
  sales_count?: number;
  token_id: string;
  created_at: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  curator_address: string;
  is_staff_pick: boolean;
  created_at: string;
  prompts?: Prompt[];
}

export interface Transaction {
  id: string;
  prompt_id: string;
  buyer_address: string;
  seller_address: string;
  amount: number;
  timestamp: string;
}
