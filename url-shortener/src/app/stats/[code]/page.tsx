// src/app/stats/[code]/page.tsx
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import QRCode from "qrcode";

import { Copy, ExternalLink, QrCode, Calendar, MousePointerClick, Link2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";

interface LinkData {
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function StatsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { success } = useToast();
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Memoize shortUrl — it will never change during the component lifecycle
  const shortUrl = useMemo(() => {
    return `${window.location.origin}/${code}`;
  }, [code]);

  useEffect(() => {
    let isMounted = true;

    async function fetchLink() {
      try {
        const res = await fetch(`/api/links/public/${code}`);
        if (!res.ok) throw new Error("Not found");
        const data: LinkData = await res.json();

        if (!isMounted) return;
        setLink(data);

        // Generate QR code
        const qr = await QRCode.toDataURL(shortUrl, {
          width: 320,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (isMounted) setQrCodeUrl(qr);
      } catch {
        if (isMounted) notFound();
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLink();

    return () => {
      isMounted = false;
    };
  }, [code, shortUrl]); // ← Now safe! shortUrl is memoized

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    success("Copied!", "Short link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!link) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8 text-lg font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Stats Card */}
          <Card className="shadow-2xl border-0">
            <CardHeader className="pb-8">
              <CardTitle className="text-4xl font-bold flex items-center gap-3">
                <Link2 className="w-12 h-12 text-blue-600" />
                Link Stats
              </CardTitle>
              <CardDescription className="text-lg mt-3">
                <code className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-mono text-xl">
                  {shortUrl}
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Short Code</span>
                <div className="flex items-center gap-3">
                  <code className="font-bold text-2xl font-mono">{code}</code>
                  <Button size="sm" onClick={copyToClipboard}>
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center gap-4">
                  <ExternalLink className="w-6 h-6 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Destination URL</p>
                    <a href={link.targetUrl} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:underline break-all text-lg font-medium">
                      {link.targetUrl}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <MousePointerClick className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Clicks</p>
                    <p className="text-4xl font-bold text-green-600">{link.clicks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Last Clicked
                    </p>
                    <p className="font-semibold">
                      {link.lastClicked ? format(new Date(link.lastClicked), "PPP 'at' p") : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Created
                    </p>
                    <p className="font-semibold">{format(new Date(link.createdAt), "PPP")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card className="shadow-2xl border-0 flex flex-col items-center justify-center p-10">
            <CardHeader className="text-center pb-8">
              <QrCode className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
              <CardTitle className="text-2xl">Scan with Phone</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCodeUrl ? (
                <div className="bg-white p-6 rounded-2xl shadow-2xl">
                  <img src={qrCodeUrl} alt="QR Code" className="w-72 h-72" />
                </div>
              ) : (
                <Skeleton className="w-72 h-72 rounded-2xl" />
              )}
              <p className="text-center mt-6 text-gray-600">
                Open camera → point → go!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}