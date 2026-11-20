export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  freelancerCount: number;
  projectCount: number;
}

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  city: string;
  state: string;
  hourlyRateINR: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  skills: string[];
  bio: string;
  isKycVerified: boolean;
  isTopRated: boolean;
  onTimeDeliveryRate: number;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string;
  clientCity: string;
  budgetType: "FIXED" | "HOURLY";
  budgetINR: number;
  duration: string;
  category: string;
  skillsRequired: string[];
  description: string;
  proposalsCount: number;
  postedDate: string;
  isClientVerified: boolean;
}

export interface Service {
  id: string;
  title: string;
  freelancerName: string;
  freelancerCity: string;
  priceINR: number;
  deliveryDays: number;
  rating: number;
  salesCount: number;
  image: string;
  category: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Web & Software Engineering",
    slug: "web-software",
    description: "Next.js, React, Node.js, Python, Golang & Scalable Cloud APIs",
    iconName: "Code2",
    freelancerCount: 8420,
    projectCount: 1250,
  },
  {
    id: "cat-2",
    name: "Mobile App Development",
    slug: "mobile-apps",
    description: "Flutter, React Native, iOS Swift & Android Kotlin Apps",
    iconName: "Smartphone",
    freelancerCount: 4190,
    projectCount: 680,
  },
  {
    id: "cat-3",
    name: "UI/UX & Product Design",
    slug: "ui-ux-design",
    description: "Figma design systems, mobile UX, SaaS interfaces & prototyping",
    iconName: "Palette",
    freelancerCount: 5120,
    projectCount: 920,
  },
  {
    id: "cat-4",
    name: "AI & Data Science",
    slug: "ai-data-science",
    description: "LLMs, LangChain, Computer Vision, Predictive Analytics & PyTorch",
    iconName: "BrainCircuit",
    freelancerCount: 2840,
    projectCount: 490,
  },
  {
    id: "cat-5",
    name: "Finance, GST & Legal",
    slug: "finance-gst-legal",
    description: "Chartered Accountants, GST return filing, MCA compliance & drafting",
    iconName: "Scale",
    freelancerCount: 3200,
    projectCount: 740,
  },
  {
    id: "cat-6",
    name: "Digital Marketing & Growth",
    slug: "digital-marketing",
    description: "SEO optimization, Google & Meta Ads, performance marketing",
    iconName: "TrendingUp",
    freelancerCount: 6410,
    projectCount: 1120,
  },
  {
    id: "cat-7",
    name: "Writing & Indian Localization",
    slug: "writing-localization",
    description: "Technical copywriting, SEO articles, Hindi/regional translation",
    iconName: "FileText",
    freelancerCount: 4890,
    projectCount: 810,
  },
  {
    id: "cat-8",
    name: "Video Editing & 3D Animation",
    slug: "video-animation",
    description: "After Effects, DaVinci Resolve, 3D product animation & reels",
    iconName: "Video",
    freelancerCount: 3950,
    projectCount: 610,
  },
];

export const POPULAR_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Python",
  "Flutter",
  "Figma",
  "Node.js",
  "PostgreSQL",
  "AWS",
  "Docker",
  "GST Compliance",
  "Tailwind CSS",
  "LangChain",
  "SEO",
  "FastAPI",
  "FinTech Escrow",
];

export const FEATURED_FREELANCERS: Freelancer[] = [
  {
    id: "fl-1",
    name: "Aditya Sharma",
    title: "Senior Full-Stack Architect (Next.js & FinTech)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    city: "Bengaluru",
    state: "Karnataka",
    hourlyRateINR: 2800,
    rating: 4.98,
    reviewCount: 47,
    completedProjects: 52,
    skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Razorpay Route"],
    bio: "Ex-Razorpay & Swiggy engineer specializing in high-throughput payment systems, real-time dashboards, and performant Next.js applications.",
    isKycVerified: true,
    isTopRated: true,
    onTimeDeliveryRate: 100,
  },
  {
    id: "fl-2",
    name: "Pooja Deshmukh",
    title: "Lead UI/UX Designer & Design System Specialist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    city: "Pune",
    state: "Maharashtra",
    hourlyRateINR: 2200,
    rating: 4.95,
    reviewCount: 38,
    completedProjects: 41,
    skills: ["Figma", "Design Systems", "Mobile UI", "Prototyping", "User Research"],
    bio: "Passionate product designer with 7+ years of experience designing scalable enterprise SaaS portals and Indian consumer apps.",
    isKycVerified: true,
    isTopRated: true,
    onTimeDeliveryRate: 98,
  },
  {
    id: "fl-3",
    name: "Vikram Sengupta",
    title: "AI/ML Engineer (LLMs & Computer Vision)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    city: "Hyderabad",
    state: "Telangana",
    hourlyRateINR: 3500,
    rating: 5.0,
    reviewCount: 29,
    completedProjects: 31,
    skills: ["Python", "PyTorch", "LangChain", "OpenAI API", "FastAPI"],
    bio: "Building custom enterprise RAG pipelines, fine-tuned LLMs, and real-time document OCR solutions for Indian businesses.",
    isKycVerified: true,
    isTopRated: true,
    onTimeDeliveryRate: 100,
  },
  {
    id: "fl-4",
    name: "Kavita Rao",
    title: "Chartered Accountant (CA) & Virtual CFO",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    city: "Mumbai",
    state: "Maharashtra",
    hourlyRateINR: 2500,
    rating: 4.92,
    reviewCount: 56,
    completedProjects: 64,
    skills: ["GST Filing", "Income Tax", "TDS Returns", "Financial Modeling", "MCA"],
    bio: "Qualified CA aiding early-stage Indian startups with ROC filings, GST advisory, Section 194-O compliance, and financial projections.",
    isKycVerified: true,
    isTopRated: true,
    onTimeDeliveryRate: 99,
  },
];

export const FEATURED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Build B2B SaaS Customer Portal with Razorpay Integration",
    clientName: "Rahul Verma",
    clientCompany: "Kaveri Logistics Tech",
    clientCity: "Bengaluru",
    budgetType: "FIXED",
    budgetINR: 120000,
    duration: "4 - 6 weeks",
    category: "Web & Software Engineering",
    skillsRequired: ["Next.js", "TypeScript", "PostgreSQL", "Razorpay Route"],
    description: "Looking for an experienced Indian full-stack developer to architect and build our client billing and order tracking workspace. Milestones funded via escrow.",
    proposalsCount: 9,
    postedDate: "2 hours ago",
    isClientVerified: true,
  },
  {
    id: "proj-2",
    title: "Complete Figma Design System for Healthcare Mobile App",
    clientName: "Dr. Ananya Sen",
    clientCompany: "Swastha Telehealth",
    clientCity: "Gurugram",
    budgetType: "FIXED",
    budgetINR: 75000,
    duration: "3 weeks",
    category: "UI/UX & Product Design",
    skillsRequired: ["Figma", "Design Systems", "Mobile UX", "Accessibility"],
    description: "Need an end-to-end Figma UI/UX specification with atomic components for iOS and Android telemedicine app catering to Indian regional users.",
    proposalsCount: 14,
    postedDate: "5 hours ago",
    isClientVerified: true,
  },
  {
    id: "proj-3",
    title: "Cross-Platform Flutter Delivery Partner Application",
    clientName: "Karthik Raja",
    clientCompany: "QuickMart Hyperlocal",
    clientCity: "Chennai",
    budgetType: "FIXED",
    budgetINR: 160000,
    duration: "6 - 8 weeks",
    category: "Mobile App Development",
    skillsRequired: ["Flutter", "Dart", "Firebase", "Google Maps SDK"],
    description: "Hyperlocal delivery fleet app with live GPS tracking, OTP delivery confirmation, UPI payment collection, and multilingual support.",
    proposalsCount: 11,
    postedDate: "1 day ago",
    isClientVerified: true,
  },
  {
    id: "proj-4",
    title: "Quarterly GST & TDS Filing + Accounting Reconciliation",
    clientName: "Deepak Mehta",
    clientCompany: "Mehta Exports Pvt Ltd",
    clientCity: "Surat",
    budgetType: "FIXED",
    budgetINR: 35000,
    duration: "2 weeks",
    category: "Finance, GST & Legal",
    skillsRequired: ["GST Compliance", "TallyPrime", "TDS 194-O", "Input Tax Credit"],
    description: "Seeking a verified CA or tax consultant to reconcile annual purchases against GSTR-2B, file GSTR-1 & 3B, and prepare 26AS TDS returns.",
    proposalsCount: 6,
    postedDate: "1 day ago",
    isClientVerified: true,
  },
];

export const TESTIMONIALS = [
  {
    id: "test-1",
    quote: "KaryaSetu's milestone escrow was the turning point for us. In India, paying random agencies upfront was always terrifying. Here, our ₹1.5L was safely locked until Aditya delivered the working code.",
    author: "Naveen Singhal",
    role: "Founder & CEO, Zepfleet Motors (Delhi)",
    rating: 5,
  },
  {
    id: "test-2",
    quote: "As a freelancer in Pune, clients used to delay payments for months after delivery. On KaryaSetu, knowing the client has funded the milestone before I open my IDE gives me 100% confidence.",
    author: "Pooja Deshmukh",
    role: "Independent Lead UI/UX Designer (Pune)",
    rating: 5,
  },
  {
    id: "test-3",
    quote: "The Indian compliance integration is unmatched. Receiving automated TDS Section 194-O deductions and B2B GST tax invoices saves our finance department hours of manual bookkeeping.",
    author: "Rajesh Ramachandran",
    role: "CTO, IndusFin Technologies (Bengaluru)",
    rating: 5,
  },
];
