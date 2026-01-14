import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Stethoscope, Mail, Phone, MessageSquare } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function PatientDoctors() {
  // Mock data
  const doctors = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      specialization: 'Endocrinologist',
      email: 'sarah.smith@hospital.com',
      phone: '+1 (555) 123-4567',
      assignedDate: '2024-01-01',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Doctors</h1>
        <p className="text-muted-foreground">Doctors assigned to your care</p>
      </div>

      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-soft transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(doctor.name.split(' ')[1], doctor.name.split(' ')[2])}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">
                        {doctor.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      {doctor.specialization}
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {doctor.email}
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {doctor.phone}
                      </p>
                    </div>
                    <Button className="mt-4" variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No doctors assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">A doctor will be assigned to you soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
