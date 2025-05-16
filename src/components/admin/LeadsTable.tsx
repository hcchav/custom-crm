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
  // State for storing the list of leads
  const [leads, setLeads] = useState<Lead[]>([]);
  // State for the currently selected lead (for editing)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  // Current page number for pagination
  const [page, setPage] = useState(1);
  // Total number of pages based on filtered results
  const [totalPages, setTotalPages] = useState(1);
  // Error state for displaying error messages
  const [error, setError] = useState<string | null>(null);
  // State to track which filter is currently active
  // null = show all leads
  // "new lead" = show only new leads
  // "proposals complete" = show only leads with completed proposals
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  // Number of leads to show per page
  const pageSize = 10;
  // Initialize Supabase client
  const supabase = createClient();

  // Modified useEffect to watch both page and activeFilter
  useEffect(() => {
    fetchLeads(page);
  }, [page, activeFilter]); // Now runs when either page or filter changes

  // Function to fetch leads with filtering and pagination
  const fetchLeads = async (currentPage: number) => {
    // Calculate the range of leads to fetch based on page number
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query with basic select and ordering
    let query = supabase
      .from("leads")
      .select("*", { count: "exact" }) // Get total count for pagination
      .order("created_at", { ascending: false });

    // If a filter is active, add a where clause to filter by status
    if (activeFilter) {
      query = query.eq("status", activeFilter);
    }

    // Execute the query with pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      setError("Failed to fetch leads");
      console.error("Supabase fetch error:", error);
    } else {
      // Update the leads list with the filtered/paginated results
      setLeads(data || []);
      // Calculate total pages based on filtered results
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

  return (
    <div className="max-w-10xl mx-auto p-6">
      {/* <h1 className="text-2xl font-semibold mb-6"></h1> */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Filter buttons container */}
      <div className="mb-4 flex gap-2">
        {/* When this button is clicked: 
            1. setActiveFilter(null) is called - clears the filter
            2. setPage(1) is called - resets to page 1
            3. setPage(1) triggers useEffect because 'page' changed
            4. useEffect calls fetchLeads(1) with the new filter value */}
        <Button
          variant={activeFilter === null ? "primary" : "outline"}
          onClick={() => {
            setActiveFilter(null);
            // Only reset page if we're not already on page 1
            if (page !== 1) setPage(1);
          }}
        >
          All Leads
        </Button>

        {/* When this button is clicked:
            1. setActiveFilter("new lead") is called - sets filter to new leads
            2. setPage(1) is called - resets to page 1
            3. setPage(1) triggers useEffect because 'page' changed
            4. useEffect calls fetchLeads(1) with the new filter value */}
        <Button
          variant={activeFilter === "new lead" ? "primary" : "outline"}
          onClick={() => {
            setActiveFilter("new lead");
            // Only reset page if we're not already on page 1
            if (page !== 1) setPage(1);
          }}
        >
          New Leads
        </Button>

        {/* When this button is clicked:
            1. setActiveFilter("proposals complete") is called - sets filter to completed proposals
            2. setPage(1) is called - resets to page 1
            3. setPage(1) triggers useEffect because 'page' changed
            4. useEffect calls fetchLeads(1) with the new filter value */}
        <Button
          variant={activeFilter === "proposals complete" ? "primary" : "outline"}
          onClick={() => {
            setActiveFilter("proposals complete");
            // Only reset page if we're not already on page 1
            if (page !== 1) setPage(1);
          }}
        >
          Proposals Complete
        </Button>
      </div>

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
