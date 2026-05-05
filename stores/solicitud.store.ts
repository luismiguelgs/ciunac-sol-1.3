import Isolicitud from '@/modules/shared/interfaces/solicitud.interface'; // Assuming this import exists or is needed
import { create } from 'zustand';

interface StoreState {
    solicitud: Partial<Isolicitud>; // Use Partial if not all fields are initialized
    setSolicitudField: (field: keyof Isolicitud, value: unknown) => void;
    resetSolicitud: () => void;
}

const initialSolicitudState: Partial<Isolicitud> = {
    tipo_solicitud: '',
    antiguo: false,
    apellidos: '',
    nombres: '',
    celular: '',
    direccion: '',
    codigo: '',
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
};

const useSolicitudStore = create<StoreState>((set) => ({
    solicitud: initialSolicitudState,
    setSolicitudField: (field: keyof Isolicitud, value: unknown) => {
        set((state) => ({
            solicitud: {
                ...state.solicitud,
                [field]: value
            }
        }));
    },
    resetSolicitud: () => set({ solicitud: initialSolicitudState }),
}));

export default useSolicitudStore; // Assuming a default export 
