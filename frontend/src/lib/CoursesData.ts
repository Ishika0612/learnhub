export type Course = {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  instructorImage?: string | null;
  category: string;
  level: string;
  rating?: number;
  reviews?: number;
  students?: number;
  duration?: string;
  lectures?: number;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
  curriculum?: {
    title: string;
    lessons: string[];
  }[];
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatStudents(students: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(students);
}
