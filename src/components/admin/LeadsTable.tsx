"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Pagination from "@/components/tables/Pagination";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
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

  const handleSave = async () => {
    if (!selectedLead) return;

    const { error } = await supabase
      .from("leads")
      .update({
        proposal_1: selectedLead.proposal_1,
        proposal_2: selectedLead.proposal_2,
        proposal_3: selectedLead.proposal_3,
        status: selectedLead.status,
      })
      .eq("id", selectedLead.id);

    if (selectedLead.status === "proposals complete") {
    await fetch("/api/send-proposal-email", {
        method: "POST",
        body: JSON.stringify({
        to: selectedLead.email,
        first_name: selectedLead.first_name,
        proposal_1: selectedLead.proposal_1,
        proposal_2: selectedLead.proposal_2,
        proposal_3: selectedLead.proposal_3,
        }),
        headers: { "Content-Type": "application/json" },
    });
    }


    if (error) console.error("Update error:", error);
    else {
      setSelectedLead(null);
      fetchLeads(page);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  return (
    <div className="max-w-10xl mx-auto p-6">
      {/* <h1 className="text-2xl font-semibold mb-6"></h1> */}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location / Link</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    {/* <TableCell className="px-4 py-2 text-start">{lead.id}</TableCell> */}
                    <TableCell className="px-4 py-2 text-start">{lead.property_link}</TableCell>
                    <TableCell className="px-4 py-2 text-start">{lead.first_name} {lead.last_name}</TableCell>
                    <TableCell className="px-4 py-2 text-start">{lead.email}</TableCell>
                    <TableCell className="px-4 py-2 text-start">{lead.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)}>
        {selectedLead && (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Edit Lead</h2>

            {[1, 2, 3].map((num) => (
              <div key={num}>
                <Label>Proposal {num}</Label>
                <Input
                  value={selectedLead[`proposal_${num}` as keyof Lead] || ""}
                  onChange={(e) =>
                    setSelectedLead((prev) =>
                      prev ? { ...prev, [`proposal_${num}`]: e.target.value } : prev
                    )
                  }
                />
              </div>
            ))}

            <div>
              <Label>Status</Label>
              <select
                className="w-full border px-4 py-2 rounded"
                value={selectedLead.status}
                onChange={(e) =>
                  setSelectedLead((prev) =>
                    prev ? { ...prev, status: e.target.value } : prev
                  )
                }
              >
                <option value="new lead">new lead</option>
                <option value="proposals complete">proposals complete</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
