"use client";

import * as React from "react";
import Link from "next/link";
import { 
  UserCheck, 
  MapPin, 
  CheckCircle2, 
  IndianRupee, 
  ShieldCheck, 
  AlertCircle,
  Briefcase,
  Star,
  Award,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";

export default function FreelancerProfilePage() {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");

  // Editable fields
  const [professionalTitle, setProfessionalTitle] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [hourlyRateINR, setHourlyRateINR] = React.useState(2500);
  const [experienceYears, setExperienceYears] = React.useState(5);
  const [availabilityStatus, setAvailabilityStatus] = React.useState("AVAILABLE");
  const [city, setCity] = React.useState("Bengaluru");
  const [state, setState] = React.useState("Karnataka");
  const [skillsString, setSkillsString] = React.useState("");

  React.useEffect(() => {
    fetch("/api/v1/profile/freelancer")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setProfessionalTitle(data.profile.professionalTitle || "");
          setBio(data.profile.bio || "");
          setHourlyRateINR(data.profile.hourlyRateINR || 2500);
          setExperienceYears(data.profile.experienceYears || 5);
          setAvailabilityStatus(data.profile.availabilityStatus || "AVAILABLE");
          setCity(data.profile.city || "Bengaluru");
          setState(data.profile.state || "Karnataka");
          setSkillsString((data.profile.skills || []).join(", "));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const skillsArray = skillsString.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await fetch("/api/v1/profile/freelancer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalTitle,
          bio,
          hourlyRateINR,
          experienceYears,
          availabilityStatus,
          city,
          state,
          skills: skillsArray,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Freelancer profile updated successfully!");
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Loading freelancer profile...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/dashboard" className="hover:text-navy-900">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Freelancer Profile</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">
              Professional Profile &amp; KYC
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profile/kyc">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>KYC Portal ({profile?.kycStatus || "PENDING"})</span>
              </Button>
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Quick Profile Card */}
          <div className="space-y-6">
            <Card className="p-6 bg-white border-slate-200 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                alt="Profile Avatar"
                className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-white shadow-sm"
              />
              <h2 className="mt-3 text-base font-bold text-navy-900">{profile?.professionalTitle}</h2>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{profile?.city}, {profile?.state}</span>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <Badge variant={profile?.kycStatus === "APPROVED" ? "verified" : "saffron"} className="text-[10px]">
                  KYC: {profile?.kycStatus}
                </Badge>
                {profile?.isTopRated && (
                  <Badge variant="saffron" className="text-[10px]">Top Rated</Badge>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Career Earnings:</span>
                  <span className="font-bold text-navy-900 font-inr">{formatINR(profile?.totalEarningsINR || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Completed Projects:</span>
                  <span className="font-bold text-navy-900">{profile?.completedProjectsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">On-Time Delivery Rate:</span>
                  <span className="font-bold text-emerald-700">{profile?.onTimeDeliveryRate || 100}%</span>
                </div>
              </div>
            </Card>

            {/* Bank Payout Account Info */}
            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-2">
                Registered Payout Bank:
              </span>
              {profile?.bankAccounts && profile.bankAccounts.length > 0 ? (
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Bank: <strong>{profile.bankAccounts[0].bankName}</strong></div>
                  <div>Account: <strong className="font-mono">{profile.bankAccounts[0].accountNumberMasked}</strong></div>
                  <div>IFSC: <strong className="font-mono">{profile.bankAccounts[0].ifscCode}</strong></div>
                  <Badge variant="verified" className="text-[10px] mt-2">Penny-Drop Verified</Badge>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  <p>No verified bank account linked yet.</p>
                  <Link href="/profile/kyc" className="mt-2 block font-semibold text-saffron-700 hover:underline">
                    Link Bank Account via ₹1 Penny-Drop →
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Editable Profile Form */}
          <div className="md:col-span-2">
            <Card className="p-6 bg-white border-slate-200">
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">Professional Title *</label>
                  <Input
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Senior Next.js Architect or UI/UX Designer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">Professional Bio *</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 focus:border-saffron-600 focus:outline-none"
                    placeholder="Describe your technical background, past client projects, and domain expertise..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">Hourly Rate (₹ INR) *</label>
                    <Input
                      type="number"
                      value={hourlyRateINR}
                      onChange={(e) => setHourlyRateINR(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">Experience (Years) *</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">Availability Status</label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-saffron-600 focus:outline-none"
                      value={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.value)}
                    >
                      <option value="AVAILABLE">Available for Work</option>
                      <option value="BUSY">Busy / Limited Capacity</option>
                      <option value="NOT_ACCEPTING_WORK">Not Accepting Work</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-navy-900 mb-1">City in India</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-navy-900 mb-1">Primary Skills (Comma separated)</label>
                  <Input
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS, Docker"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="saffron" size="sm" isLoading={isSaving} className="gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
