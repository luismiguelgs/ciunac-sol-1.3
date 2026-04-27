import React from 'react'
import { finInfoSchema, IFinInfoSchema, initialValues } from '@/modules/shared/schemas/fin-data.schema';
import { useForm } from 'react-hook-form';
import { StepperControl } from '@/components/stepper';
import { zodResolver } from '@hookform/resolvers/zod';
import useSolicitudStore from '@/stores/solicitud.store';
import useStore from '@/hooks/useStore';
import { useTextsStore } from '@/stores/types.stores';
import { useMask } from '@react-input/mask';
import { useSearchParams } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudUpload } from 'lucide-react';
import { MySelect } from '@/components/forms/myselect.field';
import InputField from '@/components/forms/input.field';
import { DatePicker } from '@/components/forms/date-picker.new';
import MyAlert from '@/components/forms/myAlert';
import UploadImage from '@/components/upload-image';

type Props = {
	activeStep: number;
	setActiveStep: React.Dispatch<React.SetStateAction<number>>;
	steps: string[];
	handleNext: (values: IFinInfoSchema) => void;
	precio: string;
}

export default function FinData({ activeStep, setActiveStep, steps, handleNext, precio }: Props) {
	const searchParams = useSearchParams()

	const textos = useStore(useTextsStore, (state) => state.data)
	const [imageVal, setImageVal] = React.useState<boolean>(false)
	const [pagos, setPagos] = React.useState<{ value: string, label: string }[]>([]);

	const voucherRef = useMask({ mask: '_______________', replacement: { _: /\d/ } });

	const { solicitud } = useSolicitudStore();
	const form = useForm<IFinInfoSchema>({
		resolver: zodResolver(finInfoSchema),
		defaultValues: {
			pago: (solicitud?.pago ?? initialValues.pago) as string,
			numero_voucher: solicitud?.numero_voucher ?? initialValues.numero_voucher,
			fecha_pago: solicitud?.fecha_pago ? new Date(solicitud.fecha_pago) : initialValues.fecha_pago,
			img_voucher: solicitud?.img_voucher ?? initialValues.img_voucher,
		}
	})

	const onSubmit = (data: IFinInfoSchema) => {
		if (form.watch('pago') === '0') {
			handleNext(data);
		} else {
			if (form.getValues('img_voucher') === undefined || form.getValues('img_voucher') === '') {
				setImageVal(true)
				return
			} else {
				setImageVal(false)
				handleNext(data);
			}
		}
	};

	React.useEffect(() => {
		if (searchParams.get('trabajador') === 'true') {
			setPagos([
				{ value: String(Number(precio) - Number(precio) * 0.8), label: `S/${(Number(precio) - Number(precio) * 0.8).toFixed(2)} - presentar certificado de trabajo(docente)` },
				{ value: String(Number(precio) * 0), label: `S/${(Number(precio) * 0).toFixed(2)} - presentar certificado de trabajo(CAS)` },
			])
		} else {
			setPagos([
				{ value: String(precio), label: `S/${Number(precio).toFixed(2)} - precio normal` }
			])
		}
	}, [])

	return (
		<Form {...form}>
			<div className="relative overflow-hidden">
				{/* Fondo inferior izquierdo - solo en el overlay con baja opacidad */}
				<div
					className="absolute inset-0 pointer-events-none select-none"
					style={{
						backgroundImage: 'url(/images/pago.png)',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: 'bottom left',
						backgroundSize: '380px 380px',
						opacity: 0.1,
					}}
				/>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 relative z-10">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<MyAlert
								title='Atención'
								description={textos?.find((objeto) => objeto.codigo === 'TEXTO_1_PAGO')?.contenido}
							/>
						</div>
						<div className="space-y-4">
							<MySelect
								name="pago"
								control={form.control}
								label="Monto pagado"
								placeholder='Selecciona el monto de se necesario'
								options={pagos}
							/>
							<InputField
								label="Número de voucher"
								name="numero_voucher"
								inputRef={voucherRef}
								disabled={form.watch('pago') === '0'}
								control={form.control}
								placeholder="Ingresar su número de voucher..."
							/>
							{/* Fecha de pago */}
							<DatePicker
								control={form.control}
								name="fecha_pago"
								disabled={form.watch('pago') === '0'}
								label="Fecha de Pago"
								description="Seleccione su fecha de pago"
							/>
							{imageVal ? (
								<Alert variant="destructive" className="mt-4">
									<AlertTitle>Subida de Archivos</AlertTitle>
									<CloudUpload className="mr-2 h-4 w-4" />
									<AlertDescription>
										Completar la subida del archivo al servidor. Se aceptan formatos *.jpg *.png *.pdf.
									</AlertDescription>
								</Alert>
							) : (
								<Alert className="mt-4">
									<AlertTitle>Subida de Archivos</AlertTitle>
									<CloudUpload className="mr-2 h-4 w-4" />
									<AlertDescription>
										Luego de buscar el archivo se subirá al servidor para su revisión. Se aceptan formatos
										*.jpg *.png *.pdf.
									</AlertDescription>
								</Alert>
							)}
						</div>
						<div>
							<UploadImage
								form={form}
								field="img_voucher"
								label="Voucher de pago"
								dni={solicitud.dni as string}
								folder="vouchers"
							/>
						</div>

					</div>

					{/* Botones de navegación */}
					<StepperControl
						activeStep={activeStep}
						steps={steps}
						setActiveStep={setActiveStep}
						type="submit"
					/>
				</form>
			</div>
		</Form>
	)
}
