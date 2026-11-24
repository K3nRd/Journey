import {
  Apple,
  BedDouble,
  Briefcase,
  Camera,
  ChefHat,
  ClipboardCheck,
  Dumbbell,
  Footprints,
  HeartPulse,
  ListChecks,
  Moon,
  PersonStanding,
  Ruler,
  Scale,
  ShoppingCart,
  SmartphoneCharging,
  Sofa,
  Soup,
  Sunrise,
  Utensils,
  Circle,
  type LucideProps,
} from "lucide-react";

const MAP = {
  Apple,
  BedDouble,
  Briefcase,
  Camera,
  ChefHat,
  ClipboardCheck,
  Dumbbell,
  Footprints,
  HeartPulse,
  ListChecks,
  Moon,
  PersonStanding,
  Ruler,
  Scale,
  ShoppingCart,
  SmartphoneCharging,
  Sofa,
  Soup,
  Sunrise,
  Utensils,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = MAP[name as keyof typeof MAP] ?? Circle;
  return <C {...props} />;
}
