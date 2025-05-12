{appointment.status === 'completed' && (
  <Link 
    href={`/doctor/prescriptions/new?patient_id=${appointment.patient_id}&appointment_id=${appointment.id}`}
    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 gap-2"
  >
    <FileText className="h-4 w-4" />
    Create Prescription
  </Link>
)} 