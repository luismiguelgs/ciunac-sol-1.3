import Student from '../interfaces/student.interface';
import { DocumentType, Gender } from '@/lib/constants';
import { create } from 'zustand';

interface StoreState{
    student: Student;
    setStudentField: (field: keyof Student, value: unknown) => void;
}

const useStore = create<StoreState>((set) => ({
    student: {
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
    },
    setStudentField: (field: keyof Student, value: unknown) => {
        set((state) => ({
            student: {
                ...state.student,
                [field]: value
            }
        }));
    }
}));
export default useStore;