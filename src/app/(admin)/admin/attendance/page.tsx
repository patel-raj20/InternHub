"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { graphqlService } from "@/lib/services/graphql-service";
import { AttendanceSettings, AttendanceRecord } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { 
  MapPin, 
  Settings as SettingsIcon, 
  QrCode, 
  History, 
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocalDateString } from "@/lib/utils";

export default function ManagerAttendancePage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("qr");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const deptId = session?.user?.department_id;

  const qrToken = useMemo(() => {
    if (!deptId || !settings) return "";
    const today = getLocalDateString();
    const version = settings.updated_at 
      ? new Date(settings.updated_at).getTime().toString().slice(-6) 
      : "000000";
    return `ATT|${deptId}|${today}|${version}`;
  }, [deptId, settings]);

  const rotateQR = async () => {
    if (!deptId) return;
    try {
      const currentSettings = settings || {
        department_id: deptId,
        office_lat: 0,
        office_lng: 0,
        allowed_radius_meters: 100,
        work_start_time: "09:00",
        late_threshold_minutes: 15
      };

      await graphqlService.upsertAttendanceSettings({
        ...currentSettings,
        updated_at: new Date().toISOString()
      });
      
      await fetchData();
      toast.success("QR Code rotated and synchronized");
    } catch (error) {
      console.error("Rotation error:", error);
      toast.error("Telemetry error: QR rotation failed");
    }
  };

  useEffect(() => {
    if (deptId) {
      fetchData();
    }
  }, [deptId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = getLocalDateString();
      const [settingsData, recordsData] = await Promise.all([
        graphqlService.getAttendanceSettings(deptId!),
        graphqlService.getDailyAttendanceReport(deptId!, today)
      ]);
      setSettings(settingsData);
      setRecords(recordsData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newSettings: Partial<AttendanceSettings> = {
      department_id: deptId!,
      office_lat: parseFloat(formData.get("lat") as string),
      office_lng: parseFloat(formData.get("lng") as string),
      allowed_radius_meters: parseInt(formData.get("radius") as string),
      work_start_time: formData.get("start_time") as string,
      late_threshold_minutes: parseInt(formData.get("late_threshold") as string),
    };

    try {
      await graphqlService.upsertAttendanceSettings(newSettings);
      toast.success("Settings updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Update input fields manually or via state if bound
        const latInput = document.getElementById("lat") as HTMLInputElement;
        const lngInput = document.getElementById("lng") as HTMLInputElement;
        if (latInput) latInput.value = latitude.toString();
        if (lngInput) lngInput.value = longitude.toString();
        toast.success("Current location captured");
      },
      () => {
        toast.error("Unable to retrieve your location");
      }
    );
  };

  if (loading && !settings) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isExpired = qrToken && (qrToken.split("|")[2] || qrToken.split(":")[2]) !== getLocalDateString();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">
          Manage daily attendance, configure office location, and track intern presence.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode size={16} /> QR Code
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} /> Records
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon size={16} /> Settings
          </TabsTrigger>
        </TabsList>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <CardTitle>Daily QR Code</CardTitle>
                <CardDescription>
                  Interns should scan this QR code to mark their attendance for today ({new Date().toDateString()}).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-12 gap-6 bg-white/5">
                {qrToken ? (
                  <div className="relative p-8 bg-white rounded-2xl shadow-2xl border-4 border-primary/20">
                    <QRCodeSVG 
                      value={qrToken} 
                      size={256} 
                      level="H"
                      includeMargin={true}
                      className={isExpired ? "opacity-20 grayscale" : ""}
                    />
                    {isExpired && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 backdrop-blur-[2px] rounded-xl">
                        <AlertTriangle className="h-12 w-12 text-red-600 animate-bounce" />
                        <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                          Expired
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-500">Failed to generate token</div>
                )}
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                       <p className="text-sm font-medium">Point your camera here</p>
                       {isExpired && (
                         <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 animate-pulse">
                           <AlertTriangle size={10} /> Needs Refresh
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono bg-muted/50 px-2 py-1 rounded">
                      {qrToken || "Generating..." }
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={rotateQR}
                    className="gap-2"
                  >
                    <RefreshCw size={14} /> Refresh QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Today's Overview</CardTitle>
                <CardDescription>Quick summary of attendance status for today.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600 font-medium">Present</p>
                    <p className="text-3xl font-bold">{records.filter(r => r.status === 'PRESENT').length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-600 font-medium">Late</p>
                    <p className="text-3xl font-bold">{records.filter(r => r.status === 'LATE').length}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Scans</h3>
                  <div className="space-y-3">
                    {records.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {record.intern?.user.first_name[0]}{record.intern?.user.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{record.intern?.user.first_name} {record.intern?.user.last_name}</p>
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
                        <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                          record.status === 'PRESENT' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {record.status}
                        </div>
                      </div>
                    ))}
                    {records.length === 0 && (
                      <p className="text-sm text-center py-6 text-muted-foreground italic">No records for today yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>View all intern attendance records for today.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-4 text-left font-medium">Intern</th>
                      <th className="p-4 text-left font-medium">Time</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{record.intern?.user.first_name} {record.intern?.user.last_name}</div>
                          <div className="text-xs text-muted-foreground italic">{record.intern?.user.email}</div>
                        </td>
                        <td className="p-4">
                          {new Date(record.check_in_time).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            record.status === 'PRESENT' 
                              ? 'bg-green-100 text-green-700' 
                              : record.status === 'LATE'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status === 'PRESENT' && <CheckCircle size={12} />}
                            {record.status === 'LATE' && <Clock size={12} />}
                            {record.status === 'ABSENT' && <XCircle size={12} />}
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4">{record.distance_meters}m</td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                          No attendance records found for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="glass-card max-w-2xl">
            <CardHeader>
              <CardTitle>Attendance Configuration</CardTitle>
              <CardDescription>Define the geofence and timing rules for your department.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Office Latitude</Label>
                    <div className="relative">
                      <Input id="lat" name="lat" defaultValue={settings?.office_lat} required placeholder="e.g. 19.076" />
                      <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Office Longitude</Label>
                    <div className="relative">
                      <Input id="lng" name="lng" defaultValue={settings?.office_lng} required placeholder="e.g. 72.877" />
                      <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-start">
                  <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation} className="gap-2">
                    <MapPin size={14} /> Get My Current Location
                  </Button>
                </div>

                <hr className="border-border/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="radius">Allowed Radius (Meters)</Label>
                    <Input id="radius" name="radius" type="number" defaultValue={settings?.allowed_radius_meters || 100} required />
                    <p className="text-[10px] text-muted-foreground">Maximum distance from office allowed for a valid scan.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Shift Start Time</Label>
                    <Input id="start_time" name="start_time" type="time" defaultValue={settings?.work_start_time || "09:00"} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="late_threshold">Late Threshold (Minutes)</Label>
                    <Input id="late_threshold" name="late_threshold" type="number" defaultValue={settings?.late_threshold_minutes || 15} required />
                    <p className="text-[10px] text-muted-foreground">Grace period before being marked as LATE.</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="px-8 shadow-lg shadow-primary/20">Save Settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
