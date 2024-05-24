export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

interface ImageFormats {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes?: number;
}

interface ImageData {
  id: number;
  attributes: {
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      thumbnail: ImageFormats;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MenuItemAttributes {
  url: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  locale?: string;
  title_en: string;
  title_fr?: string;
  title_ar?: string;
  title_tr?: string;
  title_fa?: string;
  title_ur?: string;
  title_id?: string;
  title_bn?: string;
  title_es?: string;
  title_pt?: string;
  title_de?: string;
  title_nl?: string;
  title_it?: string;
  title_zh?: string;
  title_ru?: string;
  title_sw?: string;
  description_en?: string;
  description_fr?: string;
  description_ar?: string;
  description_tr?: string;
  description_fa?: string;
  description_ur?: string;
  description_id?: string;
  description_bn?: string;
  description_es?: string;
  description_pt?: string;
  description_de?: string;
  description_nl?: string;
  description_it?: string;
  description_zh?: string;
  description_ru?: string;
  description_sw?: string;
  parent: {
    data: {
      id?: number;
    } | null;
  };
  children: { data: [MenuItem] };
  image?: { data: ImageData };
}

export interface MenuItem {
  id: number;
  attributes: MenuItemAttributes;
}
