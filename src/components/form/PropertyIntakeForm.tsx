"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PropertyIntakeForm() {
  const [formData, setFormData] = useState({
    property_link: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const { error } = await supabase.from("leads").insert({
      property_link: formData.property_link,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      status: "new lead",
      proposal_1: "",
      proposal_2: "",
      proposal_3: "",
    });

    if (error) {
      console.error("Supabase error:", error); // ✅ More helpful
    } else {
      alert("Lead submitted successfully");
    }
  } catch (err) {
    console.error("Submission failed:", err); // ✅ Catch runtime issues
  }
};


  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center text-green-600 font-semibold">
        Thank you! Your property has been submitted.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-lg mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Property Information Form</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We’ll send you 3 property management proposals within 3 days.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>Property Address or Web Link</Label>
          <Input
            name="property_link"
            type="text"
            placeholder="https://airbnb.com/..."
            value={formData.property_link}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              name="first_name"
              type="text"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              name="last_name"
              type="text"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="sm">
          Submit Property Details
        </Button>
      </form>
    </div>
  );
}
