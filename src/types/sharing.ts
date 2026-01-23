export type ResourceType = 'report' | 'document';

export interface SharedLink {
  id: string;
  token: string;
  user_id: string;
  resource_type: ResourceType;
  resource_id: string;
  expires_at: string; // ISO Date string
  is_active: boolean;
  created_at: string; // ISO Date string
  views: number;
}

export interface CreateShareLinkRequest {
  resource_type: ResourceType;
  resource_id: string;
  expires_in_hours?: number; // Default 24
}

export interface CreateShareLinkResponse {
  share_link: string;
  token: string;
  expires_at: string;
}

export interface SharedLinkItem {
  id: string;
  resource_name: string;
  views: number;
  expires_at: string;
  is_active: boolean;
  resource_type: ResourceType;
}

export interface ManageLinksResponse {
  links: SharedLinkItem[];
}
