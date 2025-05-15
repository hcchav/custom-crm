
import ComponentCard from "@/components/common/ComponentCard";
import LeadsTable from "@/components/admin/LeadsTable";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function page() {
  return (
       <div className="col-span-12">
         <ComponentCard    title="Lead Management"
            desc=""
          >

                <LeadsTable />

          </ComponentCard>
            
          </div>
  );
}
