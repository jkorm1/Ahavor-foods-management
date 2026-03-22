"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customer-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  name: string;
  contact: string;
  location: string;
  email: string;
  description: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CustomerForm onSuccess={fetchCustomers} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading customers...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.contact}</TableCell>
                        <TableCell>{customer.location}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
