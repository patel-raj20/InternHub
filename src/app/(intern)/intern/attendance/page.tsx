"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Html5Qrcode } from "html5-qrcode";
import { graphqlService } from "@/lib/services/graphql-service";
import { AttendanceRecord } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Scan,
  MapPin,
  CheckCircle2,
  AlertCircle,
  History,
  Clock,
  Navigation,
  CalendarCheck,
  Camera
} from "lucide-react";
import { getLocalDateString } from "@/lib/utils";

export default function InternAttendancePage() {
  const { data: session } = useSession();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const internId = session?.user?.id;

  useEffect(() => {
    if (internId) {
      fetchHistory();
    }
  }, [internId]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const fetchHistory = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const intern = await graphqlService.getInternByUserId(session.user.id);
      if (intern) {
        const records = await graphqlService.getInternAttendance(intern.id);
        setHistory(records);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setResult(null);
    setScanning(true);

    // Give react a tick to render the #reader div
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
      } catch (err: any) {
        console.error("Camera start error:", err);
        setScanning(false);
        const message = err.message || "Could not access camera";
        toast.error(message.includes("permission") ? "Camera permission denied" : message);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();
    setLoading(true);

    // 1. Get Location
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // 2. Submit to API
        try {
          const response = await fetch("/api/attendance/mark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              qr_token: decodedText,
              lat: latitude,
              lng: longitude
            })
          });

          const data = await response.json();

          if (response.ok) {
            setResult({ success: true, ...data });
            toast.success(`Attendance marked as ${data.status}!`);
            fetchHistory();
          } else {
            console.log("[-] Verification failed body content:", data);
            setResult({ success: false, error: data.error });
            toast.error(data.error || "Failed to mark attendance");
          }
        } catch (error) {
          console.error("Submission error:", error);
          toast.error("An error occurred during submission");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        toast.error("Access to location was denied. Please enable GPS.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const onScanFailure = () => {
    // Silent fail for continuous scan attempts
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground">
          Scan the QR code provided by your manager to mark your presence for today.
        </p>
      </div>

      <div className="grid gap-6">
        {!scanning && !result && (
          <Card className="glass-card shadow-2xl border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-primary/5 p-12 flex flex-col items-center justify-center gap-6 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                  <Scan size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Ready to Scan?</h2>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Make sure you're at the office and have your camera permissions ready.
                  </p>
                </div>
                <Button size="lg" onClick={startScanner} className="px-8 shadow-xl shadow-primary/20 font-bold group">
                  Start Scanning
                  <Navigation className="ml-2 h-4 w-4 transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {scanning && (
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scanner Active</CardTitle>
                  <CardDescription>Position the QR code within the frame.</CardDescription>
                </div>
                <Camera className="w-5 h-5 text-primary animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="reader" className="relative rounded-xl overflow-hidden border-2 border-primary/30 min-h-[300px] bg-black/5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-64 h-64 border-2 border-primary border-dashed rounded-lg" />
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={stopScanner}>Cancel Scan</Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="glass-card">
            <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="text-center">
                <p className="font-bold">Verifying your location...</p>
                <p className="text-xs text-muted-foreground">Checking geofence coordinates.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className={`glass-card border-2 ${result.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
            <CardContent className="p-8 flex flex-col items-center text-center gap-6">
              {result.success ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-red-500" />
              )}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  {result.success ? "Attendance Marked!" : "Verification Failed"}
                </h3>
                <p className={`text-sm ${result.success ? 'text-muted-foreground' : 'text-red-500 font-medium'}`}>
                  {result.success
                    ? `Status: ${result.status} at ${new Date(result.check_in_time).toLocaleTimeString()}`
                    : result.error || "Unexpected error occurred"}
                </p>
                {result.success && (
                  <p className="text-xs font-medium text-green-600 bg-green-500/10 px-3 py-1 rounded-full inline-block mt-2">
                    Verified within {result.distance}m of office
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={() => setResult(null)}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Your History</CardTitle>
              <CardDescription>Recent attendance logs</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-primary font-bold">
                      {new Date(record.date).getDate()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.check_in_time).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${record.status === 'PRESENT' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                    {record.status}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-center py-4 text-muted-foreground italic">No history found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
