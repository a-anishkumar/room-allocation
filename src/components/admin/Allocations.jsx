// src/components/admin/StudentProfiles.jsx

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../utils/supabase";

// REFACTORED: Import modern UI components and icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"; // A custom advanced table component
import { Badge } from "@/components/ui/badge";
import { Search, Users, UserCheck, UserX } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Define columns for our advanced data table
const columns = [
  { accessorKey: "roll_no", header: "Roll Number" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "year", header: "Year" },
  {
    accessorKey: "can_apply",
    header: "Application Status",
    cell: ({ row }) => {
      const canApply = row.getValue("can_apply");
      return (
        <Badge variant={canApply ? "default" : "destructive"}>
          {canApply ? "Eligible" : "Not Eligible"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "receipt_url", // Assuming a link column
    header: "Documents",
    cell: ({ row }) => (
      <a 
        href={row.getValue("receipt_url")} 
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        View
      </a>
    ),
  },
];

export default function StudentProfiles() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("student_profiles").select("*");
    if (!error) setStudents(data);
    else console.error("Error fetching students:", error);
    setLoading(false);
  };
  
  // Filter logic
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Data for the chart
  const eligibilityData = useMemo(() => {
    const eligible = students.filter(s => s.can_apply).length;
    const notEligible = students.length - eligible;
    return [
      { name: 'Eligible', value: eligible, color: '#22c55e' },
      { name: 'Not Eligible', value: notEligible, color: '#ef4444' },
    ];
  }, [students]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Profiles</h1>
      </div>

      {/* REFACTORED: Stat cards with icons and charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible to Apply</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibilityData[0].value}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibilityData[1].value}</div>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eligibility Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 -mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eligibilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={20} outerRadius={35}>
                    {eligibilityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* REFACTORED: Main data table card */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
          </div>
          <DataTable columns={columns} data={filteredStudents} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}