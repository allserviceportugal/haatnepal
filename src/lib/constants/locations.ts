// A starter set of major Nepali districts/cities for the location picker.
// Not exhaustive (Nepal has 77 districts) — expand as coverage grows.
export const NEPAL_DISTRICTS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Kaski",
  "Chitwan",
  "Morang",
  "Sunsari",
  "Rupandehi",
  "Parsa",
  "Makwanpur",
  "Banke",
  "Kailali",
  "Dhanusha",
  "Jhapa",
  "Kavrepalanchok",
  "Nawalparasi",
  "Dang",
  "Syangja",
  "Gorkha",
  "Baglung",
] as const;

export type NepalDistrict = (typeof NEPAL_DISTRICTS)[number];
