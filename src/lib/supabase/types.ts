export type ListingCondition = "new" | "used";
export type ListingType = "classified" | "fixed_price";
export type ListingStatus = "draft" | "active" | "sold" | "expired" | "removed";
export type AccountType = "individual" | "business";
export type SubscriptionTier = "normal" | "business" | "plus" | "pro" | "custom";
export type AttributeInputType = "text" | "number" | "select" | "boolean";

export type Profile = {
  id: string;
  display_name: string;
  phone: string;
  phone_verified: boolean;
  avatar_url: string | null;
  district: string | null;
  city: string | null;
  account_type: AccountType;
  subscription_plan_id: string | null;
  rating_avg: number;
  rating_count: number;
  business_description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  key: SubscriptionTier;
  name: string;
  monthly_listing_quota: number | null;
  monthly_featured_quota: number | null;
  allows_promoted_listings: boolean;
  allows_storefront_branding: boolean;
  is_paid: boolean;
  price_npr: number | null;
  description: string;
};

export type DeliveryCourier = {
  id: string;
  name: string;
  base_cost_npr: number;
  is_active: boolean;
  sort_order: number;
};

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
};

export type CategoryAttribute = {
  id: string;
  category_id: string;
  key: string;
  label: string;
  input_type: AttributeInputType;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
};

export type ListingAttributeValue = {
  id: string;
  listing_id: string;
  attribute_id: string;
  value: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: ListingCondition;
  listing_type: ListingType;
  status: ListingStatus;
  district: string;
  city: string | null;
  pickup_available: boolean;
  featured_at: string | null;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "completed" | "cancelled";

export type Order = {
  id: string;
  buyer_id: string;
  seller_id: string;
  delivery_courier_id: string | null;
  pickup_selected: boolean;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  listing_id: string;
  price_at_order: number;
  created_at: string;
};

export type OrderWithRelations = Order & {
  order_items: (OrderItem & { listings: { id: string; title: string } | null })[];
  buyer: Pick<Profile, "id" | "display_name"> | null;
  seller: Pick<Profile, "id" | "display_name"> | null;
  delivery_couriers: Pick<DeliveryCourier, "id" | "name" | "base_cost_npr"> | null;
};

export type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Offer = {
  id: string;
  conversation_id: string;
  listing_id: string;
  amount: number;
  status: OfferStatus;
  created_by: string;
  created_at: string;
  responded_at: string | null;
};

export type ConversationWithRelations = Conversation & {
  listings: {
    id: string;
    title: string;
    price?: number;
    currency?: string;
    status?: ListingStatus;
    listing_images: { url: string }[];
  } | null;
  buyer: Pick<Profile, "id" | "display_name"> | null;
  seller: Pick<Profile, "id" | "display_name"> | null;
};

export type TimelineEntry =
  | { kind: "message"; created_at: string; message: Message }
  | { kind: "offer"; created_at: string; offer: Offer };

export type ListingWithRelations = Listing & {
  listing_images: ListingImage[];
  categories: Pick<Category, "id" | "name" | "slug" | "parent_id"> | null;
  profiles: Pick<
    Profile,
    "id" | "display_name" | "district" | "rating_avg" | "rating_count" | "account_type"
  > | null;
  listing_attribute_values: (ListingAttributeValue & { category_attributes: CategoryAttribute | null })[];
  listing_delivery_options: { courier: DeliveryCourier }[];
};
