import { useForm } from "react-hook-form"
import IProgram from "../interfaces/programs.interface"
import { zodResolver } from "@hookform/resolvers/zod"
import { basicInfoSchema, IBasicInfoSchema, initialValues } from "../schemas/basic-info.schema"
import { Form } from "@/components/ui/form"
import { StepperControl } from "@/components/stepper"
import InputField from "@/components/forms/input.field"
import { RadioGroupField } from "@/components/forms/radio-group.field"
import { useMask } from '@react-input/mask';
import { DatePicker } from "@/components/forms/date-picker.new"
import { SelectLanguage } from "@/components/forms/select-lang.field"
import useStore from "../stores/student.store"  // Add this import

type Props = {
    programs : IProgram[]
    activeStep : number
    steps : string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    handleNext: (values:IBasicInfoSchema) => void
}

export default function BasicData({activeStep, handleNext, programs, steps, setActiveStep}:Props) 
{
    const { student } = useStore();  // Add this line
    const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } });
    const dniRef = useMask({ mask: '_________', replacement: { _: /\d/ } });
    const lastNamesRef = useMask({ mask: '______________________________', replacement: { _: /^[a-zA-Z \u00C0-\u00FF]*$/ } })
    const namesRef = useMask({ mask: '_______________________________', replacement: { _: /^[a-zA-Z \u00C0-\u00FF]*$/ } })

    const form = useForm({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: student ? {
            firstLastname: student.Primer_apellido,
            secondLastname: student.Segundo_apellido,
            firstName: student.Primer_nombre,
            secondName: student.Segundo_nombre,
            birth_date: student.Fecha_nacimiento ? new Date(student.Fecha_nacimiento) : undefined,
            phone: student.Telefono,
            code_program: student.Codigo_programa,
            document_type: student.Codigo_tipo_identificacion,
            document: student.Numero_identificacion,
            gender: student.Genero,
        } : initialValues
    })

    const onSubmit = (data:IBasicInfoSchema) => {
        handleNext(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4" autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <InputField
                        label="Primer Apellido"
                        name="firstLastname"
                        inputRef={lastNamesRef}
                        placeholder="Ingresar primer apellido..."
                        control={form.control}
                    />
                    <InputField
                        label="Segundo Apellido"
                        name="secondLastname"
                        inputRef={lastNamesRef}
                        placeholder="Ingresar segundo apellido..."
                        control={form.control}
                    />
                    <InputField
                        label="Primer Nombre"
                        name="firstName"
                        inputRef={namesRef}
                        placeholder="Ingresar primer nombre..."
                        control={form.control}
                    />
                    <InputField
                        label="Segundo Nombre"
                        name="secondName"
                        inputRef={namesRef}
                        placeholder="Ingresar segundo nombre..."
                        control={form.control}
                    />
                    <DatePicker
                        control={form.control}
                        name="birth_date"
                        label="Fecha de Nacimiento"
                        description="Seleccione su fecha de nacimiento"
                    />
                    <InputField
                        name="phone"
                        inputRef={phoneRef}
                        type="tel"
                        control={form.control}
                        description=""
                    />
                    <SelectLanguage
                        control={form.control}
                        name="code_program"
                        programs={programs}
                    />
                    <RadioGroupField
                        label="Tipo de Documento"
                        name="document_type"
                        options={[
                            { value: "PE01", label: "Documento de Identidad" },
                            { value: "PE02", label: "Carnet de Extranjería" },
                        ]}
                        control={form.control}
                    />
                    <InputField
                        label="Número de Documento"
                        name="document"
                        inputRef={dniRef}
                        placeholder="Ingresar número de documento..."
                        control={form.control}
                    />
                     <RadioGroupField
                        label="Género"
                        name="gender"
                        options={[
                            { value: "F", label: "Femenino" },
                            { value: "M", label: "Masculino" },
                        ]}
                        control={form.control}
                    />
                </div>
                
                {/* Botones de navegación */}
                <StepperControl 
                    activeStep={activeStep} 
                    steps={steps} 
                    setActiveStep={setActiveStep}
                    type="submit"
                />
            </form>
        </Form>
    )
}