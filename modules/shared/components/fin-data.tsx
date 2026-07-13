import React from 'react'
import { finInfoSchema, IFinInfoSchema, initialValues } from '@/modules/shared/schemas/fin-data.schema';
import { useForm } from 'react-hook-form';
import { StepperControl } from '@/components/stepper';
import { zodResolver } from '@hookform/resolvers/zod';
import useSolicitudStore from '@/stores/solicitud.store';
import { useCatalogStore } from '@/hooks/useCatalogStore';
import { useTextsStore } from '@/stores/types.stores';
import { useSearchParams } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudUpload, Search } from 'lucide-react';
import { MySelect } from '@/components/forms/myselect.field';
import InputField from '@/components/forms/input.field';
import { DatePicker } from '@/components/forms/date-picker.new';
import MyAlert from '@/components/forms/myAlert';
import UploadImage from '@/components/upload-image';
import Image from 'next/image';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

type VoucherExampleProps = {
	src: string;
	title: string;
	description: string;
	alt: string;
	width: number;
	height: number;
	thumbnailPosition: string;
}

function VoucherExample({ src, title, description, alt, width, height, thumbnailPosition }: VoucherExampleProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label={`Ampliar ejemplo: ${title}`}
					className="group overflow-hidden rounded-lg border bg-background text-left shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
				>
					<span className="relative block h-[11.25rem] overflow-hidden">
						<Image
							src={src}
							alt=""
							width={width}
							height={height}
							className="h-full w-full object-cover"
							style={{ objectPosition: thumbnailPosition }}
							sizes="(max-width: 768px) 40vw, 160px"
						/>
						<span className="absolute inset-0 flex items-center justify-center bg-foreground/15 transition-colors group-hover:bg-foreground/25">
							<span className="rounded-full bg-background/90 p-2 shadow-sm">
								<Search className="size-5" aria-hidden="true" />
							</span>
						</span>
					</span>
					<span className="block px-2 py-1.5 text-xs font-medium">{title}</span>
				</button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					className="max-h-[72vh] w-full rounded-md object-contain"
					sizes="(max-width: 1024px) 90vw, 896px"
				/>
			</DialogContent>
		</Dialog>
	)
}

function VoucherExamples() {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-muted-foreground text-sm font-medium">Haz clic en la lupa para ampliar un ejemplo:</p>
			<div className="grid grid-cols-1 gap-3">
				<VoucherExample
					src="/images/voucher-ejemplo-ventanilla.png"
					title="Pago en ventanilla"
					description="Busca el número resaltado en el campo DOC."
					alt="Ejemplo ampliado de voucher pagado en ventanilla"
					width={1103}
					height={701}
					thumbnailPosition="center 20%"
				/>
				<VoucherExample
					src="/images/voucher-ejemplo-digital.png"
					title="Pago digital"
					description="Busca el número resaltado en el campo N° Recibo."
					alt="Ejemplo ampliado de voucher pagado desde la aplicación"
					width={1000}
					height={1554}
					thumbnailPosition="center 82%"
				/>
			</div>
		</div>
	)
}

type Props = {
	activeStep: number;
	setActiveStep: React.Dispatch<React.SetStateAction<number>>;
	steps: string[];
	handleNext: (values: IFinInfoSchema) => void;
	precio: string;
}

export default function FinData({ activeStep, setActiveStep, steps, handleNext, precio }: Props) {
	const searchParams = useSearchParams()

	const { data: textos } = useCatalogStore(useTextsStore)
	const [imageVal, setImageVal] = React.useState<boolean>(false)
	const isTrabajador = searchParams.get('trabajador') === 'true'
	const pagos = React.useMemo(() => {
		if (isTrabajador) {
			return [
				{ value: String(Number(precio) - Number(precio) * 0.8), label: `S/${(Number(precio) - Number(precio) * 0.8).toFixed(2)} - presentar certificado de trabajo(docente)` },
				{ value: String(Number(precio) * 0), label: `S/${(Number(precio) * 0).toFixed(2)} - presentar certificado de trabajo(CAS)` },
			]
		}

		return [
			{ value: String(precio), label: `S/${Number(precio).toFixed(2)} - precio normal` }
		]
	}, [isTrabajador, precio])

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

	return (
		<Form {...form}>
			<div className="relative overflow-hidden">
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
				<form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 flex flex-col gap-6 p-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div>
							<VoucherExamples />
						</div>
						<div className="flex flex-col gap-4">
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
								disabled={form.watch('pago') === '0'}
								control={form.control}
								description="Ingresa solo números. Debe tener 15 dígitos."
								inputMode="numeric"
								autoComplete="off"
								maxLength={15}
								placeholder="Ingresar su número de voucher..."
							/>
							<DatePicker
								control={form.control}
								name="fecha_pago"
								disabled={form.watch('pago') === '0'}
								label="Fecha de Pago"
								description="Seleccione su fecha de pago"
							/>
							<MyAlert
								title='Atención'
								description={textos?.find((objeto) => objeto.codigo === 'TEXTO_1_PAGO')?.contenido}
							/>
						</div>
						<div className="flex flex-col gap-4">
							<UploadImage
								form={form}
								field="img_voucher"
								label="Voucher de pago"
								dni={solicitud.dni as string}
								folder="vouchers"
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
					</div>

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
