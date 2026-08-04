import React from 'react'
import Image from 'next/image'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CloudUpload, Search } from 'lucide-react'
import { StepperControl } from '@/components/stepper'
import { Form } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MySelect } from '@/components/forms/myselect.field'
import InputField from '@/components/forms/input.field'
import { DatePicker } from '@/components/forms/date-picker.new'
import MyAlert from '@/components/forms/myAlert'
import UploadImage from '@/components/upload-image'
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { useTextsStore } from '@/stores/types.stores'
import {
  finInfoSchema,
  IFinInfoSchema,
  initialValues,
} from '@/modules/shared/schemas/fin-data.schema'

export type PaymentOption = {
  value: string
  label: string
}

type FinDataProps = {
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  steps: string[]
  handleNext: (values: IFinInfoSchema) => void
  documentNumber: string
  defaultValues?: Partial<IFinInfoSchema>
  paymentOptions: PaymentOption[]
}

type VoucherExampleProps = {
  src: string
  title: string
  description: string
  alt: string
  width: number
  height: number
  thumbnailPosition: string
}

function VoucherExample(props: VoucherExampleProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Ampliar ejemplo: ${props.title}`}
          className="group overflow-hidden rounded-lg border bg-background text-left shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="relative block h-[11.25rem] overflow-hidden">
            <Image
              src={props.src}
              alt=""
              width={props.width}
              height={props.height}
              className="h-full w-full object-cover"
              style={{ objectPosition: props.thumbnailPosition }}
              sizes="(max-width: 768px) 40vw, 160px"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/15 transition-colors group-hover:bg-foreground/25">
              <span className="rounded-full bg-background/90 p-2 shadow-sm">
                <Search className="size-5" aria-hidden="true" />
              </span>
            </span>
          </span>
          <span className="block px-2 py-1.5 text-xs font-medium">{props.title}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <Image
          src={props.src}
          alt={props.alt}
          width={props.width}
          height={props.height}
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
      <p className="text-sm font-medium text-muted-foreground">Haz clic en la lupa para ampliar un ejemplo:</p>
      <div className="grid grid-cols-1 gap-3">
        <VoucherExample
          src="/images/voucher-ejemplo-ventanilla.png"
          title="Pago en ventanilla"
          description="Busca el numero resaltado en el campo DOC."
          alt="Ejemplo ampliado de voucher pagado en ventanilla"
          width={1103}
          height={701}
          thumbnailPosition="center 20%"
        />
        <VoucherExample
          src="/images/voucher-ejemplo-digital.png"
          title="Pago digital"
          description="Busca el numero resaltado en el campo Numero de Recibo."
          alt="Ejemplo ampliado de voucher pagado desde la aplicacion"
          width={1000}
          height={1554}
          thumbnailPosition="center 82%"
        />
      </div>
    </div>
  )
}

export default function FinData({
  activeStep,
  setActiveStep,
  steps,
  handleNext,
  documentNumber,
  defaultValues,
  paymentOptions,
}: FinDataProps) {
  const { data: textos } = useCatalogStore(useTextsStore)
  const form = useForm<IFinInfoSchema>({
    resolver: zodResolver(finInfoSchema),
    defaultValues: {
      pago: defaultValues?.pago ?? initialValues.pago,
      numero_voucher: defaultValues?.numero_voucher ?? initialValues.numero_voucher,
      fecha_pago: defaultValues?.fecha_pago ?? initialValues.fecha_pago,
      img_voucher: defaultValues?.img_voucher ?? initialValues.img_voucher,
    },
  })
  const pago = useWatch({ control: form.control, name: 'pago' })
  const requiresVoucher = Number(pago) > 0

  const onSubmit = (data: IFinInfoSchema) => {
    handleNext(data)
  }

  return (
    <Form {...form}>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 select-none"
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
            <VoucherExamples />
            <div className="flex flex-col gap-4">
              <MySelect
                name="pago"
                control={form.control}
                label="Monto pagado"
                placeholder="Selecciona el monto pagado"
                options={paymentOptions}
              />
              <InputField
                label="Numero de voucher"
                name="numero_voucher"
                disabled={!requiresVoucher}
                control={form.control}
                description="Ingresa solo numeros. Debe tener 15 digitos."
                inputMode="numeric"
                autoComplete="off"
                maxLength={15}
                placeholder="Ingresar su numero de voucher..."
              />
              <DatePicker
                control={form.control}
                name="fecha_pago"
                disabled={!requiresVoucher}
                label="Fecha de Pago"
                description="Seleccione su fecha de pago"
              />
              <MyAlert
                title="Atencion"
                description={textos?.find((item) => item.codigo === 'TEXTO_1_PAGO')?.contenido}
              />
            </div>
            <div className="flex flex-col gap-4">
              <UploadImage
                form={form}
                field="img_voucher"
                label="Voucher de pago"
                dni={documentNumber}
                folder="vouchers"
                disabled={!requiresVoucher}
              />
              <Alert className="mt-4" variant={form.formState.errors.img_voucher ? 'destructive' : 'default'}>
                <AlertTitle>Subida de Archivos</AlertTitle>
                <CloudUpload className="mr-2 h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.img_voucher?.message
                    ?? 'Luego de buscar el archivo se subira al servidor para su revision. Se aceptan formatos *.jpg *.png *.pdf.'}
                </AlertDescription>
              </Alert>
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
