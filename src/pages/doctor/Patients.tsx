import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Users, Search, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const patients = [
    { id: '1', name: 'John Doe', email: 'john@example.com', condition: 'Type 2 Diabetes', lastVisit: '2 days ago', casesCount: 3, status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', condition: 'Type 1 Diabetes', lastVisit: '1 week ago', casesCount: 2, status: 'active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', condition: 'Prediabetes', lastVisit: '2 weeks ago', casesCount: 1, status: 'inactive' },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Patients</h1>
          <p className="text-muted-foreground">{patients.length} patients assigned to you</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-soft transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(patient.name.split(' ')[0], patient.name.split(' ')[1])}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{patient.name}</h3>
                    <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                      {patient.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{patient.condition}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last visit: {patient.lastVisit}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {patient.casesCount} cases
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/doctor/patients/${patient.id}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
