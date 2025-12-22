import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { basicInfoSchema, IBasicInfoSchema, initialValues } from "../schemas/basic-data.schema"
import { Form } from "@/components/ui/form"
import { StepperControl } from "@/components/stepper"
import InputField from "@/components/forms/input.field"
import { RadioGroupField } from "@/components/forms/radio-group.field"
import { useMask } from '@react-input/mask';
import useStore from "../stores/solicitud-beca.store"
import SelectFacultad from "@/components/forms/select-facultad.field"
import { MySelect } from "@/components/forms/myselect.field"
import React from "react" // Importa React para useEffect
import useEscuelas from "@/hooks/useEscuelas"

type Props = {
    activeStep : number
    steps : string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    handleNext: (values:IBasicInfoSchema) => void
}

export default function BasicData({activeStep, handleNext, steps, setActiveStep}:Props)
{
    const { solicitud } = useStore();
    const escuelas = useEscuelas()
    const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } });
    const codeRef = useMask({ mask: '__________', replacement: { _: /\d/ } });
    const dniRef = useMask({ mask: '_________', replacement: { _: /\d/ } });
    const lastNamesRef = useMask({ mask: '______________________________', replacement: { '_': /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })
    const namesRef = useMask({ mask: '_______________________________', replacement: { '_': /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })

    const form = useForm<IBasicInfoSchema>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            apellidos: solicitud?.apellidos ?? initialValues.apellidos,
            nombres: solicitud?.nombres ?? initialValues.nombres,
            facultad: solicitud?.facultad ?? initialValues.facultad,
            escuela: solicitud?.escuela ?? initialValues.escuela,
            codigo: solicitud?.codigo ?? initialValues.codigo,
            tipo_documento: solicitud?.tipo_documento ? solicitud.tipo_documento : initialValues.tipo_documento,
            direccion: solicitud?.direccion ?? initialValues.direccion,
            dni: solicitud.numero_documento ?? initialValues.dni,
            celular: solicitud.telefono ?? initialValues.celular,
        }
    })

    // 1. Observa el valor del campo 'facultad'
    const selectedFacultad = form.watch("facultad");

    // 2. Filtra las escuelas basadas en la facultad seleccionada
    const filteredEscuelas = React.useMemo(() => {
        if (!selectedFacultad) {
            return []; // Si no hay facultad seleccionada, no mostrar escuelas
        }
        // Asume que cada escuela en ESCUELAS tiene una propiedad 'facultad' que coincide con el 'value' de la facultad
        return escuelas?.filter(escuela => escuela.facultadId === Number(selectedFacultad));
    }, [selectedFacultad, escuelas]);

    // 3. Opcional: Resetea el campo 'escuela' cuando cambia la facultad
    React.useEffect(() => {
        // Solo resetea si la facultad cambia y no es la carga inicial
        if (selectedFacultad !== (solicitud?.facultad ?? initialValues.facultad)) {
             form.resetField("escuela"); // O form.setValue("escuela", '') si prefieres
        }
    }, [selectedFacultad, form, solicitud?.facultad]);


    const onSubmit = (data:IBasicInfoSchema) => {
        //alert(JSON.stringify(data))
        handleNext(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4" autoComplete="off">
                {/* Modifica la clase 'gap' para aumentar el espacio vertical */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                    <InputField
                        label="Apellidos"
                        name="apellidos"
                        inputRef={lastNamesRef}
                        placeholder="Ingresar primer y segundo apellido..."
                        control={form.control}
                    />
                    <InputField
                        label="Nombres"
                        name="nombres"
                        inputRef={namesRef}
                        placeholder="Ingresar nombres..."
                        control={form.control}
                    />
                    <SelectFacultad 
                        name="facultad"
                        control={form.control}
                    />
                    {/* 4. Pasa las escuelas filtradas al componente MySelect */}
                    <MySelect
                        name="escuela"
                        control={form.control}
                        label="Escuela"
                        placeholder={selectedFacultad ? "Selecciona una escuela" : "Selecciona una facultad primero"}
                        options={filteredEscuelas} // Usa las escuelas filtradas
                        disabled={!selectedFacultad} // Deshabilita si no hay facultad seleccionada
                        getOptionValue={(item) => String(item.id)}
                        getOptionLabel={(item) => item.nombre}
                    />
                    <InputField
                        label="Código"
                        name="codigo"
                        inputRef={codeRef}
                        placeholder="Ingresar código..."
                        control={form.control}
                    />
                    <InputField
                        label="Dirección"
                        name="direccion"
                        placeholder="Ingresar dirección..."
                        control={form.control}
                    />
                    <InputField
                        name="celular"
                        inputRef={phoneRef}
                        type="tel"
                        control={form.control}
                        description=""
                    />
                    <RadioGroupField
                        label="Tipo de Documento"
                        name="tipo_documento"
                        options={[
                            { value: "DNI", label: "Documento de Identidad (DNI)" },
                            { value: "CE", label: "Carnet de Extranjería" },
                            { value: "PASAPORTE", label: "Pasaporte" },
                        ]}
                        control={form.control}
                    />
                    <InputField
                        label="Número de Documento de Identidad"
                        name="dni"
                        inputRef={dniRef}
                        placeholder="Ingresar número de documento de identidad..."
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