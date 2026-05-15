import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Stethoscope, Hospital, Calendar, Users } from "lucide-react";

const stats = [
  {
    title: "Partner Hospitals",
    value: "156",
    change: "+8 this month",
    icon: Hospital,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Registered Doctors",
    value: "2,345",
    change: "+45 new",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Appointments Today",
    value: "567",
    change: "+12% from yesterday",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Consultations",
    value: "1,234",
    change: "This week",
    icon: Stethoscope,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const hospitals = [
  {
    id: "HS001",
    name: "City General Hospital",
    type: "Multi-Specialty",
    status: "verified",
    doctors: 89,
    appointments: 234,
    revenue: "$45,230",
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
  },
  {
    id: "HS002",
    name: "HealthCare Clinic",
    type: "Specialty Clinic",
    status: "verified",
    doctors: 34,
    appointments: 156,
    revenue: "$28,920",
    specialties: ["Dermatology", "Pediatrics"],
  },
  {
    id: "HS003",
    name: "MediCenter Plus",
    type: "Diagnostic Center",
    status: "pending",
    doctors: 23,
    appointments: 0,
    revenue: "$0",
    specialties: ["Radiology", "Pathology"],
  },
];

export function HospitalDoctors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hospital & Doctor Portal</h1>
        <p className="text-gray-500 mt-1">
          Manage hospitals, doctors, appointments, and consultations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Hospitals & Clinics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                      <Badge
                        variant={
                          hospital.status === "verified"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {hospital.status}
                      </Badge>
                      <Badge variant="outline">{hospital.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {hospital.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Registered Doctors</p>
                        <p className="font-medium">{hospital.doctors}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Appointments</p>
                        <p className="font-medium">{hospital.appointments}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium text-green-600">{hospital.revenue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
