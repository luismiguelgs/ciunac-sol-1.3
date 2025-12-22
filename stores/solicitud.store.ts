import Isolicitud from '@/interfaces/solicitud.interface'; // Assuming this import exists or is needed
import { create } from 'zustand';

interface StoreState {
    solicitud: Partial<Isolicitud>; // Use Partial if not all fields are initialized
    setSolicitudField: (field: keyof Isolicitud, value: unknown) => void;
    // Add other state/actions if needed
}

const useSolicitudStore = create<StoreState>((set) => ({
    solicitud: {
        tipo_solicitud: '', // Initialize with default values as needed
        antiguo: false,
        apellidos: '',
        nombres: '',
        celular: '',
        direccion: '',
        codigo: '', // From your mention
        dni: '',
        facultad: '',
        escuela: '',
        numero_voucher: '',
        fecha_pago: '',
        tipo_documento: 'DNI',
        email: '',
        idioma: '',
        nivel: '1',
        trabajador: false,
        alumno_ciunac: false,
        pago: 0,
        estado: 'NUEVO',
        estudianteId: '',
        img_cert_estudio: '',
        img_dni: '',
        img_voucher: '',
        img_cert_trabajo: '',
        certificado_trabajo: '',
        digital: false,
    },
    // Add the missing setSolicitudField function
    setSolicitudField: (field: keyof Isolicitud, value: unknown) => {
        set((state) => ({
            solicitud: {
                ...state.solicitud,
                [field]: value
            }
        }));
    }
    // Add other state/actions if needed
}));

export default useSolicitudStore; // Assuming a default export 