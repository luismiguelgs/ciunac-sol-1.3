import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { basicInfoSchema, IBasicInfoSchema, initialValues } from "../schemas/basic-data.schema"
import { Form } from "@/components/ui/form"
import { StepperControl } from "@/components/stepper"
import InputField from "@/components/forms/input.field"
import { RadioGroupField } from "@/components/forms/radio-group.field"
import { useMask } from '@react-input/mask';
import SelectFacultad from "@/components/forms/select-facultad.field"
import { MySelect } from "@/components/forms/myselect.field"
import { NIVEL } from "@/lib/constants" // Asumiendo que ESCUELAS tiene { value: string, label: string, facultad: string }[]
import React from "react" // Importa React para useEffect
import SelectSolicitud from "@/components/forms/select-solicitud"
import { SelectLanguage } from "@/components/forms/select-lang.field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SwithField from "@/components/forms/switch.field"
import useSolicitudStore from "@/stores/solicitud.store"
import MyAlert from "@/components/forms/myAlert"
import useStore from "@/hooks/useStore"
import { useTextsStore } from "@/stores/types.stores"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import EstudiantesService from "@/services/estudiantes.service"
import { IEscuela } from "@/interfaces/types.interface"
import useEscuelas from "@/hooks/useEscuelas"

type Props = {
    activeStep : number
    steps : string[]
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
    handleNext: (values:IBasicInfoSchema) => void
}

export default function BasicData({activeStep, handleNext, steps, setActiveStep}:Props)
{
    const textos = useStore(useTextsStore, (state) => state.textos);

    const { solicitud } = useSolicitudStore()
    const escuelas = useEscuelas()
    const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } });
    const codeRef = useMask({ mask: '__________', replacement: { _: /\d/ } });
    const dniRef = useMask({ mask: '_________', replacement: { _: /[\da-zA-Z]/ } });
    const lastNamesRef = useMask({ mask: '______________________________', replacement: { _: /^[a-zA-Z \u00C0-\u00FF]*$/ } })
    const namesRef = useMask({ mask: '_______________________________', replacement: { _: /^[a-zA-Z \u00C0-\u00FF]*$/ } })

    const form = useForm<IBasicInfoSchema>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            tipo_solicitud: solicitud?.tipo_solicitud?? initialValues.tipo_solicitud,
            idioma: solicitud?.idioma?? initialValues.idioma,
            nivel: solicitud?.nivel?? initialValues.nivel,
            apellidos: solicitud?.apellidos ?? initialValues.apellidos,
            nombres: solicitud?.nombres ?? initialValues.nombres,
            facultad: solicitud?.facultad ?? initialValues.facultad,
            escuela: solicitud?.escuela ?? initialValues.escuela,
            codigo: solicitud?.codigo ?? initialValues.codigo,
            tipo_documento: solicitud?.tipo_documento ?? initialValues.tipo_documento,
            dni: solicitud.dni ?? initialValues.dni,
            celular: solicitud.celular ?? initialValues.celular,
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
        return escuelas?.filter((escuela:IEscuela) => escuela.facultadId === Number(selectedFacultad));
    }, [selectedFacultad]);

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

    const [searching, setSearching] = React.useState(false)

    const handleSearch = async () => {
        const dni = form.getValues('dni')?.trim()
        if (!dni) {
            // Puedes reemplazar por un toast si lo tienes disponible
            alert('Ingrese el número de documento para buscar')
            return
        }
        try {
            setSearching(true)
            const data = await EstudiantesService.fetchItemByDNI(dni)
            if (data) {
                form.setValue('apellidos', data.apellidos ?? '')
                form.setValue('nombres', data.nombres ?? '')
                form.setValue('celular', data.celular ?? '')
                form.setValue('estudianteId', data.id ?? '')
            } else {
                alert('No se encontraron datos para el documento ingresado')
            }
        } catch (e) {
            console.error(e)
            alert('Ocurrió un error al buscar los datos')
        } finally {
            setSearching(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 gap-6">
                    <MyAlert 
                        title="Atención" 
                        description={textos?.find(objeto=> objeto.codigo === 'TEXTO_1_BASICO')?.contenido}
                        type="warning"
                    />
                    {/* Card 1: Información Solicitud - Ocupa todo el ancho con 3 columnas */}
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-primary">Información Solicitud</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <SelectSolicitud
                                    name="tipo_solicitud"
                                    control={form.control}
                                />
                                <SelectLanguage
                                    name="idioma"
                                    control={form.control}
                                />
                                <div style={{'paddingTop':-2}}>
                                    <MySelect
                                        name="nivel"
                                        control={form.control}
                                        label="Nivel"
                                        description="Selecciona tu nivel de idioma"
                                        placeholder='Selecciona un nivel'
                                        options={NIVEL}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Card 2: Información Personal - Ocupa todo el ancho con 3 columnas */}
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-primary">Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                        label="Número de Documento"
                                        name="dni"
                                        inputRef={dniRef}
                                        placeholder="Ingresar número de documento..."
                                        control={form.control}
                                    />
                                    <Button type="button" onClick={handleSearch} disabled={searching} className="md:mt-9">
                                        {searching ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Buscar Documento de Identidad
                                            </>
                                        )}
                                    </Button>
                                
                                
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <input type="hidden" {...form.register('estudianteId')} />
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
                                
                                {/* Celda vacía para mantener la estructura de 3 columnas */}
                                <InputField
                                    label="Celular"
                                    name="celular"
                                    inputRef={phoneRef}
                                    type="tel"
                                    control={form.control}
                                    description=""
                                />
                            </div>
                            
                        </CardContent>
                    </Card>

                    {/* Card 2: Información Académica - Ocupa todo el ancho y está debajo */}
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex items-center justify-between">
                        <div className="w-full sm:w-1/2">
                            <CardTitle className="text-lg font-bold text-primary">
                                Información Académica
                            </CardTitle>
                        </div>
                        <div className="w-full sm:w-1/2 flex justify-end">
                            <SwithField
                                label="Marcar si es usted Alumno UNAC"
                                name="estudiante"
                                control={form.control}
                            />
                        </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <SelectFacultad 
                                    name="facultad"
                                    disabled={!form.watch("estudiante")}
                                    control={form.control}
                                />
                                <MySelect
                                    name="escuela"
                                    control={form.control}
                                    label="Escuela"
                                    placeholder={selectedFacultad ? "Selecciona una escuela" : "Selecciona una facultad primero"}
                                    options={filteredEscuelas}
                                    disabled={!selectedFacultad}
                                    getOptionValue={(item:IEscuela) => String(item.id)}
                                    getOptionLabel={(item:IEscuela) => item.nombre}
                                />
                                <InputField
                                    label="Código"
                                    name="codigo"
                                    disabled={!form.watch("estudiante")}
                                    inputRef={codeRef}
                                    placeholder="Ingresar código..."
                                    control={form.control}
                                />
                            </div>
                        </CardContent>
                    </Card>
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