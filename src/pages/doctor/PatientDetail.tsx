import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Mail, Phone, Calendar, FileText, Activity, Heart, AlertTriangle } from 'lucide-react';
import { getInitials, formatDate, calculateAge } from '@/lib/utils';
import { usePatientDiabetesDashboard } from '@/hooks/queries/useDiabetesQueries';
import { DiabetesDashboardView } from '@/components/diabetes/DiabetesDashboardView';
import { EmptyDiabetesState } from '@/components/diabetes/EmptyDiabetesState';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorPatientDetail() {
  const { patientId } = useParams();
  const { data: diabetesDashboard, isLoading: isLoadingDiabetes } = usePatientDiabetesDashboard(patientId);

  // Mock data for patient profile (in real app, use query)
  const patient = {
    id: patientId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    condition: 'Type 2 Diabetes',
    medicalHistory: ['Type 2 Diabetes (2018)', 'Hypertension (2020)'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    cases: [
      { id: '1', title: 'High blood glucose', status: 'open', date: '2024-01-10' },
      { id: '2', title: 'Medication review', status: 'closed', date: '2023-12-15' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/doctor/patients">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Patient Profile</h1>
          <p className="text-muted-foreground">View and manage patient information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(patient.firstName, patient.lastName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mt-4">{patient.firstName} {patient.lastName}</h2>
              <Badge className="mt-2">{patient.condition}</Badge>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              {(isLoadingDiabetes || diabetesDashboard?.has_diabetes_data) && (
                <TabsTrigger value="diabetes">Diabetes</TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-destructive" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.map((condition, index) => (
                      <Badge key={index} variant="secondary">{condition}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Allergies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="bg-warning/10 text-warning border-warning/20">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cases Tab */}
            <TabsContent value="cases">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.cases.map((caseItem) => (
                      <div key={caseItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{caseItem.title}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(caseItem.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={caseItem.status === 'open' ? 'default' : 'secondary'}>
                            {caseItem.status}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/doctor/cases/${caseItem.id}`}>Review</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Diabetes Tab */}
            <TabsContent value="diabetes">
              {isLoadingDiabetes ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : diabetesDashboard?.has_diabetes_data ? (
                <DiabetesDashboardView dashboard={diabetesDashboard} isDoctor />
              ) : (
                <EmptyDiabetesState message={diabetesDashboard?.message} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
