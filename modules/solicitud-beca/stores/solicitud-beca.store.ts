import { create } from 'zustand';
import ISolicitudBeca from '../interfaces/solicitudbeca.interface';

interface StoreState {
    solicitud: Partial<ISolicitudBeca>; // Use Partial if not all fields are initialized
    setSolicitudField: (field: keyof ISolicitudBeca, value: unknown) => void;
    // Add other state/actions if needed
}

const useSolicitudBecaStore = create<StoreState>((set) => ({
    solicitud: {
        nombres: '',
        apellidos: '',
        telefono: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        facultad: '',
        escuela: '',
        direccion: '',
        codigo: '',
        email: '',
        periodo: '',
        carta_de_compromiso: '',
        historial_academico: '',
        constancia_matricula: '',
        contancia_tercio: '',
        declaracion_jurada: '',
    },
    // Add the missing setSolicitudField function
    setSolicitudField: (field: keyof ISolicitudBeca, value: unknown) => {
        set((state) => ({
            solicitud: {
                ...state.solicitud,
                [field]: value
            }
        }));
    }
    // Add other state/actions if needed
}));

export default useSolicitudBecaStore; // Assuming a default export