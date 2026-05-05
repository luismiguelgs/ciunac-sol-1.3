import Student from '@/modules/solicitud-nuevo/interfaces/student.interface';
import { DocumentType, Gender } from '@/lib/constants';
import { create } from 'zustand';

interface StoreState{
    student: Student;
    setStudentField: (field: keyof Student, value: unknown) => void;
    resetStudent: () => void;
}

const initialStudentState: Student = {
    Codigo_estudiante: '',
    Primer_apellido: '',
    Segundo_apellido: '',
    Primer_nombre: '',
    Segundo_nombre: '',
    Email: '',
    Codigo_tipo_identificacion: DocumentType.PE01,
    Numero_identificacion: '',
    Genero: Gender.M,
    Fecha_nacimiento: '',
    Telefono: '',
    Celular: '',
    Lugar_nacimiento: '',
    Direccion: '',
    Lugar_residencia: '',
    Codigo_programa: '',
};

const useStore = create<StoreState>((set) => ({
    student: initialStudentState,
    setStudentField: (field: keyof Student, value: unknown) => {
        set((state) => ({
            student: {
                ...state.student,
                [field]: value
            }
        }));
    },
    resetStudent: () => set({ student: initialStudentState }),
}));
export default useStore;

