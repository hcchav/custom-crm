"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Pagination from "@/components/tables/Pagination";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Modal from "@/components/ui/modal/Modal"; // You need to have a Modal component

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  property_link: string;
  proposal_1?: string;
  proposal_2?: string;
  proposal_3?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const pageSize = 10;
  const supabase = createClient();

  const fetchLeads = async (currentPage: number) => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      setError("Failed to fetch leads");
      console.error("Supabase fetch error:", error);
    } else {
      setLeads(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      setError(null);
    }
  };

  const handleSave = async (lead: Lead) => {
    const { error } = await supabase
      .from("leads")
      .update({
        proposal_1: lead.proposal_1,
        proposal_2: lead.proposal_2,
        proposal_3: lead.proposal_3,
        status: lead.status,
      })
      .eq("id", lead.id);

    if (error) console.error("Update error:", error);
    else {
      alert("Saved successfully");
      setSelectedLead(null);
      fetchLeads(page);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Leads Management</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="border px-4 py-2">
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td className="border px-4 py-2">{lead.email}</td>
                    <td className="border px-4 py-2">{lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {selectedLead && (
        <Modal title="Edit Lead Details" onClose={() => setSelectedLead(null)}>
          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div key={num}>
                <Label>Proposal {num}</Label>
                <Input
                  value={selectedLead[`proposal_${num}` as keyof Lead] || ""}
                  onChange={(e) =>
                    setSelectedLead({
                      ...selectedLead,
                      [`proposal_${num}`]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <div>
              <Label>Status</Label>
              <select
                className="w-full border rounded px-4 py-2"
                value={selectedLead.status}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, status: e.target.value })
                }
              >
                <option value="new lead">new lead</option>
                <option value="proposals complete">proposals complete</option>
              </select>
            </div>
            <Button onClick={() => handleSave(selectedLead)}>Save</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
