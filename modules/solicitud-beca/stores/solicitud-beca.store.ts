import { create } from 'zustand';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';

interface StoreState {
    solicitud: Partial<ISolicitudBeca>; // Use Partial if not all fields are initialized
    setSolicitudField: (field: keyof ISolicitudBeca, value: unknown) => void;
    resetSolicitud: () => void;
}

const initialSolicitudBecaState: Partial<ISolicitudBeca> = {
    nombres: '',
    apellidos: '',
    telefono: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    facultad: '',
    facultadId: '',
    escuela: '',
    escuelaId: '',
    direccion: '',
    codigo: '',
    email: '',
    periodo: '',
    carta_de_compromiso: '',
    historial_academico: '',
    constancia_matricula: '',
    contancia_tercio: '',
    declaracion_jurada: '',
};

const useSolicitudBecaStore = create<StoreState>((set) => ({
    solicitud: initialSolicitudBecaState,
    setSolicitudField: (field: keyof ISolicitudBeca, value: unknown) => {
        set((state) => ({
            solicitud: {
                ...state.solicitud,
                [field]: value
            }
        }));
    },
    resetSolicitud: () => set({ solicitud: initialSolicitudBecaState }),
}));

export default useSolicitudBecaStore; // Assuming a default export

