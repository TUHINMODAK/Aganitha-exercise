"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/components/ToastProvider"; // Correct import
import { Loader2, Link2, Trash2, ExternalLink, Plus } from "lucide-react";

const formSchema = z.object({
  targetUrl: z.string().url({ message: "Please enter a valid URL" }),
  customCode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, _ and - allowed")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface Link {
  _id: string;
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { success, error } = useToast(); // Beautiful helpers
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/links");
      if (res.ok) {
        setLinks(await res.json());
      } else {
        error("Failed to load links", "Please refresh the page");
      }
    } catch {
      error("Network error", "Could not fetch your links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl: data.targetUrl,
          customCode: data.customCode || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to create link");
      }

      success("Short link created!", (
        <div className="flex items-center gap-2">
          <a
            href={`/${result.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-blue-400 underline flex items-center gap-1"
          >
            {window.location.origin}/{result.code} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ));

      reset();
      fetchLinks();
    } catch (err: any) {
      error("Failed to create link", err.message || "Please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Delete this link permanently?")) return;

    try {
      const res = await fetch("/api/links", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        success("Deleted!", "Link removed successfully");
        setLinks(links.filter((link) => link._id !== id));
      } else {
        error("Delete failed", "Could not remove link");
      }
    } catch {
      error("Network error", "Failed to delete link");
    }
  };

  const showStats = (code: string) => {
    router.push(`/code/${code}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-800">
        <Link2 className="w-12 h-12 text-blue-600" />
        My Short Links
      </h1>

      {/* Create Form */}
      <Card className="mb-10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plus className="w-6 h-6" /> Create New Short Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="targetUrl" className="text-lg">Long URL</Label>
              <Input
                id="targetUrl"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                {...register("targetUrl")}
                className={`mt-2 text-lg ${errors.targetUrl ? "border-red-500" : ""}`}
              />
              {errors.targetUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.targetUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customCode" className="text-lg">
                Custom Code (optional) → {baseUrl}/
              </Label>
              <Input
                id="customCode"
                placeholder="my-awesome-link"
                {...register("customCode")}
                className={`mt-2 text-lg ${errors.customCode ? "border-red-500" : ""}`}
              />
              {errors.customCode && (
                <p className="text-sm text-red-600 mt-1">{errors.customCode.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-5 w-5" />
                  Shorten URL
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your Links ({links.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Link2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No links yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short Link</TableHead>
                    <TableHead>Target URL</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead>Last Clicked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    <TableHead className="text-center">stats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link._id} className="hover:bg-gray-50">
                      <TableCell className="font-mono font-semibold">
                        <a
                          href={`/${link.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                          onClick={async (e) => {
                            e.preventDefault();
                            await fetchLinks();
                            window.open(`/${link.code}`, "_blank");
                          }}
                        >
                          {baseUrl}/{link.code} <ExternalLink className="w-4 h-4" />
                        </a>
                      </TableCell>
                      <TableCell className="max-w-md truncate" title={link.targetUrl}>
                        {link.targetUrl}
                      </TableCell>
                      <TableCell className="text-center font-bold text-lg">
                        {link.clicks}
                      </TableCell>
                      <TableCell>
                        {link.lastClicked
                          ? format(new Date(link.lastClicked), "MMM d, yyyy • h:mm a")
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLink(link._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 rounded-full"
                          onClick={() => { showStats(link.code) }}
                        >
                          Stats
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}