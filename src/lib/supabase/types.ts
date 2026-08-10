export type ListingCondition = "new" | "used";
export type ListingType = "classified" | "fixed_price";
export type ListingStatus = "draft" | "active" | "sold" | "expired" | "removed";
export type AccountType = "individual" | "business";
export type SubscriptionTier = "normal" | "business" | "plus" | "pro" | "custom";
export type AttributeInputType = "text" | "number" | "select" | "boolean";
export type DraftStatus = "auto-saved" | "user-saved" | "being-created";
export type VehicleBrandLevel = "brand" | "model" | "generation" | "variant";

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
  province: string | null;
  email: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  key: SubscriptionTier;
  name: string;
  monthly_listing_quota: number | null;
  monthly_featured_quota: number | null;
  listing_duration_days: number | null;
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
  province: string | null;
  municipality: string | null;
  ward_number: number | null;
  tole: string | null;
  land_unit_system: "ropani_system" | "bigha_system" | "sqft" | "sqm" | null;
  land_ropani: number | null;
  land_aana: number | null;
  land_paisa: number | null;
  land_daam: number | null;
  land_bigha: number | null;
  land_kattha: number | null;
  land_dhur: number | null;
  land_area_sqft: number | null;
  company_name: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: "monthly" | "yearly" | "hourly" | "daily" | null;
  salary_negotiable: boolean;
  vacancies_count: number | null;
  application_deadline: string | null;
  external_apply_url: string | null;
  bluebook_status: string | null;
  registration_year: number | null;
  manufacturing_year: number | null;
  import_status: string | null;
  owner_count: number | null;
  is_modified: boolean;
  accident_history: boolean;
  service_history: string | null;
  listing_number: number;
  view_count: number;
  food_freshness: string | null;
  best_before_date: string | null;
  manufacturing_date: string | null;
  ingredients: string | null;
  storage_instructions: string | null;
  allergen_info: string | null;
  is_food: boolean;
  is_agriculture: boolean;
  harvest_date: string | null;
  unit_of_sale: string | null;
  min_order_quantity: number | null;
  farm_location: string | null;
  for_rent: boolean;
  rental_rate_period: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

export type VehicleBrand = {
  id: string;
  category_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  level: VehicleBrandLevel;
  is_active: boolean;
  sort_order: number;
};

export type DraftListing = {
  id: string;
  seller_id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  category_id: string | null;
  condition: string | null;
  listing_type: string | null;
  district: string | null;
  city: string | null;
  municipality: string | null;
  ward_number: number | null;
  tole: string | null;
  bluebook_status: string | null;
  registration_year: number | null;
  manufacturing_year: number | null;
  import_status: string | null;
  owner_count: number | null;
  is_modified: boolean;
  accident_history: boolean;
  service_history: string | null;
  food_freshness: string | null;
  best_before_date: string | null;
  manufacturing_date: string | null;
  ingredients: string | null;
  storage_instructions: string | null;
  allergen_info: string | null;
  harvest_date: string | null;
  unit_of_sale: string | null;
  min_order_quantity: number | null;
  farm_location: string | null;
  for_rent: boolean;
  rental_rate_period: string | null;
  category_path: Record<string, string> | null;
  attribute_values: Record<string, string>;
  courier_ids: string[] | null;
  image_urls: string[] | null;
  status: DraftStatus;
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

export type ListingComment = {
  id: string;
  listing_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type Review = {
  id: string;
  reviewee_id: string;
  reviewer_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string | null;
  created_at: string;
  updated_at: string;
};

export type JobApplication = {
  id: string;
  listing_id: string;
  applicant_id: string;
  cover_note: string | null;
  resume_path: string | null;
  created_at: string;
};

export type JobApplicationWithApplicant = JobApplication & {
  applicant: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
};

export type ListingWithRelations = Listing & {
  listing_images: ListingImage[];
  categories: Pick<Category, "id" | "name" | "slug" | "parent_id"> | null;
  profiles: Pick<
    Profile,
    "id" | "display_name" | "phone" | "email" | "district" | "rating_avg" | "rating_count" | "account_type"
  > | null;
  listing_attribute_values: (ListingAttributeValue & { category_attributes: CategoryAttribute | null })[];
  listing_delivery_options: { courier: DeliveryCourier }[];
  favorite_count?: number;
};
