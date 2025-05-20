import React from 'react';
import { HeartbeatIcon } from './MedicalIcons';
import { AppointmentChat } from './messaging/AppointmentChat';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  description: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface AppointmentTimelineProps {
  appointments: Appointment[];
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({ appointments }) => {
  const getStatusClass = (status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
        return 'badge-primary';
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-destructive';
      default:
        return 'badge-secondary';
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <HeartbeatIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">No appointments yet</h3>
        <p className="text-muted-foreground">
          Schedule your first appointment to start tracking your health journey.
        </p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {appointments.map((appointment, index) => (
        <div key={appointment.id} className="timeline-item">
          <div className="timeline-marker">
            {index + 1}
          </div>
          
          <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div>
                <time className="text-xs text-muted-foreground tracking-wide block mb-1">
                  {appointment.date} at {appointment.time}
                </time>
                <h3 className="text-lg font-medium">
                  {appointment.doctorName}
                </h3>
                <p className="text-primary text-sm font-medium">
                  {appointment.specialty}
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  {appointment.description}
                </p>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2 mt-2 md:mt-0">
                <span className={`badge-pill ${getStatusClass(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                
                {appointment.status === 'upcoming' && (
                  <div className="flex gap-2">
                    <button className="btn-outline py-1 px-3 text-xs">
                      Reschedule
                    </button>
                    <button className="btn-ghost py-1 px-3 text-xs text-destructive hover:bg-destructive/10">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {appointment && (
            <div className="mt-6">
              <AppointmentChat 
                appointmentId={appointment.id} 
                collapsed={appointment.status === 'cancelled'} 
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 